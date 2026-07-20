# Multi-pays sur MySQL — Plan 1 : Fondations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the multi-tenancy foundation (Site model, domain-based resolution, `siteId` scoping for categories/auth/listings/professionals) from scratch against the current MySQL-based `main` — the original Postgres-era implementation is permanently parked and superseded by this plan.

**Architecture:** Same design as the original attempt: one deployment, multiple domains. `middleware.ts` (this project never renamed it to `proxy.ts`) resolves the active `Site` by hostname and injects `x-site-id`; `lib/site.ts::getCurrentSite()` reads it server-side. Expand-then-contract migration, run via plain `npx prisma migrate dev` — this MySQL database has a clean, fully-tracked migration history (confirmed during the MySQL migration project) and does not need the Postgres-era shadow-database workaround.

**Tech Stack:** Next.js 16, Prisma 6, MySQL 8 (OVH), no automated test framework — verification is `npx tsc --noEmit` + manual checks, same pattern as both prior chantiers this session.

## Global Constraints

- Every step must leave the live site (now on MySQL, `1000clic.fr`) working identically — no step is "done" until verified.
- `SiteSettings` stays untouched and global for now (not merged into `Site`) — explicit scope decision, see spec.
- Marketing/legal pages, theming, and Stripe metadata are out of scope — same deferral as the original attempt.
- Read-path filtering of `Listing`/`Professional` for *public-facing* pages is out of scope for this plan — Plan 2 (a separate plan, not yet written) covers admin-facing scoping, which is what actually delivers the country selector the user wants to see.
- Reference spec: `docs/superpowers/specs/2026-07-20-multi-pays-mysql-design.md`.
- **Work happens in a fresh, isolated worktree/branch** — the live production site must not be touched until this plan is fully reviewed and the user explicitly decides to deploy it (same discipline as both prior chantiers this session, but doubly important now since production is live and was already touched by mistake once this session).
- **Environment variables**: `.env.local` is not auto-loaded by bare `npx prisma`/`npx tsx` commands — `set -a && source .env.local && set +a` first. `npm run dev`/`build` load it automatically via Next.js.

---

### Task 1: Prisma schema — `Site` model + nullable `siteId` columns (expand step)

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Site` model (`id`, `domain`, `name`, `country`, `primaryColor`, `secondaryColor`, `active`, `createdAt`, `updatedAt`). `Category.siteId`, `Listing.siteId`, `Professional.siteId`, `User.siteId` — all nullable `String?` at this step.

- [ ] **Step 1: Add the `Site` model**

In `prisma/schema.prisma`, add this new model directly above `model User {` (line 11):

```prisma
model Site {
  id             String   @id @default(cuid())
  domain         String   @unique
  name           String
  country        String
  primaryColor   String   @default("#F97316")
  secondaryColor String   @default("#12122A")
  active         Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  categories    Category[]
  listings      Listing[]
  professionals Professional[]
  users         User[]
}

```

- [ ] **Step 2: Add nullable `siteId` to `User`**

Find (in `model User`, starts line 11):
```prisma
model User {
  id               String        @id @default(cuid())
  name             String
```
Replace with:
```prisma
model User {
  id               String        @id @default(cuid())
  siteId           String?
  site             Site?         @relation(fields: [siteId], references: [id])
  name             String
```
Find the model's closing (after `professional     Professional?`):
```prisma
  professional     Professional?
}
```
Replace with:
```prisma
  professional     Professional?

  @@index([siteId])
}
```

- [ ] **Step 3: Add nullable `siteId` to `Listing`**

Find (in `model Listing`, starts line 34):
```prisma
model Listing {
  id             String         @id @default(cuid())
  title          String
```
Replace with:
```prisma
model Listing {
  id             String         @id @default(cuid())
  siteId         String?
  site           Site?          @relation(fields: [siteId], references: [id])
  title          String
```
Find the model's closing (after `blockedReason  String?`):
```prisma
  blockedReason  String?
}
```
Replace with:
```prisma
  blockedReason  String?

  @@index([siteId])
}
```

- [ ] **Step 4: Add nullable `siteId` to `Professional`**

Find (in `model Professional`, starts line 107):
```prisma
model Professional {
  id          String   @id @default(cuid())
  slug        String   @unique
```
Replace with:
```prisma
model Professional {
  id          String   @id @default(cuid())
  siteId      String?
  site        Site?    @relation(fields: [siteId], references: [id])
  slug        String   @unique
```
Find the model's closing (after `businessCard  BusinessCard?`):
```prisma
  businessCard  BusinessCard?
}
```
Replace with:
```prisma
  businessCard  BusinessCard?

  @@index([siteId])
}
```

- [ ] **Step 5: Add nullable `siteId` to `Category`**

Find (in `model Category`, starts line 199):
```prisma
model Category {
  id           String                @id @default(cuid())
  slug         String                @unique
```
Replace with:
```prisma
model Category {
  id           String                @id @default(cuid())
  siteId       String?
  site         Site?                 @relation(fields: [siteId], references: [id])
  slug         String                @unique
```
Find the model's closing (after `updatedAt    DateTime              @updatedAt`, the second occurrence — inside `Category`, not `CategoryTranslation`):
```prisma
  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt
}
```
Replace with:
```prisma
  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt

  @@index([siteId])
}
```

- [ ] **Step 6: Generate and apply the expand migration**

```bash
set -a && source .env.local && set +a
npx prisma migrate dev --name add_site_multi_tenancy
```
Expected: succeeds cleanly (no shadow-database errors — this MySQL database's migration history is fully tracked, unlike the old Postgres one). Creates `prisma/migrations/<timestamp>_add_site_multi_tenancy/`.

- [ ] **Step 7: Verify the build still passes**

```bash
npx prisma generate && npm run build
```
Expected: succeeds — nothing consumes `Site` yet.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add Site model and nullable siteId columns (expand step)"
```

---

### Task 2: Backfill script — create the default site and populate `siteId`

**Files:**
- Create: `prisma/backfill-default-site.ts`

**Interfaces:**
- Produces: one `Site` row (`domain: "1000clic.fr"`), all existing `Category`/`Listing`/`Professional`/`User` rows updated with that site's id.

- [ ] **Step 1: Write the backfill script**

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })
  console.log(`Site par défaut : ${site.domain} (${site.id})`)

  const [categories, listings, professionals, users] = await Promise.all([
    prisma.category.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.listing.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.professional.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.user.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
  ])

  console.log(`Rattachés au site par défaut : ${categories.count} catégories, ${listings.count} annonces, ${professionals.count} professionnels, ${users.count} utilisateurs`)

  const remaining = await Promise.all([
    prisma.category.count({ where: { siteId: null } }),
    prisma.listing.count({ where: { siteId: null } }),
    prisma.professional.count({ where: { siteId: null } }),
    prisma.user.count({ where: { siteId: null } }),
  ])
  if (remaining.some(n => n > 0)) {
    throw new Error(`Backfill incomplet — lignes encore sans siteId : ${JSON.stringify(remaining)}`)
  }
  console.log('✅ Backfill terminé, aucune ligne orpheline.')
}

