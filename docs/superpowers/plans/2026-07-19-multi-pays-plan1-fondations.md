# Multi-pays — Plan 1 : Fondations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a `Site` model and `siteId` scoping foundation (schema, domain-based resolution, category scoping, auth/listing/professional write-path) so the platform can support multiple country sites — while the existing Spain site (`1000clic.fr`) keeps working identically at every step.

**Architecture:** One Next.js/Vercel deployment, multiple domains. `proxy.ts` (renamed from the deprecated `middleware.ts`) resolves the active `Site` by request hostname and injects it as an `x-site-id` request header; `lib/site.ts::getCurrentSite()` reads it server-side. Migration is expand-then-contract: `siteId` columns are added nullable, backfilled onto a single default site, then made required — the Spain site never has a moment of missing data.

**Tech Stack:** Next.js 16 (App Router, Node.js proxy runtime), Prisma 6 + `@prisma/adapter-neon`, PostgreSQL (Neon), NextAuth v5 beta, TypeScript strict mode, no automated test framework in this repo — verification is via `npm run build` (which type-checks the whole project per `tsconfig.json`), manual `curl`, and direct DB checks.

## Global Constraints

- Every step must leave the Spain site (`1000clic.fr`) working identically — no step is "done" until verified against it.
- `tsconfig.json` includes `**/*.ts` project-wide (excludes only `node_modules`), so `npm run build` type-checks *every* `.ts` file including `prisma/*.ts` dev scripts — those must compile too.
- No new test framework is introduced. Verification = `npm run build` + manual checks described in each task.
- Currency stays EUR everywhere; no Stripe key changes; no per-site currency logic (per spec).
- `SiteSettings`, the admin "Sites & Pays" panel, legal pages, theming and Stripe metadata are **out of scope** for this plan — they land in Plan 2 and Plan 3 (`docs/superpowers/specs/2026-07-19-multi-pays-design.md`).
- Read-path filtering of `Listing`/`Professional` queries (the ~40 files outside this plan) is **out of scope** — safe to defer because only one site has data until Plan 2 ships.
- Reference spec: `docs/superpowers/specs/2026-07-19-multi-pays-design.md`.

---

