# MySQL Migration (Neon → OVH) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exception: Task 1 and Task 8 are controller-executed, not subagent-dispatched — see their notes.**

**Goal:** Move the app's database from Neon (Postgres, managed) to a self-hosted MySQL database on the user's OVH dedicated server, with zero data loss and a safe, reversible cutover — without touching the parked `multi-pays-plan1-fondations` branch.

**Architecture:** Prisma's `datasource` provider switches from `postgresql` to `mysql`; the Neon-specific driver adapter (`@prisma/adapter-neon`) is removed in favor of Prisma's standard MySQL connector. The two Postgres-only array fields on `Professional` become proper relational tables. A one-off script migrates existing data by reading Postgres directly (via `@neondatabase/serverless`, already a dependency) and writing through the new MySQL-backed Prisma Client. The actual production cutover (flipping Vercel's `DATABASE_URL`) is a manual, human-supervised runbook step, not an automated task.

**Tech Stack:** Next.js 16, Prisma 6, MySQL 8.0.42 (OVH dedicated server, SSH host alias `ovh-db`), no automated test framework — verification is `npx tsc --noEmit` + manual smoke tests, same as this project's established pattern.

## Global Constraints

- This plan targets `main` (current mono-country schema) — the parked `multi-pays-plan1-fondations` branch and worktree are untouched by this work.
- No automated test framework is introduced. Verification = `npx tsc --noEmit` + manual checks described in each task.
- The production cutover (Task 8) is a documented runbook, executed live with the user watching — never dispatch it as an unattended subagent task, and never modify Vercel production environment variables without the user explicitly present and confirming.
- Task 1 (database/user provisioning over SSH to a real dedicated server) is controller-executed, not subagent-dispatched — this mirrors how the multi-pays plan handled its own sensitive migration step directly rather than delegating raw infrastructure credentials into a subagent's context.
- Reference spec: `docs/superpowers/specs/2026-07-20-mysql-migration-design.md`.
- Until Task 8's cutover, the app keeps running against Neon in production — every task before it must leave the live site completely unaffected. All work happens against the new MySQL database in isolation (nothing points at it yet) and, from Task 3 onward, against a local dev environment pointed at MySQL.
- **Environment variables**: `.env.local` is not auto-loaded by bare `npx prisma`/`npx tsx` commands (only `npm run dev`/`build`/`start` load it, via Next.js). Every task step that shows `export DATABASE_URL="$MYSQL_DATABASE_URL"` assumes `.env.local` (containing `MYSQL_DATABASE_URL` from Task 1, plus the existing `DATABASE_URL`/`DIRECT_URL` for Postgres) has first been loaded into the shell with `set -a && source .env.local && set +a` in the same shell session — do this once per terminal session before any task's commands, or prefix each command block with it.

---

### Task 1: Provision the MySQL database and user on OVH

**Controller-executed — do not dispatch to a subagent.** SSH access (`ovh-db` host alias) and the resulting database credentials should not be handed into a fresh subagent's context.

**Files:** none (infrastructure only).

**Interfaces:**
- Produces: a MySQL database named `vendo`, a MySQL user `vendo_user` with a generated password and full privileges on that database only, reachable remotely (matching the existing `<project>_user@%` convention already used by other databases on this server).

- [ ] **Step 1: Create the database and user**

Connect via SSH and run (as the `claude` user, which already has passwordless `mysql` CLI access per the existing convention):

```bash
ssh ovh-db "mysql -e \"
CREATE DATABASE IF NOT EXISTS vendo CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'vendo_user'@'%' IDENTIFIED BY '$(openssl rand -base64 24 | tr -d '=+/')';
GRANT ALL PRIVILEGES ON vendo.* TO 'vendo_user'@'%';
FLUSH PRIVILEGES;
\""
```

Generate the password locally first (don't let it only exist inside a remote shell history):
```bash
PASSWORD=$(openssl rand -base64 24 | tr -d '=+/')
echo "Generated password (save this now): $PASSWORD"
ssh ovh-db "mysql -e \"
CREATE DATABASE IF NOT EXISTS vendo CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'vendo_user'@'%' IDENTIFIED BY '${PASSWORD}';
GRANT ALL PRIVILEGES ON vendo.* TO 'vendo_user'@'%';
FLUSH PRIVILEGES;
\""
```

- [ ] **Step 2: Verify remote reachability**

From the local machine (not over SSH — this proves Vercel's serverless functions, which are also external to the OVH server, will be able to connect):
```bash
mysql -h 51.75.116.192 -u vendo_user -p"$PASSWORD" -e "SELECT 1;" vendo
```
Expected: `1` printed, no connection error. If this fails (firewall, bind-address), stop and investigate the server's MySQL `bind-address` config and firewall rules before continuing — do not proceed with a database that isn't actually reachable the way production will need it.

- [ ] **Step 3: Record the connection string**

Add to `.env.local` (do NOT commit — already gitignored) a new variable, alongside the existing Neon ones (which stay untouched and in use until Task 8's cutover):
```
MYSQL_DATABASE_URL="mysql://vendo_user:<PASSWORD>@51.75.116.192:3306/vendo"
```
(URL-encode the password if it contains `@`, `:`, `/`, or `%` characters — `openssl rand -base64` can produce `+`/`/`, already stripped above, but double-check.)

No commit for this step — it's a local secret, not code.

---

### Task 2: Convert `prisma/schema.prisma` to MySQL

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: `MYSQL_DATABASE_URL` from Task 1 (used as `DATABASE_URL` once this task points the datasource at it).
- Produces: `ProfessionalPhoto` and `ProfessionalZone` models (relations replacing the old `String[]` fields), a fresh single-migration history for MySQL.

- [ ] **Step 1: Switch the datasource and generator**

Replace:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
(`previewFeatures = ["driverAdapters"]` and `directUrl` were both Neon-specific — MySQL on a normal server needs neither.)

- [ ] **Step 2: Replace `Professional.photos`/`zones` with relations, and widen long-text/URL fields**

MySQL's Prisma connector defaults every bare `String` field to `VARCHAR(191)` — unlike Postgres, where an unannotated `String` is effectively unlimited. Every field below currently holds free text or URLs that can exceed 191 characters (blog article bodies, ad descriptions, image URLs with query strings, chat messages) and must be widened with `@db.Text` to preserve today's actual (unlimited) behavior. Fields used only for short, app-bounded values (slugs, emails, tokens, tier enums, color hex codes) are left as-is — they're already comfortably under 191 characters by construction.

Replace the `Professional` model:
```prisma
model Professional {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  category    String
  city        String
  description String?
  phone       String?
  whatsapp    String?
  website     String?
  logo        String?
  banner      String?
  photos      String[]
  tier        ProTier  @default(FREE)
  verified    Boolean  @default(false)
  featured    Boolean  @default(false)
  recommended Boolean  @default(false)
  zones       String[]
  phoneHidden Boolean  @default(false)
  userId      String?  @unique
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  stripeCustomerId             String?
  stripeSubscriptionId         String?
  subscriptionStatus           String?
  subscriptionPeriod           String?
  subscriptionCurrentPeriodEnd DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  clicks        ProClick[]
  businessCard  BusinessCard?
}
```
with:
```prisma
model Professional {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  category    String
  city        String
  description String?  @db.Text
  phone       String?
  whatsapp    String?
  website     String?  @db.Text
  logo        String?  @db.Text
  banner      String?  @db.Text
  photos      ProfessionalPhoto[]
  tier        ProTier  @default(FREE)
  verified    Boolean  @default(false)
  featured    Boolean  @default(false)
  recommended Boolean  @default(false)
  zones       ProfessionalZone[]
  phoneHidden Boolean  @default(false)
  userId      String?  @unique
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  stripeCustomerId             String?
  stripeSubscriptionId         String?
  subscriptionStatus           String?
  subscriptionPeriod           String?
  subscriptionCurrentPeriodEnd DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  clicks        ProClick[]
  businessCard  BusinessCard?
}

model ProfessionalPhoto {
  id             String       @id @default(cuid())
  professionalId String
  professional   Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  url            String       @db.Text
  order          Int          @default(0)

  @@index([professionalId])
}

model ProfessionalZone {
  id             String       @id @default(cuid())
  professionalId String
  professional   Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  zone           String

  @@index([professionalId])
}
```

- [ ] **Step 3: Widen the remaining long-text/URL fields across the rest of the schema**

In `model Listing`, replace:
```prisma
  title          String
  description    String
```
with:
```prisma
  title          String
  description    String         @db.Text
```

In `model ListingImage`, replace:
```prisma
  url       String
```
with:
```prisma
  url       String  @db.Text
```

In `model SiteSettings`, replace:
```prisma
  announcementText    String?
```
with:
```prisma
  announcementText    String? @db.Text
```

In `model Report`, replace:
```prisma
  reason    String
```
with:
```prisma
  reason    String   @db.Text
```

In `model BlogPost`, replace:
```prisma
  excerpt     String
  content     String
  coverImage  String?
```
with:
```prisma
  excerpt     String    @db.Text
  content     String    @db.Text
  coverImage  String?   @db.Text
```

In `model Message`, replace:
```prisma
  body       String
```
with:
```prisma
  body       String    @db.Text
```

- [ ] **Step 4: Generate the fresh migration against the new (empty) MySQL database**

```bash
rm -rf prisma/migrations
export DATABASE_URL="$MYSQL_DATABASE_URL"   # from Task 1's .env.local entry
npx prisma migrate dev --name init
```
Expected: unlike this project's Postgres/Neon history (which had a broken, partially-untracked migration chain — see the multi-pays plan's Global Constraints for that story), this MySQL database starts empty and under full Prisma control, so `migrate dev` should work normally here: it creates `prisma/migrations/<timestamp>_init/migration.sql` and applies it cleanly, no shadow-database errors.

- [ ] **Step 5: Verify**

```bash
npx prisma generate
npx tsc --noEmit
```
Expected: **this will fail** — every file instantiating `PrismaNeon` (Task 3), every `mode: 'insensitive'` query (Task 4), and every place treating `Professional.photos`/`zones` as a plain array (Task 5) no longer type-checks. This is expected; note the errors but don't fix them here.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: switch Prisma datasource from Postgres/Neon to MySQL"
```
(`prisma/migrations` — the old Postgres migration files are being replaced by the fresh MySQL-only history from Step 4; `git add` will show the old files deleted and the new `init` migration added.)

---

### Task 3: Convert Prisma Client instantiation off the Neon adapter

**Files:**
- Modify: `lib/prisma.ts`
- Modify: `prisma/seed.ts`
- Modify: `prisma/seed-categories.ts`
- Modify: `prisma/make-admin.ts`
- Modify: `prisma/make-demo-pro.ts`
- Modify: `prisma/seed-blog.ts`
- Modify: `prisma/seed-blog-i18n.ts`
- Modify: `prisma/seed-blog-images.ts`

**Interfaces:**
- Produces: every Prisma Client instantiation in the codebase reads `DATABASE_URL` directly via Prisma's standard MySQL connector — no `@prisma/adapter-neon`, no manual `pgbouncer` URL stripping (that was Neon/PgBouncer-specific and doesn't apply to MySQL).

- [ ] **Step 1: Convert `lib/prisma.ts`**

Replace the entire file:
```ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const raw = process.env.DATABASE_URL!
  // Strip pgbouncer param — not needed with @neondatabase/serverless HTTP driver
  const url = new URL(raw)
  url.searchParams.delete('pgbouncer')
  const connectionString = url.toString()
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```
with:
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Convert each of the 7 standalone scripts**

Every one of `prisma/seed.ts`, `prisma/seed-categories.ts`, `prisma/make-admin.ts`, `prisma/make-demo-pro.ts`, `prisma/seed-blog.ts`, `prisma/seed-blog-i18n.ts`, `prisma/seed-blog-images.ts` starts with the identical block:
```ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})
```
In each of the 7 files, replace that block with:
```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
```
Nothing else in any of these 7 files changes — only this header block.

- [ ] **Step 3: Verify**

```bash
export DATABASE_URL="$MYSQL_DATABASE_URL"
npx tsc --noEmit
```
Expected: the `PrismaNeon`-related errors are gone from all 8 files. Remaining errors (the `mode: 'insensitive'` files and the `Professional.photos`/`zones` files) are expected — Tasks 4 and 5 fix those.

- [ ] **Step 4: Commit**

```bash
git add lib/prisma.ts prisma/seed.ts prisma/seed-categories.ts prisma/make-admin.ts prisma/make-demo-pro.ts prisma/seed-blog.ts prisma/seed-blog-i18n.ts prisma/seed-blog-images.ts
git commit -m "feat: instantiate PrismaClient directly, drop Neon driver adapter"
```

---

### Task 4: Remove Postgres-only `mode: 'insensitive'` query option

**Files:**
- Modify: `app/professionnels/page.tsx`
- Modify: `app/[seo]/page.tsx`
- Modify: `app/annonces/page.tsx`
- Modify: `app/api/professionnels/route.ts`
- Modify: `app/api/listings/route.ts`
- Modify: `app/api/listings/suggest/route.ts`
- Modify: `app/api/admin/utilisateurs/route.ts`

**Interfaces:**
- Produces: all case-insensitive `contains` search filters work identically under MySQL's default collation (`utf8mb4_0900_ai_ci`, already case-insensitive — set explicitly on the `vendo` database in Task 1 Step 1), with no Prisma-level `mode` option (invalid on the MySQL connector).

- [ ] **Step 1: Find and fix every occurrence**

In each of the 7 files, find every occurrence of:
```ts
mode: 'insensitive'
```
This appears as part of a `contains` filter, e.g.:
```ts
{ title: { contains: q, mode: 'insensitive' as const } }
```
Remove the `mode` property entirely (and its trailing comma), e.g.:
```ts
{ title: { contains: q } }
```
Apply this same removal to every `mode: 'insensitive'` occurrence in each of the 7 files — the exact surrounding object shape differs per call site (some have `as const` after it, some don't; some are on `title`, others on `name`, `email`, `city`, etc.) — search each file individually for the literal string `mode: 'insensitive'` and delete just that key, preserving everything else about the surrounding query unchanged.

- [ ] **Step 2: Verify**

```bash
grep -rn "mode: 'insensitive'" app/ && echo "STILL PRESENT — fix missed" || echo "clean"
npx tsc --noEmit
```
Expected: `grep` finds nothing (prints "clean"). Remaining `tsc` errors are only the `Professional.photos`/`zones` files (Task 5).

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```
Test the search box on `/annonces` with a query in a different case than the stored data (e.g. search "CANAPÉ" when listings say "Canapé") and confirm results still appear — proving MySQL's default collation preserves the same case-insensitive behavior Postgres's `mode: 'insensitive'` provided.

- [ ] **Step 4: Commit**

```bash
git add app/professionnels/page.tsx "app/[seo]/page.tsx" app/annonces/page.tsx app/api/professionnels/route.ts app/api/listings/route.ts app/api/listings/suggest/route.ts app/api/admin/utilisateurs/route.ts
git commit -m "fix: drop Postgres-only mode:insensitive, rely on MySQL default collation"
```

---

### Task 5: Adapt `Professional.photos`/`zones` to the new relational tables

**Files:**
- Modify: `app/professionnels/[slug]/page.tsx`
- Modify: `app/mon-compte/profil-pro/page.tsx`
- Modify: `app/api/pro/profile/route.ts`
- Modify: `app/api/pro/upload/route.ts`
- Modify: `app/api/admin/professionnels/route.ts`
- Modify: `app/api/admin/professionnels/[id]/route.ts`
- Modify: `prisma/make-demo-pro.ts`

**Interfaces:**
- Consumes: `ProfessionalPhoto`/`ProfessionalZone` models from Task 2.
- Produces: every server-side read of a `Professional` continues to hand the frontend a plain `{ photos: string[], zones: string[] }` shape — **no frontend/client-component file changes are needed** (`ProDashboardClient.tsx`, `AdminProsClient.tsx`, `OnboardingWizard.tsx`, `ProGallery.tsx`, `ProMapClient.tsx` all already consume `photos`/`zones` as flat string arrays via JSON, and continue to receive exactly that shape).

- [ ] **Step 1: `app/professionnels/[slug]/page.tsx` — read + map**

Replace:
```ts
  const pro = await prisma.professional.findUnique({ where: { slug } })
  if (!pro) notFound()
```
with:
```ts
  const proRow = await prisma.professional.findUnique({
    where: { slug },
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  if (!proRow) notFound()
  const pro = { ...proRow, photos: proRow.photos.map(p => p.url), zones: proRow.zones.map(z => z.zone) }
```

- [ ] **Step 2: `app/mon-compte/profil-pro/page.tsx` — read + map**

Replace:
```ts
  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { businessCard: true },
  })
```
with:
```ts
  const proRow = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { businessCard: true, photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  const pro = proRow
    ? { ...proRow, photos: proRow.photos.map(p => p.url), zones: proRow.zones.map(z => z.zone) }
    : null
```

- [ ] **Step 3: `app/api/pro/profile/route.ts` — POST (create), GET (read), PATCH (update)**

Replace the `POST` handler's create call:
```ts
  const slug = await uniqueSlug(slugify(fields.name))
  const pro = await prisma.professional.create({
    data: { ...fields, slug, userId: session.user.id, tier: 'FREE' },
  })
```
with:
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

Replace the `GET` handler:
```ts
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(pro ?? null)
}
```
with:
```ts
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proRow = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  if (!proRow) return NextResponse.json(null)
  return NextResponse.json({ ...proRow, photos: proRow.photos.map(p => p.url), zones: proRow.zones.map(z => z.zone) })
}
```

Replace the `PATCH` handler:
```ts
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile linked' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'phone', 'whatsapp', 'website', 'city', 'zones', 'logo', 'banner', 'photos', 'phoneHidden'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const updated = await prisma.professional.update({
    where: { id: pro.id },
    data,
  })
  return NextResponse.json(updated)
}
```
with:
```ts
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile linked' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'phone', 'whatsapp', 'website', 'city', 'logo', 'banner', 'phoneHidden'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  // photos/zones are relations now — the client always sends the full desired
  // array (both the zones-edit form and the photo-removal flow in
  // ProDashboardClient.tsx replace the whole list), so replace-all is correct.
  if ('zones' in body && Array.isArray(body.zones)) {
    await prisma.professionalZone.deleteMany({ where: { professionalId: pro.id } })
    if (body.zones.length > 0) {
      await prisma.professionalZone.createMany({
        data: (body.zones as string[]).map(zone => ({ professionalId: pro.id, zone })),
      })
    }
  }
  if ('photos' in body && Array.isArray(body.photos)) {
    await prisma.professionalPhoto.deleteMany({ where: { professionalId: pro.id } })
    if (body.photos.length > 0) {
      await prisma.professionalPhoto.createMany({
        data: (body.photos as string[]).map((url, order) => ({ professionalId: pro.id, url, order })),
      })
    }
  }

  const updatedRow = await prisma.professional.update({
    where: { id: pro.id },
    data,
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  return NextResponse.json({ ...updatedRow, photos: updatedRow.photos.map(p => p.url), zones: updatedRow.zones.map(z => z.zone) })
}
```

- [ ] **Step 4: `app/api/pro/upload/route.ts` — append one photo**

Replace:
```ts
  } else {
    await prisma.professional.update({ where: { id: pro.id }, data: { photos: { push: blob.url } } })
  }
```
with:
```ts
  } else {
    const photoCount = await prisma.professionalPhoto.count({ where: { professionalId: pro.id } })
    await prisma.professionalPhoto.create({ data: { professionalId: pro.id, url: blob.url, order: photoCount } })
  }
```

- [ ] **Step 5: `app/api/admin/professionnels/route.ts` — POST (create)**

Replace:
```ts
  const pro = await prisma.professional.create({ data: parsed.data })
  return NextResponse.json(pro, { status: 201 })
```
with:
```ts
  const { photos, ...rest } = parsed.data
  const pro = await prisma.professional.create({
    data: { ...rest, photos: { create: photos.map((url, order) => ({ url, order })) } },
  })
  return NextResponse.json(pro, { status: 201 })
```

- [ ] **Step 6: `app/api/admin/professionnels/[id]/route.ts` — PUT (update)**

Replace:
```ts
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const pro = await prisma.professional.update({ where: { id }, data: parsed.data })
  return NextResponse.json(pro)
}
```
with:
```ts
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { photos, ...rest } = parsed.data
  if (photos) {
    await prisma.professionalPhoto.deleteMany({ where: { professionalId: id } })
    if (photos.length > 0) {
      await prisma.professionalPhoto.createMany({
        data: photos.map((url, order) => ({ professionalId: id, url, order })),
      })
    }
  }

  const pro = await prisma.professional.update({
    where: { id },
    data: rest,
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  return NextResponse.json({ ...pro, photos: pro.photos.map(p => p.url), zones: pro.zones.map(z => z.zone) })
}
```

- [ ] **Step 7: `prisma/make-demo-pro.ts` — seed data**

Find the `professional.upsert` block (it sets `photos: [...]` and `zones: [...]` directly as arrays in `create`). Replace the two array fields inside the existing `create` object:
```ts
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      ],
```
and
```ts
      zones: ['Valencia', 'Valence', 'Barcelone', 'Alicante'],
```
with:
```ts
      photos: {
        create: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
          'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
        ].map((url, order) => ({ url, order })),
      },
```
and
```ts
      zones: { create: ['Valencia', 'Valence', 'Barcelone', 'Alicante'].map(zone => ({ zone })) },
```
Note: since this is an `upsert` with `update: {}` (no-op on existing rows) and `create: {...}`, the nested `create` syntax for relations only applies on first creation — that matches the existing script's intent (idempotent, only sets these on first run).

- [ ] **Step 8: Verify**

```bash
export DATABASE_URL="$MYSQL_DATABASE_URL"
npx tsc --noEmit
```
Expected: **zero errors** project-wide. This is the last file-fixing task — every file touched by the Postgres→MySQL switch is now converted.

- [ ] **Step 9: Manual verification**

```bash
npm run dev
```
(Dev server now points at the empty MySQL database via `DATABASE_URL=$MYSQL_DATABASE_URL` — nothing exists yet, that's expected and fine for this check.) Run `npx tsx prisma/make-admin.ts`, log in as `admin@vendo.es`, then run `npx tsx prisma/make-demo-pro.ts` and confirm no errors — this exercises the exact relational `create` paths just written. Visit `/professionnels/sophie-martin-architecte` and confirm the photos gallery and zones both render correctly, proving the read-side mapping (Step 1) works end-to-end against real relational data.

- [ ] **Step 10: Commit**

```bash
git add app/professionnels/[slug]/page.tsx app/mon-compte/profil-pro/page.tsx app/api/pro/profile/route.ts app/api/pro/upload/route.ts app/api/admin/professionnels/route.ts "app/api/admin/professionnels/[id]/route.ts" prisma/make-demo-pro.ts
git commit -m "feat: adapt Professional.photos/zones to relational tables"
```

---

### Task 6: Data migration script (Postgres → MySQL)

**Files:**
- Create: `prisma/migrate-postgres-to-mysql.ts`

**Interfaces:**
- Consumes: the OLD Postgres database (read-only, via `@neondatabase/serverless` — NOT via Prisma Client, since Prisma Client is now MySQL-only after Task 2) and the NEW MySQL database (write, via the standard Prisma Client from `lib/prisma.ts`).
- Produces: every row from every table copied from Postgres into MySQL, with identical `id` values (preserving all foreign key relationships without remapping), plus `Professional.photos`/`zones` arrays expanded into `ProfessionalPhoto`/`ProfessionalZone` rows.

- [ ] **Step 1: Write the migration script**

Create `prisma/migrate-postgres-to-mysql.ts`:

```ts
import { neon } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client'

const pg = neon(process.env.OLD_POSTGRES_DATABASE_URL!)
const mysql = new PrismaClient() // reads DATABASE_URL — must be the MySQL URL when this runs

async function main() {
  console.log('Migrating Users...')
  const users = await pg`SELECT * FROM "User"`
  for (const u of users) {
    await mysql.user.upsert({
      where: { id: u.id as string },
      update: {},
      create: {
        id: u.id as string, name: u.name as string, email: u.email as string,
        passwordHash: u.passwordHash as string, role: u.role as 'USER' | 'PREMIUM' | 'ADMIN',
        blocked: u.blocked as boolean, createdAt: u.createdAt as Date,
        showPhone: u.showPhone as boolean, showWhatsapp: u.showWhatsapp as boolean,
      },
    })
  }
  console.log(`  ${users.length} users`)

  console.log('Migrating Categories (2 passes to handle N-level hierarchy — create all with no parent, then wire up parentId once every row exists)...')
  const categories = await pg`SELECT * FROM "Category"`
  for (const c of categories) {
    await mysql.category.upsert({
      where: { id: c.id as string },
      update: {},
      create: {
        id: c.id as string, slug: c.slug as string, label: c.label as string, icon: c.icon as string,
        order: c.order as number, parentId: null, // wired up in the second pass below
        createdAt: c.createdAt as Date, updatedAt: c.updatedAt as Date,
      },
    })
  }
  for (const c of categories) {
    if (c.parentId) {
      await mysql.category.update({ where: { id: c.id as string }, data: { parentId: c.parentId as string } })
    }
  }
  console.log(`  ${categories.length} categories`)

  console.log('Migrating CategoryTranslations...')
  const catTranslations = await pg`SELECT * FROM "CategoryTranslation"`
  for (const t of catTranslations) {
    await mysql.categoryTranslation.upsert({
      where: { id: t.id as string },
      update: {},
      create: {
        id: t.id as string, categoryId: t.categoryId as string, locale: t.locale as string,
        label: t.label as string, createdAt: t.createdAt as Date, updatedAt: t.updatedAt as Date,
      },
    })
  }
  console.log(`  ${catTranslations.length} category translations`)

  console.log('Migrating Listings...')
  const listings = await pg`SELECT * FROM "Listing"`
  for (const l of listings) {
    await mysql.listing.upsert({
      where: { id: l.id as string },
      update: {},
      create: {
        id: l.id as string, title: l.title as string, description: l.description as string,
        price: l.price as number | null, categorySlug: l.categorySlug as string,
        city: l.city as string, neighborhood: l.neighborhood as string,
        status: l.status as 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED' | 'DELETED',
        userId: l.userId as string, phone: l.phone as string | null, views: l.views as number,
        isPremium: l.isPremium as boolean, boostExpiresAt: l.boostExpiresAt as Date | null,
        featuredAt: l.featuredAt as Date | null, publishedAt: l.publishedAt as Date,
        updatedAt: l.updatedAt as Date, lat: l.lat as number | null, lng: l.lng as number | null,
        blockedReason: l.blockedReason as string | null,
      },
    })
  }
  console.log(`  ${listings.length} listings`)

  console.log('Migrating ListingImages...')
  const images = await pg`SELECT * FROM "ListingImage"`
  for (const img of images) {
    await mysql.listingImage.upsert({
      where: { id: img.id as string },
      update: {},
      create: { id: img.id as string, listingId: img.listingId as string, url: img.url as string, order: img.order as number },
    })
  }
  console.log(`  ${images.length} listing images`)

  console.log('Migrating Favorites...')
  const favorites = await pg`SELECT * FROM "Favorite"`
  for (const f of favorites) {
    await mysql.favorite.upsert({
      where: { id: f.id as string },
      update: {},
      create: { id: f.id as string, userId: f.userId as string, listingId: f.listingId as string, createdAt: f.createdAt as Date },
    })
  }
  console.log(`  ${favorites.length} favorites`)

  console.log('Migrating Messages...')
  const messages = await pg`SELECT * FROM "Message"`
  for (const m of messages) {
    await mysql.message.upsert({
      where: { id: m.id as string },
      update: {},
      create: {
        id: m.id as string, listingId: m.listingId as string, senderId: m.senderId as string,
        receiverId: m.receiverId as string, body: m.body as string,
        readAt: m.readAt as Date | null, createdAt: m.createdAt as Date,
      },
    })
  }
  console.log(`  ${messages.length} messages`)

  console.log('Migrating Reports...')
  const reports = await pg`SELECT * FROM "Report"`
  for (const r of reports) {
    await mysql.report.upsert({
      where: { id: r.id as string },
      update: {},
      create: { id: r.id as string, listingId: r.listingId as string, userId: r.userId as string | null, reason: r.reason as string, createdAt: r.createdAt as Date },
    })
  }
  console.log(`  ${reports.length} reports`)

  console.log('Migrating Professionals (+ photos/zones)...')
  const pros = await pg`SELECT * FROM "Professional"`
  for (const p of pros) {
    await mysql.professional.upsert({
      where: { id: p.id as string },
      update: {},
      create: {
        id: p.id as string, slug: p.slug as string, name: p.name as string, category: p.category as string,
        city: p.city as string, description: p.description as string | null, phone: p.phone as string | null,
        whatsapp: p.whatsapp as string | null, website: p.website as string | null, logo: p.logo as string | null,
        banner: p.banner as string | null,
        tier: p.tier as 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS',
        verified: p.verified as boolean, featured: p.featured as boolean, recommended: p.recommended as boolean,
        phoneHidden: p.phoneHidden as boolean, userId: p.userId as string | null,
        stripeCustomerId: p.stripeCustomerId as string | null, stripeSubscriptionId: p.stripeSubscriptionId as string | null,
        subscriptionStatus: p.subscriptionStatus as string | null, subscriptionPeriod: p.subscriptionPeriod as string | null,
        subscriptionCurrentPeriodEnd: p.subscriptionCurrentPeriodEnd as Date | null,
        createdAt: p.createdAt as Date, updatedAt: p.updatedAt as Date,
        photos: { create: ((p.photos as string[]) ?? []).map((url, order) => ({ url, order })) },
        zones: { create: ((p.zones as string[]) ?? []).map(zone => ({ zone })) },
      },
    })
  }
  console.log(`  ${pros.length} professionals`)

  console.log('Migrating ProClicks...')
  const clicks = await pg`SELECT * FROM "ProClick"`
  for (const c of clicks) {
    await mysql.proClick.upsert({
      where: { id: c.id as string },
      update: {},
      create: { id: c.id as string, professionalId: c.professionalId as string, type: c.type as string, createdAt: c.createdAt as Date },
    })
  }
  console.log(`  ${clicks.length} pro clicks`)

  console.log('Migrating BusinessCards...')
  const cards = await pg`SELECT * FROM "BusinessCard"`
  for (const bc of cards) {
    await mysql.businessCard.upsert({
      where: { id: bc.id as string },
      update: {},
      create: {
        id: bc.id as string, professionalId: bc.professionalId as string,
        headline: bc.headline as string | null, tagline: bc.tagline as string | null,
        primaryColor: bc.primaryColor as string, showEmail: bc.showEmail as boolean,
        showPhone: bc.showPhone as boolean, showWhatsapp: bc.showWhatsapp as boolean,
        showWebsite: bc.showWebsite as boolean, email: bc.email as string | null,
        plan: bc.plan as string | null, active: bc.active as boolean,
        stripeSessionId: bc.stripeSessionId as string | null, stripeSubscriptionId: bc.stripeSubscriptionId as string | null,
        stripeCustomerId: bc.stripeCustomerId as string | null, subscriptionStatus: bc.subscriptionStatus as string | null,
        subscriptionCurrentPeriodEnd: bc.subscriptionCurrentPeriodEnd as Date | null,
        createdAt: bc.createdAt as Date, updatedAt: bc.updatedAt as Date,
      },
    })
  }
  console.log(`  ${cards.length} business cards`)

  console.log('Migrating PasswordResetTokens...')
  const tokens = await pg`SELECT * FROM "PasswordResetToken"`
  for (const t of tokens) {
    await mysql.passwordResetToken.upsert({
      where: { id: t.id as string },
      update: {},
      create: { id: t.id as string, userId: t.userId as string, token: t.token as string, expiresAt: t.expiresAt as Date, usedAt: t.usedAt as Date | null, createdAt: t.createdAt as Date },
    })
  }
  console.log(`  ${tokens.length} password reset tokens`)

  console.log('Migrating PhotoUpgrades...')
  const upgrades = await pg`SELECT * FROM "PhotoUpgrade"`
  for (const pu of upgrades) {
    await mysql.photoUpgrade.upsert({
      where: { id: pu.id as string },
      update: {},
      create: { id: pu.id as string, userId: pu.userId as string, stripeSessionId: pu.stripeSessionId as string, paid: pu.paid as boolean, used: pu.used as boolean, createdAt: pu.createdAt as Date },
    })
  }
  console.log(`  ${upgrades.length} photo upgrades`)

  console.log('Migrating BlogPosts...')
  const posts = await pg`SELECT * FROM "BlogPost"`
  for (const bp of posts) {
    await mysql.blogPost.upsert({
      where: { id: bp.id as string },
      update: {},
      create: {
        id: bp.id as string, slug: bp.slug as string, lang: bp.lang as string, title: bp.title as string,
        excerpt: bp.excerpt as string, content: bp.content as string, coverImage: bp.coverImage as string | null,
        category: bp.category as string, author: bp.author as string, published: bp.published as boolean,
        publishedAt: bp.publishedAt as Date | null, readTime: bp.readTime as number,
        createdAt: bp.createdAt as Date, updatedAt: bp.updatedAt as Date,
      },
    })
  }
  console.log(`  ${posts.length} blog posts`)

  console.log('Migrating SiteSettings...')
  const settings = await pg`SELECT * FROM "SiteSettings"`
  for (const s of settings) {
    await mysql.siteSettings.upsert({
      where: { id: s.id as string },
      update: {},
      create: {
        id: s.id as string, autoPublish: s.autoPublish as boolean,
        heroImages: s.heroImages as object, announcementText: s.announcementText as string | null,
        announcementEnabled: s.announcementEnabled as boolean, contactEmail: s.contactEmail as string | null,
        maintenanceMode: s.maintenanceMode as boolean,
      },
    })
  }
  console.log(`  ${settings.length} site settings rows`)

  // RateLimitHit is intentionally NOT migrated — it's a rolling, short-lived
  // rate-limit log with no downstream relations; starting empty on MySQL is correct.

  console.log('\nVerifying row counts...')
  const checks: [string, number, () => Promise<number>][] = [
    ['User', users.length, () => mysql.user.count()],
    ['Category', categories.length, () => mysql.category.count()],
    ['CategoryTranslation', catTranslations.length, () => mysql.categoryTranslation.count()],
    ['Listing', listings.length, () => mysql.listing.count()],
    ['ListingImage', images.length, () => mysql.listingImage.count()],
    ['Favorite', favorites.length, () => mysql.favorite.count()],
    ['Message', messages.length, () => mysql.message.count()],
    ['Report', reports.length, () => mysql.report.count()],
    ['Professional', pros.length, () => mysql.professional.count()],
    ['ProClick', clicks.length, () => mysql.proClick.count()],
    ['BusinessCard', cards.length, () => mysql.businessCard.count()],
    ['PasswordResetToken', tokens.length, () => mysql.passwordResetToken.count()],
    ['PhotoUpgrade', upgrades.length, () => mysql.photoUpgrade.count()],
    ['BlogPost', posts.length, () => mysql.blogPost.count()],
    ['SiteSettings', settings.length, () => mysql.siteSettings.count()],
  ]
  let allOk = true
  for (const [table, expected, countFn] of checks) {
    const actual = await countFn()
    const ok = actual === expected
    if (!ok) allOk = false
    console.log(`  ${table}: source=${expected} mysql=${actual} ${ok ? '✅' : '❌'}`)
  }
  if (!allOk) throw new Error('Row count mismatch — see ❌ above. Do not proceed to cutover.')
  console.log('\n✅ Migration complete, all row counts match.')
}

main().catch(err => { console.error(err); process.exit(1) }).finally(() => mysql.$disconnect())
```

- [ ] **Step 2: Verify it compiles**

```bash
export DATABASE_URL="$MYSQL_DATABASE_URL"
npx tsc --noEmit
```
Expected: zero errors (this file is new but follows the same typed patterns as the rest of the fixed codebase).

- [ ] **Step 3: Commit**

```bash
git add prisma/migrate-postgres-to-mysql.ts
git commit -m "feat: add Postgres-to-MySQL data migration script"
```

(This script is not run as part of this task — Task 7 runs it as a read-only-on-Postgres rehearsal.)

---

### Task 7: Rehearsal run and full verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: `prisma/migrate-postgres-to-mysql.ts` from Task 6, the real (untouched) Neon Postgres data, the empty MySQL database from Task 1.

- [ ] **Step 1: Run the rehearsal migration**

This reads the live Postgres database (read-only — the script only ever `SELECT`s from Postgres) and writes into the still-otherwise-empty MySQL database. Zero risk to the live site, which keeps running against Postgres throughout.

```bash
export DATABASE_URL="$MYSQL_DATABASE_URL"
export OLD_POSTGRES_DATABASE_URL="$DIRECT_URL"   # the existing Postgres direct-connection URL, unchanged in .env.local
npx tsx prisma/migrate-postgres-to-mysql.ts
```
Expected: every table's migration count logged, ending in `✅ Migration complete, all row counts match.` If it throws on a row-count mismatch, stop and investigate before continuing — do not proceed to Task 8 with unverified data parity.

- [ ] **Step 2: Full manual regression pass against MySQL**

```bash
npm run dev   # DATABASE_URL still pointed at MySQL from Step 1
```
Walk through the same checks used at the end of the multi-pays plan's Task 10 (this project's established regression checklist):
- Homepage loads, categories menu renders with real (migrated) categories.
- Browse `/annonces`, open a real migrated listing's detail page — confirm title, description (long-text `@db.Text` field), images all render correctly.
- Log in with a real pre-existing account (e.g. `demo@vendo.es` / `demo1234`) — confirms `passwordHash` migrated correctly and login still works.
- Browse `/professionnels`, open a professional's detail page — confirm photos gallery and zones both render (proving the relational migration + read-mapping from Task 5 works against real migrated data, not just the freshly-seeded demo pro from Task 5 Step 9).
- Search for a listing using a different case than stored (e.g. uppercase) — confirms Task 4's collation-based case-insensitivity works on real data.
- `/admin/annonces`, `/admin/professionnels`, `/admin/categories` all show the full migrated dataset with correct counts.
- Post a **new** test listing and a **new** test message — confirms writes work correctly against MySQL, not just reads (clean up this test data afterward with a targeted delete, the same way the multi-pays plan's Task 10 did).

- [ ] **Step 3: Final compile check**

```bash
npx tsc --noEmit
```
Expected: zero errors — this is the final gate before the migration is considered code-complete and rehearsed.

- [ ] **Step 4: Report**

No code changes in this task. If Steps 1–2 revealed no issues, this plan's implementation work is complete and ready for Task 8's cutover runbook. If anything needs fixing, fix it as a new commit in the relevant earlier task's area before proceeding.

---

### Task 8: Production cutover — runbook (NOT automated)

**This task is a documented procedure to execute live with the user, not a subagent dispatch.** It is included here so the sequence is planned and reviewable in advance, but must never be run unattended — it flips real production traffic.

- [ ] **Step 1: Final data sync**

Re-run the Task 6 script one last time, immediately before cutover, to capture any writes made to Postgres between the Task 7 rehearsal and now:
```bash
export DATABASE_URL="$MYSQL_DATABASE_URL"
export OLD_POSTGRES_DATABASE_URL="$DIRECT_URL"
npx tsx prisma/migrate-postgres-to-mysql.ts
```

- [ ] **Step 2: Enable maintenance mode**

Via the admin panel (`/admin/parametres`), toggle `maintenanceMode` on. Confirm the live site shows the maintenance page.

- [ ] **Step 3: Final sync (post-maintenance)**

Re-run the migration script one more time, now that no new writes can land on Postgres (maintenance mode blocks user actions) — this is the authoritative final sync.

- [ ] **Step 4: Merge and deploy the code**

Merge this plan's branch to `main` (if it was built on a separate branch/worktree — check with the user's preference at execution time, matching the pattern established for the multi-pays plan). Update Vercel's Production environment variables: set `DATABASE_URL` to the MySQL connection string, remove `DIRECT_URL` (no longer used). Redeploy.

- [ ] **Step 5: Smoke test**

Immediately after deploy, with maintenance mode still on (so only admin/testing traffic hits the new setup): log in as admin, check `/admin/annonces`, `/admin/professionnels`, `/admin/categories` show correct data, post one test listing, confirm it appears.

- [ ] **Step 6: Go live**

Disable maintenance mode. Monitor for errors (Vercel logs) for the first several minutes of real traffic.

- [ ] **Step 7: Keep Neon as a rollback safety net**

Do not delete or downgrade the Neon project yet. If a problem surfaces, the fastest rollback is: re-enable maintenance mode, flip `DATABASE_URL` back to the Neon connection string in Vercel, redeploy, disable maintenance mode — Neon still has all data up to the Step 1/3 sync point. Keep Neon paused-but-available for 1–2 weeks before considering decommissioning it.

---

## What's next

Once this migration is live and stable, the parked `multi-pays-plan1-fondations` branch gets revisited: its Postgres-specific migration commands (documented in `docs/superpowers/plans/2026-07-19-multi-pays-plan1-fondations.md`) will need to be regenerated against MySQL, but its application code (site scoping, `proxy.ts`, `lib/site.ts`, etc.) doesn't depend on the database provider and should carry over largely unchanged.
