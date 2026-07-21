# Multi-pays — Plan 2 : Panel admin "Sites & Pays" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin-facing "Sites & Pays" panel and country selector on top of Plan 1's foundations, so an admin can create/manage countries and switch which country's data they're viewing/editing across every existing admin screen — the first user-visible result of the whole multi-pays effort.

**Architecture:** A new shared `app/admin/layout.tsx` renders a header with a site selector on every `/admin/*` page. The selector writes a `vem_admin_site` cookie (mirroring the existing `vem_lang` cookie pattern in `LocaleProvider`) via a small API route, then triggers `router.refresh()` so every Server Component re-reads the cookie on next render. A new `getAdminSiteId()` helper in `lib/site.ts` reads that cookie, falling back to the domain-resolved site (`getCurrentSiteId()`) if the admin hasn't picked one yet. Every admin page/API route that reads or mutates `Category`/`Listing`/`Professional`/`User` switches from domain-based scoping to admin-selected scoping — the public-facing `GET /api/categories` (consumed by the public `useCategories` hook) is the only category endpoint that stays domain-scoped, since it serves real site visitors, not the admin UI.

**Tech Stack:** Same as Plan 1 — Next.js 16, Prisma 6, MySQL 8 (OVH), no automated test framework — verification is `npx tsc --noEmit` + manual checks.

## Global Constraints