### Task 1: Prisma schema — `Site` model + nullable `siteId` columns (expand step)

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Site` model (`id`, `domain`, `name`, `country`, `primaryColor`, `secondaryColor`, `legalCompanyName`, `legalCountry`, `legalContactEmail`, `active`, `createdAt`, `updatedAt`). `Category.siteId`, `Listing.siteId`, `Professional.siteId`, `User.siteId` — all nullable `String?` at this step.

- [ ] **Step 1: Add the `Site` model**

In `prisma/schema.prisma`, add this new model directly above `model User {` (line 12):

```prisma
model Site {
  id                String   @id @default(cuid())
  domain            String   @unique
  name              String
  country           String
  primaryColor      String   @default("#F97316")
  secondaryColor    String   @default("#12122A")
  legalCompanyName  String?
  legalCountry      String?
  legalContactEmail String?
  active            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  categories    Category[]
  listings      Listing[]
  professionals Professional[]
  users         User[]
}

```

- [ ] **Step 2: Add nullable `siteId` to `User`**

In `prisma/schema.prisma`, in `model User { ... }` (starts line 12), find:

```prisma
model User {
  id               String        @id @default(cuid())
  name             String
  email            String        @unique
```

Replace with:

```prisma
model User {
  id               String        @id @default(cuid())
  siteId           String?
  site             Site?         @relation(fields: [siteId], references: [id])
  name             String
  email            String        @unique
```

Add an index at the end of the model, just before the closing `}` of `model User` (after the `professional     Professional?` line):

```prisma
  professional     Professional?

  @@index([siteId])
}
```

- [ ] **Step 3: Add nullable `siteId` to `Listing`**

Find (inside `model Listing { ... }`, starts line 35):

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

Add an index before the closing `}` of `model Listing` (after `blockedReason  String?`):

```prisma
  blockedReason  String?

  @@index([siteId])
}
```

- [ ] **Step 4: Add nullable `siteId` to `Professional`**

Find (inside `model Professional { ... }`, starts line 108):

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

Add an index before the closing `}` of `model Professional` (after `businessCard  BusinessCard?`):

```prisma
  businessCard  BusinessCard?

  @@index([siteId])
}
```

- [ ] **Step 5: Add nullable `siteId` to `Category`**

Find (inside `model Category { ... }`, starts line 181):

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

Add an index before the closing `}` of `model Category` (after `updatedAt    DateTime              @updatedAt`, before `}`):

```prisma
  updatedAt    DateTime              @updatedAt

  @@index([siteId])
}
```

- [ ] **Step 6: Generate and apply the expand migration**

Run:
```bash
npx prisma migrate dev --name add_site_multi_tenancy
```
Expected: Prisma prints `Your database is now in sync with your schema` and creates `prisma/migrations/<timestamp>_add_site_multi_tenancy/migration.sql`. No prompt about data loss (all new columns are nullable).

- [ ] **Step 7: Verify the build still passes**

Run:
```bash
npx prisma generate && npm run build
```
Expected: build succeeds (existing code doesn't reference `Site` yet, so nothing should break).

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
- Consumes: `Site`, `Category.siteId`, `Listing.siteId`, `Professional.siteId`, `User.siteId` from Task 1.
- Produces: one `Site` row (`domain: "1000clic.fr"`), all existing `Category`/`Listing`/`Professional`/`User` rows updated with that site's id.

- [ ] **Step 1: Write the backfill script**

Create `prisma/backfill-default-site.ts`:

```ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: {
      domain: '1000clic.fr',
      name: '1000Click Valencia',
      country: 'Espagne',
      legalCompanyName: 'NovaTeck Studio || MYLOSTACK DEVELOPMENT',
      legalCountry: 'Espagne (Comunitat Valenciana)',
      legalContactEmail: 'contact@1000clic.fr',
    },
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

- [ ] **Step 2: Run the backfill against the dev database**

Run:
```bash
npx tsx prisma/backfill-default-site.ts
```
Expected: prints the created/found site id, the counts of rows rattached, and `✅ Backfill terminé, aucune ligne orpheline.` — if it throws, stop and investigate before continuing (do not proceed to Task 3 with orphaned rows).

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
- Consumes: fully-backfilled `siteId` columns from Task 2 (migration will fail if any row still has `siteId = null`).
- Produces: `Category.siteId String` (required), `@@unique([siteId, slug])` on `Category` (replacing global `slug @unique`); `Listing.siteId String` (required); `Professional.siteId String` (required, `slug @unique` stays global); `User.siteId String` (required), `@@unique([siteId, email])` on `User` (replacing global `email @unique`). Compound unique input names Prisma will generate: `siteId_slug` (Category), `siteId_email` (User) — later tasks use these exact names.

- [ ] **Step 1: Make `Category.siteId` required and scope `slug` uniqueness per site**

In `prisma/schema.prisma`, `model Category`, change:

```prisma
  id           String                @id @default(cuid())
  siteId       String?
  site         Site?                 @relation(fields: [siteId], references: [id])
  slug         String                @unique
```

to:

```prisma
  id           String                @id @default(cuid())
  siteId       String
  site         Site                  @relation(fields: [siteId], references: [id])
  slug         String
```

And change the closing of the model from:

```prisma
  updatedAt    DateTime              @updatedAt

  @@index([siteId])
}
```

to:

```prisma
  updatedAt    DateTime              @updatedAt

  @@unique([siteId, slug])
}
```

(The explicit `@@index([siteId])` can be dropped here — `@@unique([siteId, slug])` already indexes `siteId` as its leading column.)

- [ ] **Step 2: Make `Listing.siteId` required**

In `model Listing`, change:

```prisma
  id             String         @id @default(cuid())
  siteId         String?
  site           Site?          @relation(fields: [siteId], references: [id])
```