main().catch((err) => { console.error(err); process.exit(1) }).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run the backfill**

```bash
npx tsx --env-file=.env.local prisma/backfill-default-site.ts
```
Expected: prints the site id, counts of rows rattached, and `✅ Backfill terminé, aucune ligne orpheline.`. If it throws, stop and investigate before continuing.

- [ ] **Step 3: Commit**

```bash
git add prisma/backfill-default-site.ts
git commit -m "feat: add backfill script for default site"
```

---

### Task 3: Contract migration — enforce `siteId` and per-site uniqueness

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: fully-backfilled `siteId` columns from Task 2.
- Produces: `Category.siteId String` (required), `@@unique([siteId, slug])` on `Category` (replacing global `slug @unique`); `Listing.siteId String` (required); `Professional.siteId String` (required, `slug @unique` stays global — matches the original decision, still YAGNI); `User.siteId String` (required), `@@unique([siteId, email])` on `User` (replacing global `email @unique`). Compound unique input names: `siteId_slug` (Category), `siteId_email` (User).

- [ ] **Step 1: Make `Category.siteId` required and scope `slug` uniqueness per site**

Replace:
```prisma
  id           String                @id @default(cuid())
  siteId       String?
  site         Site?                 @relation(fields: [siteId], references: [id])
  slug         String                @unique
```
with:
```prisma
  id           String                @id @default(cuid())
  siteId       String
  site         Site                  @relation(fields: [siteId], references: [id])
  slug         String
```
Replace the closing:
```prisma
  updatedAt    DateTime              @updatedAt

  @@index([siteId])
}
```
with:
```prisma
  updatedAt    DateTime              @updatedAt

  @@unique([siteId, slug])
}
```
(inside `model Category` — `CategoryTranslation`'s closing, `@@unique([categoryId, locale])`, is untouched.)

- [ ] **Step 2: Make `Listing.siteId` required**

Replace:
```prisma
  id             String         @id @default(cuid())
  siteId         String?
  site           Site?          @relation(fields: [siteId], references: [id])
```
with:
```prisma
  id             String         @id @default(cuid())
  siteId         String
  site           Site           @relation(fields: [siteId], references: [id])
```

- [ ] **Step 3: Make `Professional.siteId` required**

Replace:
```prisma
  id          String   @id @default(cuid())
  siteId      String?
  site        Site?    @relation(fields: [siteId], references: [id])
```
with:
```prisma
  id          String   @id @default(cuid())
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
```

- [ ] **Step 4: Make `User.siteId` required and scope `email` uniqueness per site**

Replace:
```prisma
  id               String        @id @default(cuid())
  siteId           String?
  site             Site?         @relation(fields: [siteId], references: [id])
  name             String
  email            String        @unique
```
with:
```prisma
  id               String        @id @default(cuid())
  siteId           String
  site             Site          @relation(fields: [siteId], references: [id])
  name             String
  email            String
```
Replace the closing:
```prisma
  professional     Professional?

  @@index([siteId])
}
```
with:
```prisma
  professional     Professional?

  @@unique([siteId, email])
}
```

- [ ] **Step 5: Generate and apply the contract migration**

```bash
set -a && source .env.local && set +a
npx prisma migrate dev --name enforce_site_scoping
```
Expected: succeeds cleanly with no data-loss prompt (Task 2's backfill already satisfies the constraints). If it prompts about data loss or fails, stop — some rows likely still have `siteId = null`; re-run Task 2's script and investigate.

- [ ] **Step 6: Delete the now-obsolete backfill script**

`prisma/backfill-default-site.ts` filtered on `siteId: null`, which can never type-check or match anything once the column is required.
```bash
rm prisma/backfill-default-site.ts
```

- [ ] **Step 7: Verify — get the complete error list**

```bash
npx tsc --noEmit
```
Expected: fails with errors in files that either look up `Category` by bare `slug` or `User` by bare `email`, or create a `Listing`/`Professional`/`User` without `siteId`. Based on the current codebase, that list is: `app/annonces/[id]/page.tsx`, `app/api/categories/route.ts`, `app/api/listings/route.ts`, `app/api/pro/profile/route.ts`, `app/api/admin/professionnels/route.ts`, `auth.ts`, `app/api/auth/register/route.ts`, `app/api/auth/forgot-password/route.ts`, `prisma/seed.ts`, `prisma/seed-categories.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts`. This is expected and fixed across Tasks 6–9 — don't fix anything here. If you see errors on files NOT in this list, note them (there may be a file this plan's inventory missed, similar to what happened twice during the MySQL migration project — treat it as a real gap to fold into the relevant task below, not something to skip).

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git rm prisma/backfill-default-site.ts
git commit -m "feat: enforce siteId NOT NULL and per-site uniqueness (contract step)"
```

---

### Task 4: `middleware.ts` — domain-based site resolution

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`, `Site.domain`/`Site.active` from Task 1.
- Produces: every request downstream can read the resolved site id via the `x-site-id` request header. The existing maintenance-mode check and the two auth-redirect conditions are preserved exactly.

- [ ] **Step 1: Add site resolution to `middleware.ts`**

Replace the entire file:
```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})

const MAINTENANCE_CACHE_TTL_MS = 15_000
let maintenanceCache: { value: boolean; expiresAt: number } | null = null

async function isMaintenanceModeOn(): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache && now < maintenanceCache.expiresAt) return maintenanceCache.value
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' }, select: { maintenanceMode: true } })
    const value = settings?.maintenanceMode ?? false
    maintenanceCache = { value, expiresAt: now + MAINTENANCE_CACHE_TTL_MS }
    return value
  } catch (err) {
    console.error('[middleware] failed to read maintenanceMode, failing open:', err)
    return maintenanceCache?.value ?? false
  }
}

export default auth(async (req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  if (await isMaintenanceModeOn()) {
    const isAdminOrAuthRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname === '/connexion' || pathname.startsWith('/api/auth')
    if (!isAdminOrAuthRoute) {
      return new NextResponse('Site en maintenance — de retour très bientôt.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '120' },
      })
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/connexion' || pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && (pathname === '/deposer-annonce' || pathname === '/mon-compte' || pathname.startsWith('/messages'))) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }
})

export const config = {
  // This file uses the deprecated `middleware.ts` convention (not `proxy.ts`), which still
  // defaults to the Edge runtime in Next.js 16 — only `proxy.ts` defaults to Node.js. Prisma
  // cannot run on the Edge runtime, so the maintenance-mode DB check must opt in explicitly.
  // See node_modules/next/dist/build/entries.js `runDependingOnPageType`: for legacy
  // middleware files it only calls onServer() (Node.js) when pageRuntime === 'nodejs' is
  // explicitly set here; otherwise it silently falls back to onEdgeServer().
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
}
```
with:
```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})

const MAINTENANCE_CACHE_TTL_MS = 15_000
let maintenanceCache: { value: boolean; expiresAt: number } | null = null

async function isMaintenanceModeOn(): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache && now < maintenanceCache.expiresAt) return maintenanceCache.value
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' }, select: { maintenanceMode: true } })
    const value = settings?.maintenanceMode ?? false
    maintenanceCache = { value, expiresAt: now + MAINTENANCE_CACHE_TTL_MS }
    return value
  } catch (err) {
    console.error('[middleware] failed to read maintenanceMode, failing open:', err)
    return maintenanceCache?.value ?? false
  }
}

const DEFAULT_DOMAIN = '1000clic.fr'
const SITE_CACHE_TTL_MS = 60_000
let siteCache: { domains: Map<string, string>; expiresAt: number } | null = null

async function resolveSiteId(hostname: string): Promise<string | null> {
  const now = Date.now()
  if (!siteCache || now > siteCache.expiresAt) {
    try {
      const sites = await prisma.site.findMany({ where: { active: true }, select: { id: true, domain: true } })
      siteCache = { domains: new Map(sites.map(s => [s.domain, s.id])), expiresAt: now + SITE_CACHE_TTL_MS }
    } catch (err) {
      console.error('[middleware] failed to refresh site cache:', err)
      if (!siteCache) return null
    }
  }
  const bareHost = hostname.replace(/^www\./, '')
  return siteCache!.domains.get(hostname)
    ?? siteCache!.domains.get(bareHost)
    ?? siteCache!.domains.get(DEFAULT_DOMAIN)
    ?? siteCache!.domains.values().next().value
    ?? null
}

export default auth(async (req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  const hostname = req.headers.get('host')?.split(':')[0] ?? DEFAULT_DOMAIN
  const siteId = await resolveSiteId(hostname)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.delete('x-site-id')
  if (siteId) requestHeaders.set('x-site-id', siteId)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (await isMaintenanceModeOn()) {
    const isAdminOrAuthRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname === '/connexion' || pathname.startsWith('/api/auth')
    if (!isAdminOrAuthRoute) {
      return new NextResponse('Site en maintenance — de retour très bientôt.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '120' },
      })
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/connexion' || pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && (pathname === '/deposer-annonce' || pathname === '/mon-compte' || pathname.startsWith('/messages'))) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }

  return response
})

export const config = {
  // This file uses the deprecated `middleware.ts` convention (not `proxy.ts`), which still
  // defaults to the Edge runtime in Next.js 16 — only `proxy.ts` defaults to Node.js. Prisma
  // cannot run on the Edge runtime, so the maintenance-mode DB check must opt in explicitly.
  // See node_modules/next/dist/build/entries.js `runDependingOnPageType`: for legacy
  // middleware files it only calls onServer() (Node.js) when pageRuntime === 'nodejs' is
  // explicitly set here; otherwise it silently falls back to onEdgeServer().
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
}
```
Notes for the implementer:
- The maintenance-mode check and both auth-redirect conditions are byte-for-byte unchanged from the current file — only site resolution is added, ahead of them.
- The inbound `x-site-id` header is unconditionally stripped before being conditionally re-set — this closes the exact same client-spoofing gap that was found and fixed during the MySQL migration's `proxy.ts` equivalent (see that plan's final review). Don't skip this line even though it wasn't in the original file.
- `resolveSiteId` fails open (returns `null` → header simply not set) on a DB error, matching the existing `isMaintenanceModeOn`'s fail-open pattern in the same file.
- One important behavior difference from a normal redirect flow: the maintenance-mode block below still executes AFTER site resolution, so a 503 maintenance response still carries a resolved `x-site-id` on the underlying `response` object (irrelevant since the 503 is returned directly, not `response` — this is fine, just noting the ordering is intentional: resolve site first, unconditionally, then apply gates).

