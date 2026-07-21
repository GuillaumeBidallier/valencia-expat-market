# `Site.publiclyLive` Tripwire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `publiclyLive` flag to `Site` so a newly created site cannot silently accumulate real public-facing data (listings, professional profiles) before an operator deliberately marks it ready to go live.

**Architecture:** One additive Prisma migration (new boolean column, default `true`, preserving today's single-site behavior); the admin site-creation endpoint explicitly sets `publiclyLive: false` for any *new* site; a second toggle in the `/admin/sites` UI lets an operator flip it; the two public self-serve creation endpoints (listing submission, professional self-registration) check the flag and reject with 403 if the target site isn't live yet.

**Tech Stack:** Next.js 16 App Router, Prisma 6, MySQL, zod.

## Global Constraints

- Work happens against `vendo_dev`, never production. Verify with `npx prisma migrate status` before any DB command — the same discipline used throughout the multi-pays MySQL work (Plan 1 and Plan 2).
- This is NOT a substitute for scoping the public read paths (`app/annonces`, `app/professionnels`, `app/page.tsx`) by `siteId` — that remains a separate, larger, deferred effort ("Plan 3"). This plan only prevents silent/accidental data accumulation on a non-live site; once an operator deliberately flips `publiclyLive: true`, the underlying read-path leak this was built to guard against is fully back until Plan 3 ships. Do not expand this plan's scope to cover public read-path scoping.
- Do not gate admin-created listings/professionals (`app/api/admin/annonces`, `app/api/admin/professionnels`) — admins are trusted and may need to seed data before flipping a site live.
- Do not gate `POST /api/auth/register` — account creation alone renders nothing on public pages.
- Reference spec: `docs/superpowers/specs/2026-07-21-publicly-live-tripwire-design.md`.
- Reference prior work (same branch): Plan 1 (`docs/superpowers/plans/2026-07-20-multi-pays-mysql-plan1-fondations.md`), Plan 2 (`docs/superpowers/plans/2026-07-21-multi-pays-plan2-admin-sites.md`).

---

### Task 1: Add `publiclyLive` to the schema and wire up site creation + the admin toggle

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `app/api/admin/sites/route.ts`
- Modify: `app/api/admin/sites/[id]/route.ts`
- Modify: `app/admin/sites/AdminSitesClient.tsx`

**Interfaces:**
- Produces: `Site.publiclyLive: boolean` field, present in every `Site` row and every API response that returns a site; `PUT /api/admin/sites/[id]` accepts an optional `publiclyLive` boolean.

- [ ] **Step 1: Add the field to the schema**

In `prisma/schema.prisma`, in `model Site`, add `publiclyLive` right after `active`:
```prisma
model Site {
  id             String   @id @default(cuid())
  domain         String   @unique
  name           String
  country        String
  primaryColor   String   @default("#F97316")
  secondaryColor String   @default("#12122A")
  active         Boolean  @default(true)
  publiclyLive   Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  categories    Category[]
  listings      Listing[]
  professionals Professional[]
  users         User[]
}
```

- [ ] **Step 2: Run the migration**

First verify you're on `vendo_dev`:
```bash
npx prisma migrate status
```
Expected: mentions `vendo_dev`, not production. If it mentions production, STOP and report BLOCKED.

Then:
```bash
npx prisma migrate dev --name add_site_publicly_live
```
This is purely additive (new nullable-then-defaulted boolean column) — expect no data loss warnings. If prompted interactively and you have no TTY, the same `expect`-based workaround used in Plan 1 Task 3 is acceptable (verify the generated SQL is a plain `ALTER TABLE ... ADD COLUMN` with a default, nothing destructive).

- [ ] **Step 3: New sites start non-live**

In `app/api/admin/sites/route.ts`, replace:
```ts
  const site = await prisma.site.create({ data: parsed.data })
  return NextResponse.json(site, { status: 201 })
```
with:
```ts
  const site = await prisma.site.create({ data: { ...parsed.data, publiclyLive: false } })
  return NextResponse.json(site, { status: 201 })
```

- [ ] **Step 4: Let the update endpoint accept `publiclyLive`**

In `app/api/admin/sites/[id]/route.ts`, replace:
```ts
const updateSchema = z.object({
  name:           z.string().min(1).max(80).optional(),
  country:        z.string().min(1).max(80).optional(),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  active:         z.boolean().optional(),
})
```
with:
```ts
const updateSchema = z.object({
  name:           z.string().min(1).max(80).optional(),
  country:        z.string().min(1).max(80).optional(),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  active:         z.boolean().optional(),
  publiclyLive:   z.boolean().optional(),
})
```

- [ ] **Step 5: Add the toggle to the admin UI**

In `app/admin/sites/AdminSitesClient.tsx`:

Update the `Site` type (add the field):
```tsx
type Site = {
  id: string; domain: string; name: string; country: string
  primaryColor: string; secondaryColor: string; active: boolean; publiclyLive: boolean
  createdAt: string; updatedAt: string
}
```

Add a second toggle function next to `toggleActive` (same try/catch/error-banner shape established in Plan 2's Task 3 fix):
```tsx
  async function togglePubliclyLive(site: Site) {
    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publiclyLive: !site.publiclyLive }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Erreur lors de la mise à jour du statut public')
        return
      }
      const updated = await res.json()
      setError(null)
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, ...updated } : s))
    } catch {
      setError('Erreur réseau lors de la mise à jour du statut public')
    }
  }
```

Render it next to the existing active-toggle button. Replace:
```tsx
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(site)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${site.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {site.active ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => openEdit(site)} className="text-gray-400 hover:text-navy transition-colors">
                  <Pencil size={16} />
                </button>
              </div>
```
with:
```tsx
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePubliclyLive(site)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${site.publiclyLive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                  title="Bascule si les formulaires publics (annonces, inscription pro) sont ouverts sur ce site"
                >
                  {site.publiclyLive ? 'Publié' : 'Pas encore public'}
                </button>
                <button
                  onClick={() => toggleActive(site)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${site.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {site.active ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => openEdit(site)} className="text-gray-400 hover:text-navy transition-colors">
                  <Pencil size={16} />
                </button>
              </div>
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 7: Manual verification**

`npm run dev`, visit `/admin/sites`. Confirm the existing default site shows "Publié" (its `publiclyLive` was backfilled to `true` by the migration). Create a test site, confirm it shows "Pas encore public" immediately after creation. Toggle it to "Publié" and back, confirm it persists across a reload. Delete the test site's underlying row afterward (it has zero referencing data, same cleanup approach as Plan 2 Task 10) so the DB is left clean.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations app/api/admin/sites/route.ts app/api/admin/sites/\[id\]/route.ts app/admin/sites/AdminSitesClient.tsx
git commit -m "feat: add Site.publiclyLive field and admin toggle"
```

---

### Task 2: Gate public listing and professional self-registration on `publiclyLive`

**Files:**
- Modify: `app/api/listings/route.ts`
- Modify: `app/api/pro/profile/route.ts`

**Interfaces:**
- Consumes: `Site.publiclyLive` (Task 1).
- Produces: both public self-serve creation endpoints reject with `403` when the resolving site isn't yet publicly live.

- [ ] **Step 1: Gate `app/api/listings/route.ts`**

Replace:
```ts
  const { lat: _lat, lng: _lng, ...listingData } = parsed.data
  void _lat; void _lng
  const siteId = await getCurrentSiteId()

  const listing = await prisma.listing.create({
```
with:
```ts
  const { lat: _lat, lng: _lng, ...listingData } = parsed.data
  void _lat; void _lng
  const siteId = await getCurrentSiteId()

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { publiclyLive: true } })
  if (!site?.publiclyLive) {
    return NextResponse.json({ error: 'Ce site n\'est pas encore ouvert au public.' }, { status: 403 })
  }

  const listing = await prisma.listing.create({
```

- [ ] **Step 2: Gate `app/api/pro/profile/route.ts`**

Replace:
```ts
  const { zones, ...restFields } = fields
  const slug = await uniqueSlug(slugify(fields.name))
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({
```
with:
```ts
  const { zones, ...restFields } = fields
  const slug = await uniqueSlug(slugify(fields.name))
  const siteId = await getCurrentSiteId()

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { publiclyLive: true } })
  if (!site?.publiclyLive) {
    return NextResponse.json({ error: 'Ce site n\'est pas encore ouvert au public.' }, { status: 403 })
  }

  const pro = await prisma.professional.create({
```
Note: this check must run before the Stripe `priceId` validation and before `prisma.professional.create()` — but it must run after the `existing` fiche check and the zod parse, matching the insertion point shown (right after `siteId` is resolved, before any DB write or Stripe call).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Manual verification**

`npm run dev`. On the default (Spain) site (now `publiclyLive: true` after Task 1's migration backfill), confirm posting a test listing and starting a pro registration both still work exactly as before (no regression). Then, using a one-off Prisma script or the admin UI, create a second test site left at `publiclyLive: false`, and confirm — either by resolving its domain in a request, or by directly calling the route logic — that attempting to create a listing or a pro profile under that site returns `403` with the French message. Clean up any test site/data created for this check the same way as prior tasks (zero referencing rows before deleting the site).

- [ ] **Step 5: Commit**

```bash
git add app/api/listings/route.ts app/api/pro/profile/route.ts
git commit -m "feat: block public listing/pro creation on non-live sites"
```

---