to:

```prisma
  id             String         @id @default(cuid())
  siteId         String
  site           Site           @relation(fields: [siteId], references: [id])
```

- [ ] **Step 3: Make `Professional.siteId` required**

In `model Professional`, change:

```prisma
  id          String   @id @default(cuid())
  siteId      String?
  site        Site?    @relation(fields: [siteId], references: [id])
```

to:

```prisma
  id          String   @id @default(cuid())
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
```

- [ ] **Step 4: Make `User.siteId` required and scope `email` uniqueness per site**

In `model User`, change:

```prisma
  id               String        @id @default(cuid())
  siteId           String?
  site             Site?         @relation(fields: [siteId], references: [id])
  name             String
  email            String        @unique
```

to:

```prisma
  id               String        @id @default(cuid())
  siteId           String
  site             Site          @relation(fields: [siteId], references: [id])
  name             String
  email            String
```

And change the closing of the model from:

```prisma
  professional     Professional?

  @@index([siteId])
}
```

to:

```prisma
  professional     Professional?

  @@unique([siteId, email])
}
```

- [ ] **Step 5: Generate and apply the contract migration**

Run:
```bash
npx prisma migrate dev --name enforce_site_scoping
```
Expected: succeeds with no data-loss prompt (Task 2's backfill already satisfies the NOT NULL constraints). If Prisma prompts about data loss, **stop** — it means some rows still have `siteId = null`; re-run the Task 2 backfill script and investigate before retrying.

- [ ] **Step 6: Verify the build**

Run:
```bash
npx prisma generate && npm run build
```
Expected: **this will now fail** with TypeScript errors in every file that either (a) looks up a `Category` by bare `slug` or a `User` by bare `email` — no longer valid unique inputs — or (b) creates a `Listing`, `Professional`, or `User` without a `siteId` — now a required field. That's expected to include at least: `app/api/categories/route.ts`, `auth.ts`, `app/api/auth/register/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/listings/route.ts`, `app/api/pro/profile/route.ts`, `app/api/admin/professionnels/route.ts`, `prisma/seed.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts`. This is expected and progressively fixed across Tasks 6–9 — don't try to fix anything here. Do not commit yet.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: enforce siteId NOT NULL and per-site uniqueness (contract step)"
```

---

### Task 4: `proxy.ts` — domain-based site resolution

**Files:**
- Delete: `middleware.ts`
- Create: `proxy.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`, `Site.domain`/`Site.active` from Task 1.
- Produces: every request downstream (Route Handlers, Server Components) can read the resolved site id via the `x-site-id` request header.

- [ ] **Step 1: Create `proxy.ts`**

Next.js 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts` (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Create `proxy.ts` at the project root with the exact content of the current `middleware.ts` plus domain resolution:

```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})

const DEFAULT_DOMAIN = '1000clic.fr'
const SITE_CACHE_TTL_MS = 60_000

let siteCache: { domains: Map<string, string>; expiresAt: number } | null = null

async function resolveSiteId(hostname: string): Promise<string | null> {
  const now = Date.now()
  if (!siteCache || now > siteCache.expiresAt) {
    const sites = await prisma.site.findMany({
      where: { active: true },
      select: { id: true, domain: true },
    })
    siteCache = {
      domains: new Map(sites.map(s => [s.domain, s.id])),
      expiresAt: now + SITE_CACHE_TTL_MS,
    }
  }
  const bareHost = hostname.replace(/^www\./, '')
  return siteCache.domains.get(hostname)
    ?? siteCache.domains.get(bareHost)
    ?? siteCache.domains.get(DEFAULT_DOMAIN)
    ?? siteCache.domains.values().next().value
    ?? null
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host')?.split(':')[0] ?? DEFAULT_DOMAIN

  const siteId = await resolveSiteId(hostname)
  const requestHeaders = new Headers(req.headers)
  if (siteId) requestHeaders.set('x-site-id', siteId)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  const isAuthenticated = !!req.auth

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
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
}
```

Notes for the implementer:
- The auth redirect conditions (`pathname === '/connexion'`, etc.) are copied **verbatim** from the old `middleware.ts` — only the `matcher` (which paths *invoke* this file) is broadened, not which paths get redirected. This is intentional: domain resolution must run on every page and API route, but the login/logout redirects must keep applying to exactly the same 5 paths as before.
- If `resolveSiteId` finds no active sites at all (e.g. an empty `Site` table), `siteId` is `null` and the header is simply not set — downstream code must treat a missing `x-site-id` header as a hard error (Task 5), which is the correct fail-safe: better to 500 loudly than silently serve mixed-site data.

- [ ] **Step 2: Delete the old `middleware.ts`**

```bash
rm middleware.ts
```

- [ ] **Step 3: Verify locally**

Run:
```bash
npm run dev
```
In another terminal:
```bash
curl -sI http://localhost:3000/ -H "Host: 1000clic.fr" | grep -i x-site-id
curl -sI http://localhost:3000/connexion | head -1
```
Expected: the first command doesn't show `x-site-id` (it's a request header, not visible in the response — this just confirms the server doesn't crash and returns 200). The second command returns `HTTP/1.1 200` (login page loads normally, unauthenticated). Also manually visit `http://localhost:3000/mon-compte` in a browser while logged out — expect a redirect to `/connexion`, same as before this change.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git rm middleware.ts
git commit -m "feat: rename middleware to proxy, add domain-based site resolution"
```

---

### Task 5: `lib/site.ts` — server-side site accessor

**Files:**
- Create: `lib/site.ts`

**Interfaces:**
- Consumes: `x-site-id` request header set by `proxy.ts` (Task 4), `prisma` from `@/lib/prisma`.
- Produces: `getCurrentSiteId(): Promise<string>`, `getCurrentSite(): Promise<CurrentSite>`, `type CurrentSite` — used by every later task that scopes a query.

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
  if (!siteId) throw new Error('x-site-id header missing — is this request going through proxy.ts?')
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

- [ ] **Step 2: Verify the build**

Run:
```bash
npm run build
```
Expected: still fails with the same pre-existing errors noted in Task 3 Step 6 (nothing consumes `lib/site.ts` yet, so this file alone can't fix or break anything) — confirm no *new* errors were introduced by this file itself (e.g. by running `npx tsc --noEmit lib/site.ts` isn't valid standalone, so just check the full error list didn't grow versus Task 3 Step 6's list).

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

**Interfaces:**
- Consumes: `getCurrentSiteId` from `@/lib/site` (Task 5).
- Produces: all category reads/writes scoped to the resolved site; unique lookups use Prisma's compound input `siteId_slug`.

- [ ] **Step 1: Scope `lib/categories.ts`**

In `lib/categories.ts`, replace:

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

Then replace:

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

(`unstable_cache` includes the function's actual call arguments in its cache key in addition to the explicit `['categories-localized']` array — adding `siteId` as a second argument is enough to separate the cache per site, no other change needed.)

- [ ] **Step 2: Scope `app/api/categories/route.ts`**

Replace the whole file content with:

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

Replace the whole file with:

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

- [ ] **Step 4: Verify the build**

Run:
```bash
npm run build
```
Expected: the `app/api/categories/route.ts` errors from Task 3 Step 6 are gone. The rest of that error list (auth files, listings/professionals creation, seed/dev scripts) is still expected to fail — fixed in Tasks 7–9.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
In a browser, visit `http://localhost:3000/` and confirm the category menu/mega-menu renders exactly as before. In the admin panel (`/admin/categories`), confirm the existing categories list still shows and that creating/editing/deleting a category still works.

- [ ] **Step 6: Commit**

```bash
git add lib/categories.ts app/api/categories
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
- Produces: every new `User` row carries `siteId`; email lookups filter by site (compound input `siteId_email`).

- [ ] **Step 1: Scope `auth.ts`**

In `auth.ts`, replace:

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

Then replace:

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

Then replace:

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

Then replace:

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

- [ ] **Step 4: Verify the build**

Run:
```bash
npm run build
```
Expected: errors in `auth.ts`, `register/route.ts`, `forgot-password/route.ts` are gone. Still expected to fail: `app/api/listings/route.ts`, `app/api/pro/profile/route.ts`, `app/api/admin/professionnels/route.ts` (fixed in Task 8), and `prisma/seed.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts` (fixed in Task 9).

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
Register a new test account at `http://localhost:3000/inscription`, log out, log back in at `/connexion` with the same credentials, then try "mot de passe oublié" and confirm the reset email flow still triggers (check server logs if email sending is stubbed locally). Confirm an existing pre-migration account (e.g. the seeded `demo@vendo.es` / `demo1234`, after Task 9's seed fix) can still log in.

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
- Produces: every new `Listing` and `Professional` row carries `siteId`.

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

Then replace:

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

(The `GET` handler and its `where` filter are intentionally left unscoped in this plan — see the "Global Constraints" note on deferred read-path filtering. `POST` alone is enough to keep the NOT NULL constraint satisfied.)

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

Then replace:

```ts
  const slug = await uniqueSlug(slugify(fields.name))
  const pro = await prisma.professional.create({
    data: { ...fields, slug, userId: session.user.id, tier: 'FREE' },
  })
```

with:

```ts
  const slug = await uniqueSlug(slugify(fields.name))
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({
    data: { ...fields, slug, userId: session.user.id, siteId, tier: 'FREE' },
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

Then replace:

```ts
  const pro = await prisma.professional.create({ data: parsed.data })
  return NextResponse.json(pro, { status: 201 })
```

with:

```ts
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({ data: { ...parsed.data, siteId } })
  return NextResponse.json(pro, { status: 201 })
```

- [ ] **Step 4: Verify the build**

Run:
```bash
npm run build
```
Expected: the errors for these three files (missing required `siteId` on create) are now gone. Still expected to fail: `prisma/seed.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts` — fixed next in Task 9, the last one.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
Log in as the test user created in Task 7, post a new listing via `/deposer-annonce`, and confirm it appears in `/annonces` and in `/admin/annonces`. Create a professional profile via the self-serve onboarding flow (or `/admin/professionnels` if Stripe isn't configured locally) and confirm it appears in `/professionnels`.

- [ ] **Step 6: Commit**

```bash
git add app/api/listings/route.ts app/api/pro/profile/route.ts app/api/admin/professionnels/route.ts
git commit -m "feat: attach siteId when creating listings and professionals"
```

---

### Task 9: Fix dev/seed scripts

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `prisma/make-admin.ts`
- Modify: `prisma/make-demo-pro.ts`

**Interfaces:**
- Consumes: `Site` model from Task 1; compound unique input `siteId_email` from Task 3.
- Produces: `npm run db:seed` and the two ad-hoc `tsx prisma/*.ts` scripts work against a fresh database and satisfy `npm run build`'s project-wide type check.

- [ ] **Step 1: Fix `prisma/seed.ts`**

In `prisma/seed.ts`, replace:

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

Then replace:

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

- [ ] **Step 2: Fix `prisma/make-admin.ts`**

Replace the whole file with:

```ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

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

- [ ] **Step 3: Fix `prisma/make-demo-pro.ts`**

In `prisma/make-demo-pro.ts`, replace:

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

Then find the professional creation block:

```ts
  const pro = await prisma.professional.upsert({
    where: { slug: 'sophie-martin-architecte' },
    update: {},
    create: {
      slug: 'sophie-martin-architecte',
      name: 'Sophie Martin Architecte',
      category: 'Architecture & Design',
```

and replace with:

```ts
  const pro = await prisma.professional.upsert({
    where: { slug: 'sophie-martin-architecte' },
    update: {},
    create: {
      slug: 'sophie-martin-architecte',
      siteId: site.id,
      name: 'Sophie Martin Architecte',
      category: 'Architecture & Design',
```

Then find the listing creation block:

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

and replace with:

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

- [ ] **Step 4: Verify the build passes cleanly**

Run:
```bash
npx tsc --noEmit && npm run build
```
Expected: **zero errors**. This is the first fully green build since Task 3 Step 6 — every call site touched by the schema change has now been fixed.

- [ ] **Step 5: Verify the scripts run**

```bash
npx tsx prisma/make-admin.ts
```
Expected: `✅ Admin créé : admin@vendo.es / Admin1234!` (idempotent — safe to re-run).

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts prisma/make-admin.ts prisma/make-demo-pro.ts
git commit -m "fix: attach siteId in seed and dev utility scripts"
```

---

### Task 10: End-to-end verification — Spain site unaffected + isolation proven

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full regression pass on the default (Spain) site**

```bash
npm run build && npm run start
```
With the server running on `http://localhost:3000` (which resolves to the default site via the proxy fallback), manually walk through:
- Homepage loads, categories menu renders.
- Browse `/annonces`, open a listing detail page.
- Register a new account, log in, log out.
- Post a new listing (`/deposer-annonce`), confirm it shows up.
- Browse `/professionnels`, open a professional's page.
- Admin: log in as `admin@vendo.es`, visit `/admin/categories`, `/admin/annonces`, `/admin/professionnels` — confirm all existing data (pre-migration) is still visible and manageable.

Expected: **identical behavior to before this plan** — this is the core "nothing breaks" requirement from the spec.

- [ ] **Step 2: Prove isolation with a second demo site**

With the dev server stopped, insert a second, inactive-for-now demo site directly via a one-off script (not committed — this is a manual verification aid):

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
const url = new URL(process.env.DATABASE_URL!)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url.toString() }) })
await prisma.site.upsert({
  where: { domain: 'demo-site.localhost' },
  update: {},
  create: { domain: 'demo-site.localhost', name: 'Demo Site', country: 'Belgique' },
})
console.log('demo site created')
await prisma.\$disconnect()
"
```

Restart `npm run dev`, then:
```bash
curl -s http://localhost:3000/api/categories -H "Host: 1000clic.fr" | head -c 300
curl -s http://localhost:3000/api/categories -H "Host: demo-site.localhost" | head -c 300
```
Expected: the first call returns the existing Spain categories (non-empty array). The second call returns `[]` (the demo site has no categories yet — proving the two sites are fully isolated, not sharing data). Then, as the admin (still logged in against the default site's session), POST a category through `/api/categories` while sending `Host: demo-site.localhost` and confirm it appears only when querying with that same `Host` header, never with `Host: 1000clic.fr`.

- [ ] **Step 3: Clean up the demo site**

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
const url = new URL(process.env.DATABASE_URL!)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url.toString() }) })
await prisma.site.delete({ where: { domain: 'demo-site.localhost' } })
console.log('demo site removed')
await prisma.\$disconnect()
"
```
(This will fail with a foreign-key error if any category/listing/professional/user was left attached to the demo site — clean those up first, or leave the demo site in place if you'd rather keep it for Plan 2's read-path scoping work.)

- [ ] **Step 4: Final commit**

No code changes in this task — if Steps 1–2 revealed no issues, this plan is complete. If anything needs fixing, fix it as a new commit before moving to Plan 2.

---

## What's next

This plan intentionally stops at the foundation layer. Once it's verified in production against the live `1000clic.fr` domain, **Plan 2** (`docs/superpowers/specs/2026-07-19-multi-pays-design.md`, "Plan 2 — Scoping données + panel admin") covers:
- Read-path filtering of `Listing`/`Professional` queries across the ~40 remaining files (public pages, admin pages, sitemap, exports, Stripe webhook lookups).
- Merging `SiteSettings` into `Site`.
- The admin "Sites & Pays" panel with a site switcher.

**Plan 3** then adds per-site legal pages, theming, Stripe metadata, and the real second-country rollout.