- [ ] **Step 2: Verify locally**

```bash
npm run dev
```
Visit `http://localhost:3000/` — loads normally. Log out and visit `/mon-compte` — redirects to `/connexion` (unchanged behavior). Toggle `maintenanceMode` on via `/admin/parametres`, confirm `/` 503s after the cache TTL while `/admin` stays reachable (unchanged behavior), then toggle back off.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add domain-based site resolution to middleware"
```

---

### Task 5: `lib/site.ts` — server-side site accessor

**Files:**
- Create: `lib/site.ts`

**Interfaces:**
- Consumes: `x-site-id` request header set by `middleware.ts` (Task 4).
- Produces: `getCurrentSiteId(): Promise<string>`, `getCurrentSite(): Promise<CurrentSite>`, `type CurrentSite`.

- [ ] **Step 1: Write `lib/site.ts`**

```ts
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface CurrentSite {
  id: string
  domain: string
  name: string
  country: string
  primaryColor: string
  secondaryColor: string
}

const fetchSiteById = unstable_cache(
  async (siteId: string): Promise<CurrentSite | null> => {
    return prisma.site.findUnique({
      where: { id: siteId },
      select: {
        id: true, domain: true, name: true, country: true,
        primaryColor: true, secondaryColor: true,
      },
    })
  },
  ['site-by-id'],
  { revalidate: 60, tags: ['sites'] }
)