- Every step must leave the default (Spain) site's admin panel working identically to before — no step is "done" until verified.
- **Work happens against `vendo_dev`, never production.** This worktree's `.env.local` already points `DATABASE_URL` at `vendo_dev` (set up for Plan 1) — verify with `npx prisma migrate status` before any DB command, exactly as in every Plan 1 task. Never reference `PRODUCTION_DATABASE_URL_DO_NOT_USE`.
- The site selector is **always visible**, even with only one site (confirmed decision — not hidden until a 2nd site exists).
- `app/admin/signalements` and `app/admin/parefeu` **are** scoped by the selected site in this plan (confirmed decision — not left global, unlike Blog which stays global per Plan 1's decisions).
- `SiteSettings` stays global (unchanged from Plan 1's decision) — not touched by this plan.
- Marketing/legal pages, public-facing read-path scoping (the ~40-file `app/annonces`/`app/professionnels`/sitemap/exports scope), theming applied to the public site, and Stripe metadata per site are **out of scope** — deferred to a future "Plan 3". **Sequencing constraint (from Plan 1's final review):** this plan's `/admin/sites` panel lets an admin create and activate a second site — once that site has any public `Listing`/`Professional` data, the unscoped public pages will start mixing both sites' content on every domain. Do not create/activate a real second production site with public data until Plan 3's public read-scoping exists. Task 10's isolation test uses a throwaway demo site cleaned up immediately, not a real launch.
- `GET /api/categories` (bare, no admin auth) stays scoped by `getCurrentSiteId()` (domain-resolved) — it is consumed by the public `useCategories` hook (`hooks/useCategories.ts`), not by the admin UI. Do not change this endpoint's site-resolution in this plan.
- Reference spec: `docs/superpowers/specs/2026-07-20-multi-pays-mysql-design.md`.
- Reference prior plan (Plan 1, same session, same codebase, already merged): `docs/superpowers/plans/2026-07-20-multi-pays-mysql-plan1-fondations.md` — the ownership-check idiom (`if (!row || row.siteId !== siteId) return 404`) established there is reused verbatim throughout this plan.

---

### Task 1: `lib/site.ts` — admin site resolution + site listing

**Files:**
- Modify: `lib/site.ts`

**Interfaces:**
- Consumes: `Site` model, `getCurrentSiteId` (both from Plan 1).
- Produces: `getAdminSiteId(): Promise<string>` (cookie-based, falls back to domain resolution), `listActiveSites(): Promise<{ id: string; domain: string; name: string; country: string }[]>` — used by the site selector and every admin page's site-scoping.

- [ ] **Step 1: Add `getAdminSiteId` and `listActiveSites` to `lib/site.ts`**

Read the current file first (`lib/site.ts`, from Plan 1) to confirm the exact existing content before editing — it currently exports `CurrentSite`, `getCurrentSiteId`, `getCurrentSite`.

Add this import at the top, alongside the existing `headers` import:
```ts
import { cookies } from 'next/headers'
```

Add this constant and these two functions at the end of the file:
```ts
const ADMIN_SITE_COOKIE = 'vem_admin_site'

/**
 * Admin-only site resolution: reads the admin's selected site from a cookie
 * (set via the site selector in the admin header), falling back to the
 * domain-resolved site if the admin hasn't picked one yet (e.g. first visit).
 * Server components / route handlers only — never import from a client component.
 */
export async function getAdminSiteId(): Promise<string> {
  const cookieStore = await cookies()
  const selected = cookieStore.get(ADMIN_SITE_COOKIE)?.value
  if (selected) return selected
  return getCurrentSiteId()
}

/** Server components / route handlers only — never import from a client component. */
export async function listActiveSites(): Promise<{ id: string; domain: string; name: string; country: string }[]> {
  return prisma.site.findMany({
    where: { active: true },
    select: { id: true, domain: true, name: true, country: true },
    orderBy: { name: 'asc' },
  })
}
```

- [ ] **Step 2: Verify**

```bash
set -a && source .env.local && set +a
npx tsc --noEmit
```
Expected: zero errors (nothing else consumes these new exports yet).

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "feat: add getAdminSiteId and listActiveSites to lib/site.ts"
```

---

### Task 2: Admin layout + site selector UI + cookie-set route

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `components/admin/AdminSiteSelector.tsx`
- Create: `app/api/admin/site-selection/route.ts`

**Interfaces:**
- Consumes: `listActiveSites`, `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: every `/admin/*` page now renders inside a shared layout with a header containing the site selector. Selecting a site sets the `vem_admin_site` cookie and refreshes the page.

- [ ] **Step 1: Create `app/api/admin/site-selection/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ siteId: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const site = await prisma.site.findUnique({ where: { id: parsed.data.siteId } })
  if (!site) return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('vem_admin_site', site.id, {
    path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax',
  })
  return response
}
```

- [ ] **Step 2: Create `components/admin/AdminSiteSelector.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

type SiteOption = { id: string; domain: string; name: string; country: string }

export default function AdminSiteSelector({ sites, currentSiteId }: { sites: SiteOption[]; currentSiteId: string }) {
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  async function handleChange(siteId: string) {
    if (siteId === currentSiteId) return
    setSwitching(true)
    await fetch('/api/admin/site-selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    })
    router.refresh()
    setSwitching(false)
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
      <Globe size={16} className="text-white/60" />
      <select
        value={currentSiteId}
        onChange={e => handleChange(e.target.value)}
        disabled={switching}
        className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer disabled:opacity-50"
      >
        {sites.map(site => (
          <option key={site.id} value={site.id} className="text-navy">
            {site.name} ({site.country})
          </option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/layout.tsx`**

```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAdminSiteId, listActiveSites } from '@/lib/site'
import AdminSiteSelector from '@/components/admin/AdminSiteSelector'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [sites, currentSiteId] = await Promise.all([listActiveSites(), getAdminSiteId()])

  return (
    <div>
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/admin" className="font-black text-sm tracking-tight hover:text-white/80 transition-colors">
            1000Click Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin/sites" className="text-xs font-semibold text-white/60 hover:text-white transition-colors">
              Sites &amp; Pays
            </Link>
            <AdminSiteSelector sites={sites} currentSiteId={currentSiteId} />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
```
Note: each existing admin page (`app/admin/page.tsx`, `app/admin/annonces/page.tsx`, etc.) already renders its own full-width `bg-navy` header section internally (visible in the files read during planning). This new layout header sits ABOVE those — it is intentionally a second, slim bar, not a replacement. Do not remove or modify the per-page headers in this task; that's a cosmetic follow-up, not required for the selector to function.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run dev
```
Log in as admin, visit `/admin` — confirm the new slim header bar appears above the existing dashboard header, showing "1000Click Admin", a "Sites & Pays" link (will 404 until Task 3), and a dropdown with the one existing site. Selecting the same site (only option) should be a no-op; no errors in console.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx components/admin/AdminSiteSelector.tsx app/api/admin/site-selection/route.ts
git commit -m "feat: add admin layout with site selector"
```

---

### Task 3: `/admin/sites` page — site CRUD

**Files:**
- Create: `app/admin/sites/page.tsx`
- Create: `app/admin/sites/AdminSitesClient.tsx`
- Create: `app/api/admin/sites/route.ts`
- Create: `app/api/admin/sites/[id]/route.ts`

**Interfaces:**
- Consumes: `Site` model.
- Produces: full CRUD for sites from the admin UI — this is what makes "Sites & Pays" a real feature, not just a link.

- [ ] **Step 1: Create `app/api/admin/sites/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(sites)
}

const createSchema = z.object({
  domain:         z.string().min(3).max(120).regex(/^[a-z0-9.-]+$/, 'Domaine invalide (minuscules, chiffres, points, tirets)'),
  name:           z.string().min(1).max(80),
  country:        z.string().min(1).max(80),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#F97316'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#12122A'),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.site.findUnique({ where: { domain: parsed.data.domain } })
  if (existing) return NextResponse.json({ error: 'Ce domaine existe déjà' }, { status: 409 })

  const site = await prisma.site.create({ data: parsed.data })
  return NextResponse.json(site, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/admin/sites/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

const updateSchema = z.object({
  name:           z.string().min(1).max(80).optional(),
  country:        z.string().min(1).max(80).optional(),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  active:         z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const existing = await prisma.site.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const site = await prisma.site.update({ where: { id }, data: parsed.data })
  return NextResponse.json(site)
}
```
Note: no `DELETE` route — deleting a site with `Category`/`Listing`/`Professional`/`User` rows attached would violate the `RESTRICT` foreign keys from Plan 1's contract migration (by design — prevents accidental data-orphaning). Deactivating (`active: false`) is the supported way to retire a site; hard deletion is intentionally not exposed in this plan.

- [ ] **Step 3: Create `app/admin/sites/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminSitesClient from './AdminSitesClient'

export default async function AdminSitesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } })

  return (
    <AdminSitesClient
      initialSites={sites.map(s => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() }))}
    />
  )
}
```

- [ ] **Step 4: Create `app/admin/sites/AdminSitesClient.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Globe2, X } from 'lucide-react'

type Site = {
  id: string; domain: string; name: string; country: string
  primaryColor: string; secondaryColor: string; active: boolean
  createdAt: string; updatedAt: string
}

type FormState = { domain: string; name: string; country: string; primaryColor: string; secondaryColor: string }
const EMPTY: FormState = { domain: '', name: '', country: '', primaryColor: '#F97316', secondaryColor: '#12122A' }

export default function AdminSitesClient({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  function openEdit(site: Site) {
    setEditingId(site.id)
    setForm({ domain: site.domain, name: site.name, country: site.country, primaryColor: site.primaryColor, secondaryColor: site.secondaryColor })
    setError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/sites/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, country: form.country, primaryColor: form.primaryColor, secondaryColor: form.secondaryColor }),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return }
        const updated = await res.json()
        setSites(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s))
      } else {
        const res = await fetch('/api/admin/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return }
        const created = await res.json()
        setSites(prev => [...prev, created])
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(site: Site) {
    const res = await fetch(`/api/admin/sites/${site.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !site.active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, ...updated } : s))
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3">
            <ArrowLeft size={14} /> Retour
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Sites &amp; Pays</h1>
          <p className="text-sm text-white/40 mt-0.5">{sites.length} site{sites.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={openCreate}
          className="mb-6 inline-flex items-center gap-2 bg-orange-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un pays
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {sites.map(site => (
            <div key={site.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: site.primaryColor + '20' }}>
                  <Globe2 size={18} style={{ color: site.primaryColor }} />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{site.name}</p>
                  <p className="text-xs text-gray-400">{site.domain} · {site.country}</p>
                </div>
              </div>
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
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-navy">{editingId ? 'Modifier le site' : 'Nouveau site'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Domaine</label>
                  <input
                    value={form.domain}
                    onChange={e => setForm(f => ({ ...f, domain: e.target.value.toLowerCase() }))}
                    placeholder="1000clic.be"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nom</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="1000Click Belgique"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pays</label>
                <input
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="Belgique"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Couleur primaire</label>
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} className="w-full h-9 rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Couleur secondaire</label>
                  <input type="color" value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} className="w-full h-9 rounded-lg border border-gray-200" />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-orange-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer le site'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run dev
```
Visit `/admin/sites` — confirm the existing default site shows in the list. Create a test site (`domain: test-plan2.localhost`, name/country of your choice), confirm it appears, toggle it inactive and back active, edit its name, confirm changes persist. Delete the test site directly via Prisma afterward (no DELETE route exists by design — see Step 2's note): `npx tsx --env-file=.env.local -e "..."` or leave it for Task 10's cleanup if you'd rather reuse it there.

- [ ] **Step 6: Commit**

```bash
git add app/admin/sites app/api/admin/sites
git commit -m "feat: add admin Sites & Pays CRUD panel"
```

---

### Task 4: Scope categories admin views by selected site

**Files:**
- Modify: `app/admin/categories/page.tsx`
- Modify: `app/api/categories/route.ts`
- Modify: `app/api/categories/[id]/route.ts`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: the admin categories page and its mutation endpoints operate on the admin-selected site, not the domain-resolved one. `GET /api/categories` (public, unauthenticated) is explicitly left untouched — see Global Constraints.

- [ ] **Step 1: Scope `app/admin/categories/page.tsx`**

This page currently queries `prisma.category.findMany({ where: { parentId: null }, ... })` with **no site filter at all** (a real gap left over from Plan 1, which didn't touch this file — it shows every site's root categories mixed together; invisible today since only one site exists). Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminCategoriesClient from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminCategoriesClient from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const siteId = await getAdminSiteId()
  const categories = await prisma.category.findMany({
    where: { parentId: null, siteId },
    orderBy: { order: 'asc' },
```
Leave the rest of the file (the `counts`/`toInitialTree` logic and the closing `include`/return) untouched — only the two lines above change. Note: the `prisma.listing.groupBy` call for `counts` further down in this file counts ALL listings by `categorySlug` regardless of site — since `categorySlug` strings could theoretically collide across sites (two sites both having a category slugged `meubles`), this could over-count. Leave this as-is for this task (it's a display-only count, not a security/data-isolation issue, and fixing it requires joining through `Listing.siteId` which is a bigger change) — note it as a known minor limitation in your task report, don't fix it here.

- [ ] **Step 2: Scope mutations in `app/api/categories/route.ts`**

The `GET` handler stays exactly as-is (domain-resolved, public-facing — do not touch). Replace only the three `getCurrentSiteId` calls inside `POST`, `PUT`, `DELETE` with `getAdminSiteId`. First, update the import:
```ts
import { getCurrentSiteId } from '@/lib/site'
```
becomes:
```ts
import { getAdminSiteId, getCurrentSiteId } from '@/lib/site'
```
(both are still needed — `getCurrentSiteId` for `GET`, `getAdminSiteId` for the mutations.)

In `POST`, replace:
```ts
  const siteId = await getCurrentSiteId()

  const existing = await prisma.category.findUnique({
    where: { siteId_slug: { siteId, slug: parsed.data.slug } },
  })
```
with:
```ts
  const siteId = await getAdminSiteId()

  const existing = await prisma.category.findUnique({
    where: { siteId_slug: { siteId, slug: parsed.data.slug } },
  })
```

In `PUT`, replace:
```ts
  const siteId = await getCurrentSiteId()
  const target = await prisma.category.findUnique({ where: { id } })
```
with:
```ts
  const siteId = await getAdminSiteId()
  const target = await prisma.category.findUnique({ where: { id } })
```

In `DELETE`, replace:
```ts
  const siteId = await getCurrentSiteId()
  const category = await prisma.category.findUnique({
```
with:
```ts
  const siteId = await getAdminSiteId()
  const category = await prisma.category.findUnique({
```

- [ ] **Step 3: Scope `app/api/categories/[id]/route.ts`**

This whole file is admin-only (`requireAdmin()` gated) — switch its one `getCurrentSiteId` call. Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentSiteId } from '@/lib/site'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
```
Replace:
```ts
  const { id } = await params
  const siteId = await getCurrentSiteId()
```
with:
```ts
  const { id } = await params
  const siteId = await getAdminSiteId()
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
Visit `/admin/categories` — confirm existing categories still show, create/edit/delete a test category, confirm it works exactly as before (single-site behavior unchanged). Separately confirm the public homepage's category menu (which uses `GET /api/categories` via `useCategories`) still renders correctly — this endpoint's behavior must be completely unaffected by this task.

- [ ] **Step 6: Commit**

```bash
git add app/admin/categories/page.tsx app/api/categories/route.ts app/api/categories/\[id\]/route.ts
git commit -m "feat: scope admin categories views by selected site"
```

---

### Task 5: Scope annonces admin views by selected site

**Files:**
- Modify: `app/admin/annonces/page.tsx`
- Modify: `app/api/admin/annonces/route.ts`
- Modify: `app/api/admin/annonces/[id]/route.ts`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: the admin annonces page and its API (list by status, update status, soft-delete) all scoped to the admin-selected site, with ownership checks on mutations.

- [ ] **Step 1: Scope `app/admin/annonces/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminAnnoncesClient from './AdminAnnoncesClient'

export default async function AdminAnnoncesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [pendingListings, settings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING' },
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminAnnoncesClient from './AdminAnnoncesClient'

export default async function AdminAnnoncesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const siteId = await getAdminSiteId()
  const [pendingListings, settings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING', siteId },
```
Leave the rest of the file (the `prisma.siteSettings.upsert` call and everything after) untouched — `SiteSettings` stays global per Plan 1's decision, not part of this task.

- [ ] **Step 2: Scope `app/api/admin/annonces/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'PENDING'

  const listings = await prisma.listing.findMany({
    where: { status: status as 'PENDING' | 'ACTIVE' | 'REJECTED' },
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'PENDING'
  const siteId = await getAdminSiteId()

  const listings = await prisma.listing.findMany({
    where: { status: status as 'PENDING' | 'ACTIVE' | 'REJECTED', siteId },
```

- [ ] **Step 3: Add ownership checks to `app/api/admin/annonces/[id]/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendListingApprovedEmail, sendListingRejectedEmail } from '@/lib/email'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://1000clic.fr').replace(/\/$/, '')

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!['ACTIVE', 'REJECTED', 'PENDING', 'SOLD', 'DELETED'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: { status, ...(status === 'ACTIVE' ? { publishedAt: new Date() } : {}) },
    include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
  })
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendListingApprovedEmail, sendListingRejectedEmail } from '@/lib/email'
import { getAdminSiteId } from '@/lib/site'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://1000clic.fr').replace(/\/$/, '')

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!['ACTIVE', 'REJECTED', 'PENDING', 'SOLD', 'DELETED'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const listing = await prisma.listing.update({
    where: { id },
    data: { status, ...(status === 'ACTIVE' ? { publishedAt: new Date() } : {}) },
    include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
  })
```

Then replace the `DELETE` handler:
```ts
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.listing.update({ where: { id }, data: { status: 'DELETED' } })
  return NextResponse.json({ ok: true })
}
```
with:
```ts
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.listing.update({ where: { id }, data: { status: 'DELETED' } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Manual verification**

`npm run dev`, visit `/admin/annonces`, confirm the "En attente"/"Publiées"/etc. tabs still show the correct existing listings, approve/reject a test listing, confirm it works exactly as before.

- [ ] **Step 6: Commit**

```bash
git add app/admin/annonces/page.tsx app/api/admin/annonces
git commit -m "feat: scope admin annonces views by selected site"
```

---

### Task 6: Scope professionnels admin views by selected site

**Files:**
- Modify: `app/admin/professionnels/page.tsx`
- Modify: `app/api/admin/professionnels/route.ts`
- Modify: `app/api/admin/professionnels/[id]/route.ts`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: admin professionnels list, create (already had `getCurrentSiteId` from Plan 1 — switches to admin-selected), update/delete (adds ownership checks).

- [ ] **Step 1: Scope `app/admin/professionnels/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminProsClient from './AdminProsClient'

export default async function AdminProsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const proRows = await prisma.professional.findMany({
    orderBy: [{ tier: 'desc' }, { name: 'asc' }],
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminProsClient from './AdminProsClient'

export default async function AdminProsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const siteId = await getAdminSiteId()
  const proRows = await prisma.professional.findMany({
    where: { siteId },
    orderBy: [{ tier: 'desc' }, { name: 'asc' }],
```

- [ ] **Step 2: Switch `app/api/admin/professionnels/route.ts`'s create to admin-selected site**

This route's `POST` handler already calls `getCurrentSiteId()` (added in Plan 1 Task 8, before the admin/domain distinction existed). Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { getCurrentSiteId } from '@/lib/site'
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { getAdminSiteId } from '@/lib/site'
```
Replace:
```ts
  const { photos, ...rest } = parsed.data
  const siteId = await getCurrentSiteId()
  const pro = await prisma.professional.create({
```
with:
```ts
  const { photos, ...rest } = parsed.data
  const siteId = await getAdminSiteId()
  const pro = await prisma.professional.create({
```

- [ ] **Step 3: Add ownership checks to `app/api/admin/professionnels/[id]/route.ts`**

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
import { getAdminSiteId } from '@/lib/site'
```
Replace the `PUT` handler's body:
```ts
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { photos, ...rest } = parsed.data
```
with:
```ts
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const siteId = await getAdminSiteId()
  const target = await prisma.professional.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const { photos, ...rest } = parsed.data
```
Replace the `DELETE` handler:
```ts
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.professional.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```
with:
```ts
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.professional.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.professional.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Manual verification**

`npm run dev`, visit `/admin/professionnels`, confirm existing pros still show, create/edit/delete a test professional via the admin UI, confirm it works exactly as before.

- [ ] **Step 6: Commit**

```bash
git add app/admin/professionnels/page.tsx app/api/admin/professionnels
git commit -m "feat: scope admin professionnels views by selected site"
```

---

### Task 7: Scope utilisateurs admin views by selected site

**Files:**
- Modify: `app/admin/utilisateurs/page.tsx`
- Modify: `app/api/admin/utilisateurs/route.ts`
- Modify: `app/api/admin/utilisateurs/[id]/route.ts`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: admin user list and role/block mutation scoped to the admin-selected site.

- [ ] **Step 1: Scope `app/admin/utilisateurs/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const users = await prisma.user.findMany({
    select: {
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const siteId = await getAdminSiteId()
  const users = await prisma.user.findMany({
    where: { siteId },
    select: {
```

- [ ] **Step 2: Scope `app/api/admin/utilisateurs/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name:  { contains: q } },
        { email: { contains: q } },
      ],
    } : undefined,
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const siteId = await getAdminSiteId()

  const users = await prisma.user.findMany({
    where: {
      siteId,
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
    },
```

- [ ] **Step 3: Add ownership check to `app/api/admin/utilisateurs/[id]/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const adminId = (session?.user as { id?: string; role?: string })
  if (adminId?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  // Prevent admin from demoting or blocking themselves
  if (id === adminId.id && (body.role === 'USER' || body.blocked === true)) {
    return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre accès admin.' }, { status: 400 })
  }

  const data: { blocked?: boolean; role?: Role } = {}
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { getAdminSiteId } from '@/lib/site'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const adminId = (session?.user as { id?: string; role?: string })
  if (adminId?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  // Prevent admin from demoting or blocking themselves
  if (id === adminId.id && (body.role === 'USER' || body.blocked === true)) {
    return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre accès admin.' }, { status: 400 })
  }

  const siteId = await getAdminSiteId()
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const data: { blocked?: boolean; role?: Role } = {}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Manual verification**

`npm run dev`, visit `/admin/utilisateurs`, confirm existing users still show, toggle a test user's blocked status, confirm it works exactly as before.

- [ ] **Step 6: Commit**

```bash
git add app/admin/utilisateurs/page.tsx app/api/admin/utilisateurs
git commit -m "feat: scope admin utilisateurs views by selected site"
```

---

### Task 8: Scope signalements and parefeu admin views by selected site

**Files:**
- Modify: `app/admin/signalements/page.tsx`
- Modify: `app/api/admin/signalements/route.ts`
- Modify: `app/api/admin/signalements/[listingId]/route.ts`
- Modify: `app/admin/parefeu/page.tsx`
- Modify: `app/api/admin/parefeu/[id]/route.ts`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: both pages (which only ever read/mutate `Listing`, already `siteId`-scoped since Plan 1 — no separate table to scope) filtered to the admin-selected site.

- [ ] **Step 1: Scope `app/admin/signalements/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminSignalementsClient from './AdminSignalementsClient'

export default async function AdminSignalementsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const reported = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' } },
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminSignalementsClient from './AdminSignalementsClient'

export default async function AdminSignalementsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const siteId = await getAdminSiteId()
  const reported = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId },
```

- [ ] **Step 2: Scope `app/api/admin/signalements/route.ts`**

Replace:
```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const listings = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' } },
```
with:
```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = await getAdminSiteId()
  const listings = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId },
```

- [ ] **Step 3: Add ownership check to `app/api/admin/signalements/[listingId]/route.ts`**

Replace the whole file:
```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// DELETE /api/admin/signalements/[listingId] — dismiss all reports for a listing
export async function DELETE(_req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { listingId } = await params
  await prisma.report.deleteMany({ where: { listingId } })
  return NextResponse.json({ ok: true })
}
```
with:
```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

// DELETE /api/admin/signalements/[listingId] — dismiss all reports for a listing
export async function DELETE(_req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { listingId } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.report.deleteMany({ where: { listingId } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Scope `app/admin/parefeu/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminParefeuClient from './AdminParefeuClient'

export default async function AdminParefeuPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [blocked, blockedThisMonth, byCategory] = await Promise.all([
    prisma.listing.findMany({
      where: { blockedReason: { not: null } },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.listing.count({
      where: { blockedReason: { not: null }, publishedAt: { gte: monthStart } },
    }),
    prisma.listing.groupBy({
      by: ['blockedReason'],
      where: { blockedReason: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminParefeuClient from './AdminParefeuClient'

export default async function AdminParefeuPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const siteId     = await getAdminSiteId()

  const [blocked, blockedThisMonth, byCategory] = await Promise.all([
    prisma.listing.findMany({
      where: { blockedReason: { not: null }, siteId },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.listing.count({
      where: { blockedReason: { not: null }, publishedAt: { gte: monthStart }, siteId },
    }),
    prisma.listing.groupBy({
      by: ['blockedReason'],
      where: { blockedReason: { not: null }, siteId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])
```

- [ ] **Step 5: Add ownership check to `app/api/admin/parefeu/[id]/route.ts`**

Replace:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// POST /api/admin/parefeu/[id] — approve (false positive) or delete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json() as { action: 'approve' | 'delete' }
```
with:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

// POST /api/admin/parefeu/[id] — approve (false positive) or delete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const { action } = await req.json() as { action: 'approve' | 'delete' }
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 7: Manual verification**

`npm run dev`, visit `/admin/signalements` and `/admin/parefeu`, confirm both still show the correct existing data (may be empty lists if no test data has reports/blocks — that's fine, just confirm no errors and the pages render).

- [ ] **Step 8: Commit**

```bash
git add app/admin/signalements app/api/admin/signalements app/admin/parefeu app/api/admin/parefeu
git commit -m "feat: scope admin signalements and parefeu views by selected site"
```

---

### Task 9: Scope admin dashboard and statistiques counts by selected site

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/statistiques/page.tsx`

**Interfaces:**
- Consumes: `getAdminSiteId` from `@/lib/site` (Task 1).
- Produces: every count that has a direct `siteId` field (`User`, `Listing`, `Professional`) or a simple one-hop relation to a `siteId`-scoped model (`Report` via `Listing`) is scoped to the admin-selected site. `BlogPost` counts stay global (Blog is explicitly out of scope per Plan 1's decisions). `Message` and `PhotoUpgrade` counts on the statistiques page stay global too — scoping them requires a nested relation filter through `Listing`/`User` for comparatively low value on a stats page; explicitly deferred, not silently forgotten.

- [ ] **Step 1: Scope `app/admin/page.tsx`**

Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  ClipboardList, Users, Star, BarChart3, Flag, Shield,
  AlertTriangle, Clock, CheckCircle, TrendingUp, ChevronRight, BookOpen, Tags, Settings2,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const [
    pendingCount, activeCount, soldCount,
    usersCount, newUsersMonth, premiumUsers, blockedUsers,
    prosCount, premiumPros, plusPros,
    reportsCount, reportedListingsCount, firewallBlockedCount,
    blogTotal, blogPublished, categoriesCount,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'SOLD' } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.user.count({ where: { blocked: true } }),
    prisma.professional.count(),
    prisma.professional.count({ where: { tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { tier: 'PREMIUM_PLUS' } }),
    prisma.report.count(),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' } } }),
    prisma.listing.count({ where: { blockedReason: { not: null } } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.category.count(),
  ])
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getAdminSiteId } from '@/lib/site'
import {
  ClipboardList, Users, Star, BarChart3, Flag, Shield,
  AlertTriangle, Clock, CheckCircle, TrendingUp, ChevronRight, BookOpen, Tags, Settings2,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const siteId     = await getAdminSiteId()

  const [
    pendingCount, activeCount, soldCount,
    usersCount, newUsersMonth, premiumUsers, blockedUsers,
    prosCount, premiumPros, plusPros,
    reportsCount, reportedListingsCount, firewallBlockedCount,
    blogTotal, blogPublished, categoriesCount,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { status: 'ACTIVE', siteId } }),
    prisma.listing.count({ where: { status: 'SOLD', siteId } }),
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { siteId, role: 'PREMIUM' } }),
    prisma.user.count({ where: { siteId, blocked: true } }),
    prisma.professional.count({ where: { siteId } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM_PLUS' } }),
    prisma.report.count({ where: { listing: { siteId } } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.category.count({ where: { siteId } }),
  ])
```
Note: `blogTotal`/`blogPublished` are deliberately left unscoped (`prisma.blogPost.count()` unchanged) — Blog stays global, matching Plan 1's explicit decision. Do not add `where: { siteId }` to these two calls.

- [ ] **Step 2: Scope `app/admin/statistiques/page.tsx`**

Replace:
```tsx
export default async function AdminStatsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now          = new Date()
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const weekStart    = new Date(now); weekStart.setDate(now.getDate() - 7)

  const [
    totalUsers,
    newUsersMonth,
    premiumUsers,
    blockedUsers,
    newUsersLastMonth,
    newUsersWeek,
    totalListings,
    activeListings,
    pendingListings,
    soldListings,
    rejectedListings,
    newListingsMonth,
    totalPros,
    premiumPros,
    plusPros,
    totalReports,
    photoUpgradesPaid,
    listingsByCategory,
    messagesCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.user.count({ where: { blocked: true } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.listing.count({ where: { status: { not: 'DELETED' } } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'SOLD' } }),
    prisma.listing.count({ where: { status: 'REJECTED' } }),
    prisma.listing.count({ where: { publishedAt: { gte: monthStart }, status: { not: 'DELETED' } } }),
    prisma.professional.count(),
    prisma.professional.count({ where: { tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { tier: 'PREMIUM_PLUS' } }),
    prisma.report.count(),
    prisma.photoUpgrade.count({ where: { paid: true } }),
    prisma.listing.groupBy({
      by: ['categorySlug'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
    prisma.message.count(),
  ])
```
with:
```tsx
export default async function AdminStatsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now          = new Date()
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const weekStart    = new Date(now); weekStart.setDate(now.getDate() - 7)
  const siteId       = await getAdminSiteId()

  const [
    totalUsers,
    newUsersMonth,
    premiumUsers,
    blockedUsers,
    newUsersLastMonth,
    newUsersWeek,
    totalListings,
    activeListings,
    pendingListings,
    soldListings,
    rejectedListings,
    newListingsMonth,
    totalPros,
    premiumPros,
    plusPros,
    totalReports,
    photoUpgradesPaid,
    listingsByCategory,
    messagesCount,
  ] = await Promise.all([
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { siteId, role: 'PREMIUM' } }),
    prisma.user.count({ where: { siteId, blocked: true } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: weekStart } } }),
    prisma.listing.count({ where: { siteId, status: { not: 'DELETED' } } }),
    prisma.listing.count({ where: { siteId, status: 'ACTIVE' } }),
    prisma.listing.count({ where: { siteId, status: 'PENDING' } }),
    prisma.listing.count({ where: { siteId, status: 'SOLD' } }),
    prisma.listing.count({ where: { siteId, status: 'REJECTED' } }),
    prisma.listing.count({ where: { siteId, publishedAt: { gte: monthStart }, status: { not: 'DELETED' } } }),
    prisma.professional.count({ where: { siteId } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM_PLUS' } }),
    prisma.report.count({ where: { listing: { siteId } } }),
    prisma.photoUpgrade.count({ where: { paid: true } }),
    prisma.listing.groupBy({
      by: ['categorySlug'],
      where: { status: 'ACTIVE', siteId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
    prisma.message.count(),
  ])
```
`prisma.photoUpgrade.count({ where: { paid: true } })` and `prisma.message.count()` are deliberately left exactly as they were (no `siteId` added) — both require a nested relation filter through `User`/`Listing` respectively for comparatively low value on a stats page (documented deferral, not an oversight). This page does not query `BlogPost` at all, so there is nothing to exclude on that front.

Add the import. Replace:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
```
with:
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getAdminSiteId } from '@/lib/site'
```
(Keep whatever other imports already follow `Link from 'next/link'` in the file — e.g. the `lucide-react` icon import — untouched; only insert the new `getAdminSiteId` import line after `Link`.)

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Manual verification**

`npm run dev`, visit `/admin` and `/admin/statistiques`, confirm every KPI number matches what you'd expect from the single existing site's real data (compare against Task 10 of Plan 1's report, which recorded exact counts: 146 categories, 27 listings, 9 professionals, 7 users, etc. — should still match, since only one site's data exists).

- [ ] **Step 5: Commit**

```bash
git add app/admin/page.tsx app/admin/statistiques/page.tsx
git commit -m "feat: scope admin dashboard and statistiques counts by selected site"
```

---

### Task 10: End-to-end verification with the admin UI

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full regression pass on the default site's admin panel**

```bash
npm run build && npm run start
```
Log in as admin. Confirm every admin page (`/admin`, `/admin/annonces`, `/admin/professionnels`, `/admin/categories`, `/admin/utilisateurs`, `/admin/signalements`, `/admin/parefeu`, `/admin/statistiques`, `/admin/sites`) loads correctly and shows the existing Spain site's real data, with the new slim header bar and site selector visible on every page.

- [ ] **Step 2: Create a real second site via the admin UI and prove full isolation**

Via `/admin/sites`, create a test site (e.g. `domain: demo-plan2.localhost`, `name: Demo Plan 2`, `country: Belgique`). Using the site selector in the header, switch to it. Confirm:
- `/admin/categories` now shows an empty list (no categories exist for this new site yet).
- `/admin/annonces`, `/admin/professionnels`, `/admin/utilisateurs` all show empty lists.
- `/admin` dashboard's KPI numbers all show 0 (or near-0) for this site, not the default site's real counts.
- Create one test category while the demo site is selected (via `/admin/categories`'s existing create form) — confirm it appears under the demo site.
- Switch the selector back to the default site — confirm that test category does NOT appear in the default site's category list, and the default site's KPI numbers are back to their real values (matching Plan 1 Task 10's recorded baseline).

This proves the selector genuinely isolates data, not just filters a shared unfiltered view.

- [ ] **Step 3: Clean up the demo site**

Delete the test category created in Step 2 (via the admin categories UI, while the demo site is selected), then deactivate the demo site (`/admin/sites`, toggle inactive) — recall there's no hard-delete route by design (Task 3's note on `RESTRICT` foreign keys); deactivating is sufficient cleanup. If you want it fully removed from the database, do so directly via Prisma (`npx tsx --env-file=.env.local -e "..."`, confirming `vendo_dev` datasource first) since the demo site should have zero remaining rows referencing it after the category is deleted.

- [ ] **Step 4: Reset the admin site selector to the default site**

Confirm `vem_admin_site` cookie / the selector shows the default (Spain) site before finishing, so the admin panel is left in its normal state.

- [ ] **Step 5: Final commit**

No code changes expected. If Steps 1–2 revealed no issues, this plan is complete — the multi-pays effort now has a real, working, verified admin UI for managing multiple countries, built entirely against `vendo_dev`. Deploying this (and Plan 1) to production remains a separate, explicit, human-supervised step — not part of this plan.