/** Server components / route handlers only — never import from a client component. */
export async function getCurrentSiteId(): Promise<string> {
  const headerStore = await headers()
  const siteId = headerStore.get('x-site-id')
  if (!siteId) throw new Error('x-site-id header missing — is this request going through middleware.ts?')
  return siteId
}

/** Server components / route handlers only — never import from a client component. */
export async function getCurrentSite(): Promise<CurrentSite> {
  const siteId = await getCurrentSiteId()
  const site = await fetchSiteById(siteId)
  if (!site) throw new Error(`Site introuvable pour id=${siteId}`)
  return site
}
```

- [ ] **Step 2: Verify**

```bash
npm run build
```
Expected: still fails with the same known error list from Task 3 Step 7 (nothing consumes this file yet).

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "feat: add lib/site.ts server-side site accessor"
```

---

### Task 6: Scope categories (read + write) by site

**Files:**
- Modify: `lib/categories.ts`
- Modify: `app/api/categories/route.ts`
- Modify: `app/api/categories/[id]/route.ts`
- Modify: `app/annonces/[id]/page.tsx`

**Interfaces:**
- Consumes: `getCurrentSiteId` from `@/lib/site` (Task 5).
- Produces: all category reads/writes scoped to the resolved site; unique lookups use `siteId_slug`.

- [ ] **Step 1: Scope `lib/categories.ts`**

Replace:
```ts
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { Category, CategoryTree } from '@/types'
import { prisma } from '@/lib/prisma'
```
with:
```ts
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { Category, CategoryTree } from '@/types'
import { prisma } from '@/lib/prisma'
import { getCurrentSiteId } from '@/lib/site'
```
Replace:
```ts
const fetchCategoriesLocalized = unstable_cache(
  async (locale: string): Promise<Category[]> => {
    const rows = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }],
      include: {
        parent: { select: { slug: true } },
        translations: { where: { locale }, select: { label: true } },
      },
    })
    return rows.map(r => ({
      label:      r.translations[0]?.label ?? r.label,
      slug:       r.slug,
      icon:       r.icon,
      parentId:   r.parentId   ?? null,
      parentSlug: r.parent?.slug ?? null,
    }))
  },
  ['categories-localized'],
  { revalidate: 60, tags: ['categories'] }
)

/** Server components / route handlers only — imports Prisma, never import this from a client component. */
export async function getCategoriesServer(): Promise<Category[]> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('vem_lang')?.value ?? 'fr'
  return fetchCategoriesLocalized(locale).catch(() => FALLBACK_CATEGORIES)
}
```
with:
```ts
const fetchCategoriesLocalized = unstable_cache(
  async (locale: string, siteId: string): Promise<Category[]> => {
    const rows = await prisma.category.findMany({
      where: { siteId },
      orderBy: [{ order: 'asc' }],
      include: {
        parent: { select: { slug: true } },
        translations: { where: { locale }, select: { label: true } },
      },
    })
    return rows.map(r => ({
      label:      r.translations[0]?.label ?? r.label,
      slug:       r.slug,
      icon:       r.icon,
      parentId:   r.parentId   ?? null,
      parentSlug: r.parent?.slug ?? null,
    }))
  },
  ['categories-localized'],
  { revalidate: 60, tags: ['categories'] }
)

/** Server components / route handlers only — imports Prisma, never import this from a client component. */
export async function getCategoriesServer(): Promise<Category[]> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('vem_lang')?.value ?? 'fr'
  const siteId = await getCurrentSiteId()
  return fetchCategoriesLocalized(locale, siteId).catch(() => FALLBACK_CATEGORIES)
}
```

- [ ] **Step 2: Scope `app/api/categories/route.ts`**

Replace the whole file:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentSiteId } from '@/lib/site'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'
  const siteId = await getCurrentSiteId()
  const rows = await prisma.category.findMany({
    where: { siteId },
    orderBy: [{ order: 'asc' }],
    include: {
      parent: { select: { slug: true } },
      translations: { where: { locale }, select: { label: true } },
    },
  })
  return NextResponse.json(
    rows.map(r => ({
      id:         r.id,
      slug:       r.slug,
      label:      r.translations[0]?.label ?? r.label,
      icon:       r.icon,
      order:      r.order,
      parentId:   r.parentId   ?? null,
      parentSlug: r.parent?.slug ?? null,
    }))
  )
}

const createSchema = z.object({
  slug:     z.string().min(1).max(40).regex(/^[a-z0-9-]+$/, 'Slug : lettres minuscules, chiffres et tirets uniquement'),
  label:    z.string().min(1).max(60),
  icon:     z.string().max(8).optional().default(''),
  parentId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const siteId = await getCurrentSiteId()

  const existing = await prisma.category.findUnique({
    where: { siteId_slug: { siteId, slug: parsed.data.slug } },
  })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  // Validate parentId if provided
  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } })
    if (!parent || parent.siteId !== siteId) return NextResponse.json({ error: 'Catégorie parente introuvable' }, { status: 404 })
    // No depth restriction — N levels supported
  }

  const maxOrder = await prisma.category.aggregate({ where: { siteId }, _max: { order: true } })
  const category = await prisma.category.create({
    data: {
      siteId,
      slug:     parsed.data.slug.trim().toLowerCase(),
      label:    parsed.data.label.trim(),
      icon:     parsed.data.icon.trim(),
      order:    (maxOrder._max.order ?? -1) + 1,
      parentId: parsed.data.parentId ?? null,
    },
    include: { parent: { select: { slug: true } } },
  })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({
    id:         category.id,
    slug:       category.slug,
    label:      category.label,
    icon:       category.icon,
    order:      category.order,
    parentId:   category.parentId   ?? null,
    parentSlug: category.parent?.slug ?? null,
  }, { status: 201 })
}

const updateSchema = z.object({
  id:           z.string().min(1),
  label:        z.string().min(1).max(60).optional(),
  icon:         z.string().min(1).max(8).optional(),
  order:        z.number().int().optional(),
  translations: z.array(z.object({
    locale: z.string().min(2).max(5),
    label:  z.string().max(60),
  })).optional(),
})

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { id, translations, ...data } = parsed.data

  const siteId = await getCurrentSiteId()
  const target = await prisma.category.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const [category] = await Promise.all([
    prisma.category.update({ where: { id }, data }),
    ...(translations ?? [])
      .filter(t => t.label.trim())
      .map(t => prisma.categoryTranslation.upsert({
        where:  { categoryId_locale: { categoryId: id, locale: t.locale } },
        update: { label: t.label.trim() },
        create: { categoryId: id, locale: t.locale, label: t.label.trim() },
      })),
  ])

  revalidateTag('categories', { expire: 0 })
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const siteId = await getCurrentSiteId()
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: { include: { children: true } } },
  })
  if (!category || category.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Collect all descendant slugs recursively
  const allSlugs = [category.slug]
  for (const child of category.children) {
    allSlugs.push(child.slug)
    for (const grandchild of child.children) allSlugs.push(grandchild.slug)
  }
  const inUse = await prisma.listing.count({ where: { categorySlug: { in: allSlugs }, siteId } })
  if (inUse > 0) {
    return NextResponse.json({ error: `Catégorie utilisée par ${inUse} annonce(s), suppression impossible` }, { status: 409 })
  }

  // Collect all descendant ids, delete deepest first to respect FK constraints
  const childIds = category.children.map(c => c.id)
  const grandchildIds = category.children.flatMap(c => c.children.map(g => g.id))
  await prisma.$transaction([
    prisma.category.deleteMany({ where: { id: { in: grandchildIds } } }),
    prisma.category.deleteMany({ where: { id: { in: childIds } } }),
    prisma.category.delete({ where: { id } }),
  ])
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Scope `app/api/categories/[id]/route.ts`**

Replace the whole file:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentSiteId } from '@/lib/site'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  const siteId = await getCurrentSiteId()
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: { select: { locale: true, label: true } } },
  })
  if (!category || category.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(
    Object.fromEntries(category.translations.map(t => [t.locale, t.label]))
  )
}
```

- [ ] **Step 4: Scope the category lookup in `app/annonces/[id]/page.tsx`**

Replace:
```ts
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import ListingDetailClient from './ListingDetailClient'
```
with:
```ts
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getCurrentSiteId } from '@/lib/site'
import ListingDetailClient from './ListingDetailClient'
```
Replace:
```ts
  if (!raw) notFound()

  const categoryRecord = await prisma.category.findUnique({
    where: { slug: raw.categorySlug },
    include: { parent: { select: { slug: true, label: true, icon: true } } },
  })
```
with:
```ts
  if (!raw) notFound()

  const siteId = await getCurrentSiteId()
  const categoryRecord = await prisma.category.findUnique({
    where: { siteId_slug: { siteId, slug: raw.categorySlug } },
    include: { parent: { select: { slug: true, label: true, icon: true } } },
  })
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```
Expected: the 4 files above drop out of the known error list from Task 3 Step 7. The rest remain, fixed in Tasks 7–8.

- [ ] **Step 6: Manual verification**

```bash
npm run dev
```
Visit `http://localhost:3000/` and confirm the category menu renders exactly as before. In `/admin/categories`, confirm existing categories still show and CRUD still works. Open a listing detail page and confirm its category name/icon still renders.

- [ ] **Step 7: Commit**

```bash
git add lib/categories.ts app/api/categories app/annonces/\[id\]/page.tsx
git commit -m "feat: scope categories by site (read + write)"
```

---

### Task 7: Scope auth — register, login, password reset

**Files:**
- Modify: `auth.ts`
- Modify: `app/api/auth/register/route.ts`
- Modify: `app/api/auth/forgot-password/route.ts`

**Interfaces:**
- Consumes: `getCurrentSiteId` from `@/lib/site` (Task 5); `headers` from `next/headers`.
- Produces: every new `User` row carries `siteId`; email lookups filter by site (`siteId_email`).

- [ ] **Step 1: Scope `auth.ts`**

Replace:
```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'
```
with:
```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { headers } from 'next/headers'
import { authConfig } from './auth.config'
```
Replace:
```ts
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        }).catch(() => null)
        if (!user || user.blocked) return null
```
with:
```ts
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const siteId = (await headers()).get('x-site-id')
        if (!siteId) return null

        const user = await prisma.user.findFirst({
          where: { email: parsed.data.email, siteId },
        }).catch(() => null)
        if (!user || user.blocked) return null
```

- [ ] **Step 2: Scope `app/api/auth/register/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getCurrentSiteId } from '@/lib/site'
```
Replace:
```ts
  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  })
```
with:
```ts
  const { name, email, password } = parsed.data
  const siteId = await getCurrentSiteId()

  const existing = await prisma.user.findFirst({ where: { email, siteId } })
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, siteId },
    select: { id: true, name: true, email: true },
  })
```

- [ ] **Step 3: Scope `app/api/auth/forgot-password/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { getCurrentSiteId } from '@/lib/site'
import crypto from 'crypto'
```
Replace:
```ts
  // Always return 200 to avoid user enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) return NextResponse.json({ ok: true })
```
with:
```ts
  // Always return 200 to avoid user enumeration
  const siteId = await getCurrentSiteId()
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim(), siteId } })
  if (!user) return NextResponse.json({ ok: true })
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: these 3 files drop out. Remaining known errors: `app/api/listings/route.ts`, `app/api/pro/profile/route.ts`, `app/api/admin/professionnels/route.ts`, `prisma/seed.ts`, `prisma/seed-categories.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts` (Tasks 8–9).

- [ ] **Step 5: Manual verification**

Register a new test account, log out, log back in with the same credentials, trigger "mot de passe oublié". Confirm the pre-existing seeded account (`demo.pro@1000click.es` / `DemoPro2026!`, or `admin@vendo.es` after Task 9) can still log in once it exists.

- [ ] **Step 6: Commit**

```bash
git add auth.ts app/api/auth/register/route.ts app/api/auth/forgot-password/route.ts
git commit -m "feat: scope auth (login, register, password reset) by site"
```

---

### Task 8: Scope listing and professional creation

**Files:**
- Modify: `app/api/listings/route.ts`
- Modify: `app/api/pro/profile/route.ts`
- Modify: `app/api/admin/professionnels/route.ts`

**Interfaces:**
- Consumes: `getCurrentSiteId` from `@/lib/site` (Task 5).
- Produces: every new `Listing` and `Professional` row carries `siteId`. Read paths (`GET`) are intentionally left unscoped — deferred, same as the original attempt (safe while only one site has real public traffic).

- [ ] **Step 1: Scope listing creation in `app/api/listings/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { neighborhoodCoords } from '@/lib/neighborhoods'
import { checkFirewall } from '@/lib/content-firewall'
import { sendAdminNewListingEmail } from '@/lib/email'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { neighborhoodCoords } from '@/lib/neighborhoods'
import { checkFirewall } from '@/lib/content-firewall'
import { sendAdminNewListingEmail } from '@/lib/email'
import { getCurrentSiteId } from '@/lib/site'
```
Replace:
```ts
  const { lat: _lat, lng: _lng, ...listingData } = parsed.data
  void _lat; void _lng

  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      userId: session.user.id,
      lat,
      lng,
      status: autoPublish ? 'ACTIVE' : 'PENDING',
    },
  })
```
with:
```ts
  const { lat: _lat, lng: _lng, ...listingData } = parsed.data
  void _lat; void _lng
  const siteId = await getCurrentSiteId()

  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      userId: session.user.id,
      siteId,
      lat,
      lng,
      status: autoPublish ? 'ACTIVE' : 'PENDING',
    },
  })
```

- [ ] **Step 2: Scope self-serve professional creation in `app/api/pro/profile/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'
import { getCurrentSiteId } from '@/lib/site'
```
Replace:
```ts
  const { zones, ...restFields } = fields
  const slug = await uniqueSlug(slugify(fields.name))
  const pro = await prisma.professional.create({
    data: {
      ...restFields,
      slug,
      userId: session.user.id,
      tier: 'FREE',
      zones: { create: zones.map(zone => ({ zone })) },
    },
  })
```
with:
```ts
  const { zones, ...restFields } = fields
  const slug = await uniqueSlug(slugify(fields.name))
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({
    data: {
      ...restFields,
      slug,
      userId: session.user.id,
      siteId,
      tier: 'FREE',
      zones: { create: zones.map(zone => ({ zone })) },
    },
  })
```

- [ ] **Step 3: Scope admin-created professional in `app/api/admin/professionnels/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { getCurrentSiteId } from '@/lib/site'
```
Replace:
```ts
  const { photos, ...rest } = parsed.data
  const pro = await prisma.professional.create({
    data: { ...rest, photos: { create: photos.map((url, order) => ({ url, order })) } },
  })
  return NextResponse.json(pro, { status: 201 })
```
with:
```ts
  const { photos, ...rest } = parsed.data
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({
    data: { ...rest, siteId, photos: { create: photos.map((url, order) => ({ url, order })) } },
  })
  return NextResponse.json(pro, { status: 201 })
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: these 3 files drop out. Remaining: `prisma/seed.ts`, `prisma/seed-categories.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts` (Task 9).

- [ ] **Step 5: Manual verification**

Log in as the test user from Task 7, post a new listing, confirm it appears in `/annonces` and `/admin/annonces`. Create a professional via self-serve or `/admin/professionnels`, confirm it appears in `/professionnels`.

- [ ] **Step 6: Commit**

```bash
git add app/api/listings/route.ts app/api/pro/profile/route.ts app/api/admin/professionnels/route.ts
git commit -m "feat: attach siteId when creating listings and professionals"
```

---

### Task 9: Fix dev/seed scripts

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `prisma/seed-categories.ts`
- Modify: `prisma/make-admin.ts`
- Modify: `prisma/make-demo-pro.ts`

**Interfaces:**
- Consumes: `Site` model from Task 1; compound unique inputs `siteId_email`, `siteId_slug` from Task 3.
- Produces: `npm run db:seed` and the ad-hoc `tsx prisma/*.ts` scripts work against a fresh database and satisfy the project-wide type check.

**Operational note:** `set -a && source .env.local && set +a && npx prisma ...` for prisma CLI commands; `npx tsx --env-file=.env.local <script>.ts` for tsx scripts.

- [ ] **Step 1: Fix `prisma/seed.ts`**

Replace:
```ts
async function main() {
  // Clear all listings (cascades to ListingImage, Favorite, Message)
  await prisma.listing.deleteMany()

  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'demo@vendo.es' },
    update: {},
    create: { name: 'Marie Dupont', email: 'demo@vendo.es', passwordHash },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'demo2@vendo.es' },
    update: {},
    create: { name: 'Thomas Martin', email: 'demo2@vendo.es', passwordHash },
  })
```
with:
```ts
async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  // Clear all listings (cascades to ListingImage, Favorite, Message)
  await prisma.listing.deleteMany()

  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user1 = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email: 'demo@vendo.es' } },
    update: {},
    create: { name: 'Marie Dupont', email: 'demo@vendo.es', passwordHash, siteId: site.id },
  })

  const user2 = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email: 'demo2@vendo.es' } },
    update: {},
    create: { name: 'Thomas Martin', email: 'demo2@vendo.es', passwordHash, siteId: site.id },
  })
```
Replace:
```ts
  for (const [i, { images, isPremium, phone, ...data }] of LISTINGS.entries()) {
    const userId = i < 15 ? user1.id : user2.id
    await prisma.listing.create({
      data: {
        ...data,
        phone,
        isPremium: isPremium ?? false,
        userId,
        images: {
          create: images.map((url, order) => ({ url, order })),
        },
      },
    })
  }
```
with:
```ts
  for (const [i, { images, isPremium, phone, ...data }] of LISTINGS.entries()) {
    const userId = i < 15 ? user1.id : user2.id
    await prisma.listing.create({
      data: {
        ...data,
        phone,
        isPremium: isPremium ?? false,
        userId,
        siteId: site.id,
        images: {
          create: images.map((url, order) => ({ url, order })),
        },
      },
    })
  }
```

- [ ] **Step 2: Fix `prisma/seed-categories.ts`**

Replace:
```ts
async function main() {
  console.log('🌱 Seeding categories...\n')

  // Warn if listings exist
```
with:
```ts
async function main() {
  console.log('🌱 Seeding categories...\n')

  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  // Warn if listings exist
```
Then find each of the 3 category upsert blocks (root, sub, subsub) and add `siteId` scoping. Replace:
```ts
    const root = await prisma.category.upsert({
      where: { slug: cat1.slug },
      create: { slug: cat1.slug, label: cat1.label, icon: cat1.icon, order: i },
      update: { label: cat1.label, icon: cat1.icon, order: i },
    })
```
with:
```ts
    const root = await prisma.category.upsert({
      where: { siteId_slug: { siteId: site.id, slug: cat1.slug } },
      create: { siteId: site.id, slug: cat1.slug, label: cat1.label, icon: cat1.icon, order: i },
      update: { label: cat1.label, icon: cat1.icon, order: i },
    })
```
Replace:
```ts
      const sub = await prisma.category.upsert({
        where: { slug: cat2.slug },
        create: { slug: cat2.slug, label: cat2.label, icon: '', order: j, parentId: root.id },
        update: { label: cat2.label, order: j, parentId: root.id },
      })
```
with:
```ts
      const sub = await prisma.category.upsert({
        where: { siteId_slug: { siteId: site.id, slug: cat2.slug } },
        create: { siteId: site.id, slug: cat2.slug, label: cat2.label, icon: '', order: j, parentId: root.id },
        update: { label: cat2.label, order: j, parentId: root.id },
      })
```
Replace:
```ts
        const subsub = await prisma.category.upsert({
          where: { slug: cat3.slug },
          create: { slug: cat3.slug, label: cat3.label, icon: '', order: k, parentId: sub.id },
          update: { label: cat3.label, order: k, parentId: sub.id },
        })
```
with:
```ts
        const subsub = await prisma.category.upsert({
          where: { siteId_slug: { siteId: site.id, slug: cat3.slug } },
          create: { siteId: site.id, slug: cat3.slug, label: cat3.label, icon: '', order: k, parentId: sub.id },
          update: { label: cat3.label, order: k, parentId: sub.id },
        })
```

- [ ] **Step 3: Fix `prisma/make-admin.ts`**

Replace the whole file:
```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  const user = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email: 'admin@vendo.es' } },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'Admin', email: 'admin@vendo.es', passwordHash, role: 'ADMIN', siteId: site.id },
  })
  console.log(`✅ Admin créé : ${user.email} / Admin1234!`)
}

main().finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Fix `prisma/make-demo-pro.ts`**

Replace:
```ts
async function main() {
  const email    = 'demo.pro@1000click.es'
  const password = 'DemoPro2026!'

  const passwordHash = await bcrypt.hash(password, 12)

  // 1. User
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'PREMIUM' },
    create: { name: 'Sophie Martin', email, passwordHash, role: 'PREMIUM' },
  })
```
with:
```ts
async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  const email    = 'demo.pro@1000click.es'
  const password = 'DemoPro2026!'

  const passwordHash = await bcrypt.hash(password, 12)

  // 1. User
  const user = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email } },
    update: { passwordHash, role: 'PREMIUM' },
    create: { name: 'Sophie Martin', email, passwordHash, role: 'PREMIUM', siteId: site.id },
  })
```
Find the `professional.upsert`'s `create` block and add `siteId: site.id` right after `slug: 'sophie-martin-architecte',`:
```ts
    create: {
      slug: 'sophie-martin-architecte',
      name: 'Sophie Martin Architecte',
```
becomes:
```ts
    create: {
      slug: 'sophie-martin-architecte',
      siteId: site.id,
      name: 'Sophie Martin Architecte',
```
Find the listing `create` block inside the loop and add `siteId: site.id`:
```ts
      const created = await prisma.listing.create({
        data: {
          ...rest,
          userId: user.id,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 80) + 10,
        },
      })
```
becomes:
```ts
      const created = await prisma.listing.create({
        data: {
          ...rest,
          userId: user.id,
          siteId: site.id,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 80) + 10,
        },
      })
```

- [ ] **Step 5: Verify — must reach zero errors**

```bash
npx tsc --noEmit
```
Expected: **zero errors project-wide.**

- [ ] **Step 6: Verify the scripts run**

```bash
npx tsx --env-file=.env.local prisma/make-admin.ts
```
Expected: `✅ Admin créé : admin@vendo.es / Admin1234!` (idempotent). Do NOT run `seed.ts` or `seed-categories.ts` for real (they delete/truncate data) — code-review + `tsc` only for those two.

- [ ] **Step 7: Commit**

```bash
git add prisma/seed.ts prisma/seed-categories.ts prisma/make-admin.ts prisma/make-demo-pro.ts
git commit -m "fix: attach siteId in seed and dev utility scripts"
```

---

### Task 10: End-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Full regression pass on the default site**

```bash
npm run build && npm run start
```
Walk through: homepage, categories, `/annonces` browse + detail, register/login/logout, post a listing, `/professionnels` browse + detail, admin login + `/admin/categories`/`/admin/annonces`/`/admin/professionnels` show existing data correctly.

- [ ] **Step 2: Prove isolation with a second demo site**

```bash
npx tsx --env-file=.env.local -e "
(async () => {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  await prisma.site.upsert({
    where: { domain: 'demo-site.localhost' },
    update: {},
    create: { domain: 'demo-site.localhost', name: 'Demo Site', country: 'Belgique' },
  })
  console.log('demo site created')
  await prisma.\$disconnect()
})()
"
```
Restart `npm run dev`, then:
```bash
curl -s http://localhost:3000/api/categories -H "Host: 1000clic.fr" | head -c 300
curl -s http://localhost:3000/api/categories -H "Host: demo-site.localhost" | head -c 300
```
Expected: first call returns real categories, second returns `[]`. POST a category with `Host: demo-site.localhost` (admin session), confirm it appears only under that Host.

- [ ] **Step 3: Clean up the demo site**

```bash
npx tsx --env-file=.env.local -e "
(async () => {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  await prisma.category.deleteMany({ where: { site: { domain: 'demo-site.localhost' } } })
  await prisma.site.delete({ where: { domain: 'demo-site.localhost' } })
  console.log('demo site removed')
  await prisma.\$disconnect()
})()
"
```

- [ ] **Step 4: Final commit**

No code changes expected. If Steps 1–2 revealed no issues, this plan is complete and ready for Plan 2 (admin "Sites & Pays" panel + site selector — a separate, not-yet-written plan).
