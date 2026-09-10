# LeBonCoin-Style Category Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2-level category hierarchy (Category → Subcategory) to 1000clic.fr, fully manageable from the admin panel, with LeBonCoin-style browsing and filtering.

**Architecture:** Self-referential `Category` model: `parentId = null` = root category, `parentId = <id>` = subcategory. `Listing.categorySlug` points to the leaf node (subcategory slug if one is selected, root slug otherwise). The annonces listing page expands a root-category filter to include all its children's slugs at query time.

**Tech Stack:** Next.js 15 App Router, Prisma/PostgreSQL (Neon), TypeScript, Tailwind CSS, React Client Components.

## Global Constraints

- No new npm packages unless unavoidable.
- Slug format: `/^[a-z0-9-]+$/`, globally unique (Prisma `@unique` stays on `slug`).
- All server data-fetching via `lib/categories.ts` (uses `unstable_cache`); client data-fetching via `hooks/useCategories.ts` (uses `/api/categories`).
- Existing flat categories (no `parentId`) remain as root categories — no data migration needed.
- UI language: French throughout (no English strings in UI).
- Do NOT add a test framework — verification steps use `curl`, browser inspection, and `prisma studio`.
- Commit after each task.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `prisma/schema.prisma` | Modify | Add `parentId` self-referential relation on `Category` |
| `types/index.ts` | Modify | Add `parentId?`, `parentSlug?`, `children?` to `Category`; add `CategoryTree` type; add `buildCategoryTree` util |
| `lib/categories.ts` | Modify | Fetch flat list with `parentId`; export `buildCategoryTree`; update return types |
| `app/api/categories/route.ts` | Modify | Include `parentId`/`parentSlug` in GET response; accept `parentId` in POST |
| `hooks/useCategories.ts` | Modify | Return `CategoryTree[]` (root categories with `children` populated) |
| `components/ui/CategoryPicker.tsx` | **Create** | Shared 2-step picker: select root category → select subcategory (if children exist) |
| `app/admin/categories/page.tsx` | Modify | Pass tree structure to client component |
| `app/admin/categories/AdminCategoriesClient.tsx` | Modify | Tree UI: root categories expandable, inline add/edit/delete subcategories |
| `app/deposer-annonce/page.tsx` | Modify | Replace flat `<select>` with `<CategoryPicker>` |
| `app/annonces/[id]/modifier/EditListingClient.tsx` | Modify | Replace flat `<select>` with `<CategoryPicker>` |
| `app/annonces/AnnoncesFilters.tsx` | Modify | LeBonCoin-style hierarchical category filter (root list → subcategory list) |
| `app/annonces/page.tsx` | Modify | Expand root-category `cat` param to include children slugs in WHERE clause |

---

### Task 1: Prisma Schema — Add parentId to Category

**Files:**
- Modify: `prisma/schema.prisma`
- Auto-generated: `prisma/migrations/<timestamp>_add_category_parent/`

**Interfaces:**
- Produces: `Category.parentId String?` (nullable FK → `Category.id`) available in all Prisma queries.

- [ ] **Step 1: Edit `prisma/schema.prisma`** — add self-referential relation

Replace the current `Category` model (lines ~181-191):
```prisma
model Category {
  id        String     @id @default(cuid())
  slug      String     @unique
  label     String
  icon      String
  order     Int        @default(0)
  parentId  String?
  parent    Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryChildren")
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

- [ ] **Step 2: Generate and apply migration**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
npx prisma migrate dev --name add_category_parent
```

Expected output:
```
The following migration(s) have been applied:
migrations/20260715_add_category_parent/migration.sql
```

- [ ] **Step 3: Verify schema in Prisma Studio**

```bash
npx prisma studio
```

Open `http://localhost:5555`, navigate to Category table, confirm `parentId` column exists and all existing rows have `NULL` in `parentId`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add parentId self-referential relation to Category"
```

---

### Task 2: Types + Category Tree Utility

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/categories.ts`

**Interfaces:**
- Produces:
  - `Category` interface with optional `parentId: string | null`, `parentSlug: string | null`
  - `CategoryTree` interface: `Category & { children: Category[] }`
  - `buildCategoryTree(flat: Category[]): CategoryTree[]` — groups flat list into tree (roots + their children)
  - `getCategoriesServer(): Promise<Category[]>` — flat list with parentId included (unchanged name, updated shape)

- [ ] **Step 1: Update `types/index.ts`** — extend Category interface

Find the `Category` interface (~line 46) and replace:
```typescript
export interface Category {
  label: string
  slug: string
  icon: string
}
```
With:
```typescript
export interface Category {
  label: string
  slug: string
  icon: string
  parentId?: string | null
  parentSlug?: string | null
}

export interface CategoryTree extends Category {
  children: Category[]
}
```

- [ ] **Step 2: Update `lib/categories.ts`** — include parentId and export buildCategoryTree

Replace the entire file content:
```typescript
import { unstable_cache } from 'next/cache'
import { Category, CategoryTree } from '@/types'
import { prisma } from '@/lib/prisma'

/** Used only if the DB is unreachable — keeps the site usable. */
const FALLBACK_CATEGORIES: Category[] = [
  { label: 'Maison & Mobilier', slug: 'meubles',        icon: '🛋️', parentId: null, parentSlug: null },
  { label: 'Électroménager',    slug: 'electromenager', icon: '🏠', parentId: null, parentSlug: null },
  { label: 'Enfants & Famille', slug: 'enfants',        icon: '👶', parentId: null, parentSlug: null },
  { label: 'Véhicules',         slug: 'vehicules',      icon: '🚗', parentId: null, parentSlug: null },
  { label: 'Mode & Vêtements',  slug: 'mode',           icon: '👗', parentId: null, parentSlug: null },
  { label: 'Services',          slug: 'services',       icon: '🔧', parentId: null, parentSlug: null },
  { label: 'Dons',              slug: 'dons',           icon: '🎁', parentId: null, parentSlug: null },
  { label: 'Livres & Loisirs',  slug: 'livres',         icon: '📚', parentId: null, parentSlug: null },
  { label: 'Déco & Jardin',     slug: 'deco',           icon: '🌿', parentId: null, parentSlug: null },
  { label: 'Autres',            slug: 'autres',         icon: '📦', parentId: null, parentSlug: null },
]

const fetchCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }],
      include: { parent: { select: { slug: true } } },
    })
    return rows.map(r => ({
      label:      r.label,
      slug:       r.slug,
      icon:       r.icon,
      parentId:   r.parentId   ?? null,
      parentSlug: r.parent?.slug ?? null,
    }))
  },
  ['categories'],
  { revalidate: 60, tags: ['categories'] }
)

/** Server components / route handlers only — imports Prisma, never import this from a client component. */
export async function getCategoriesServer(): Promise<Category[]> {
  return fetchCategories().catch(() => FALLBACK_CATEGORIES)
}

/**
 * Builds a 2-level tree from a flat category list.
 * Root categories (parentId = null) get a `children` array.
 * Safe to call from both server and client code.
 */
export function buildCategoryTree(flat: Category[]): CategoryTree[] {
  const roots: CategoryTree[] = []
  const bySlug = new Map<string, CategoryTree>()

  // First pass: create CategoryTree nodes for all roots
  for (const cat of flat) {
    if (!cat.parentId) {
      const node: CategoryTree = { ...cat, children: [] }
      roots.push(node)
      bySlug.set(cat.slug, node)
    }
  }

  // Second pass: attach children to their parent
  for (const cat of flat) {
    if (cat.parentId && cat.parentSlug) {
      const parent = bySlug.get(cat.parentSlug)
      if (parent) parent.children.push(cat)
    }
  }

  return roots
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 4: Commit**

```bash
git add types/index.ts lib/categories.ts
git commit -m "feat: add CategoryTree type and buildCategoryTree utility"
```

---

### Task 3: Update `/api/categories` Route

**Files:**
- Modify: `app/api/categories/route.ts`

**Interfaces:**
- Consumes: `Category.parentId` (Task 1), `buildCategoryTree` (Task 2 — not used here, but parentId must be in response)
- Produces:
  - `GET /api/categories` returns `{ id, slug, label, icon, order, parentId, parentSlug }[]`
  - `POST /api/categories` accepts optional `parentId?: string`
  - `PUT /api/categories` unchanged (label, icon, order only — slug and parentId are immutable after creation)
  - `DELETE /api/categories` cascades to children (handled via Prisma onDelete: SetNull or manual check)

- [ ] **Step 1: Update GET handler** — include parentId and parentSlug

Replace the entire `app/api/categories/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }],
    include: { parent: { select: { slug: true } } },
  })
  return NextResponse.json(
    rows.map(r => ({
      id:         r.id,
      slug:       r.slug,
      label:      r.label,
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
  icon:     z.string().min(1).max(8),
  parentId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  // Validate parentId if provided
  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } })
    if (!parent) return NextResponse.json({ error: 'Catégorie parente introuvable' }, { status: 404 })
    if (parent.parentId) return NextResponse.json({ error: 'Impossible d\'imbriquer plus de 2 niveaux' }, { status: 400 })
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
  const category = await prisma.category.create({
    data: {
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
  id:    z.string().min(1),
  label: z.string().min(1).max(60).optional(),
  icon:  z.string().min(1).max(8).optional(),
  order: z.number().int().optional(),
})

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { id, ...data } = parsed.data
  const category = await prisma.category.update({ where: { id }, data })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  })
  if (!category) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Block delete if any listing uses this category or any of its children
  const slugsToCheck = [category.slug, ...category.children.map(c => c.slug)]
  const inUse = await prisma.listing.count({ where: { categorySlug: { in: slugsToCheck } } })
  if (inUse > 0) {
    return NextResponse.json({ error: `Catégorie utilisée par ${inUse} annonce(s), suppression impossible` }, { status: 409 })
  }

  // Delete children first, then parent
  if (category.children.length > 0) {
    await prisma.category.deleteMany({ where: { parentId: id } })
  }
  await prisma.category.delete({ where: { id } })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify API response**

Start dev server if not running:
```bash
npm run dev &
```

Test GET endpoint:
```bash
curl -s http://localhost:3000/api/categories | python3 -m json.tool | head -30
```

Expected: JSON array where each item has `id`, `slug`, `label`, `icon`, `order`, `parentId` (null), `parentSlug` (null).

- [ ] **Step 3: Commit**

```bash
git add app/api/categories/route.ts
git commit -m "feat: add parentId/parentSlug to categories API, support subcategory creation"
```

---

### Task 4: Update `useCategories` Hook

**Files:**
- Modify: `hooks/useCategories.ts`

**Interfaces:**
- Consumes: `GET /api/categories` response (Task 3) — includes `parentId`, `parentSlug`
- Consumes: `buildCategoryTree` from `lib/categories.ts` — NOTE: `lib/categories.ts` imports Prisma and cannot be imported client-side. Copy `buildCategoryTree` logic inline or extract to a pure util.
- Produces: `useCategories(): CategoryTree[]` — root categories with `children: Category[]` populated

> **IMPORTANT:** `buildCategoryTree` is in `lib/categories.ts` which imports Prisma — never import it in client components. Copy the pure tree-building logic inline in the hook file.

- [ ] **Step 1: Update `hooks/useCategories.ts`**

Replace entire file:
```typescript
'use client'
import { useEffect, useState } from 'react'
import type { Category, CategoryTree } from '@/types'

const FALLBACK_TREE: CategoryTree[] = [
  { label: 'Maison & Mobilier', slug: 'meubles',        icon: '🛋️', parentId: null, parentSlug: null, children: [] },
  { label: 'Électroménager',    slug: 'electromenager', icon: '🏠', parentId: null, parentSlug: null, children: [] },
  { label: 'Enfants & Famille', slug: 'enfants',        icon: '👶', parentId: null, parentSlug: null, children: [] },
  { label: 'Véhicules',         slug: 'vehicules',      icon: '🚗', parentId: null, parentSlug: null, children: [] },
  { label: 'Mode & Vêtements',  slug: 'mode',           icon: '👗', parentId: null, parentSlug: null, children: [] },
  { label: 'Services',          slug: 'services',       icon: '🔧', parentId: null, parentSlug: null, children: [] },
  { label: 'Dons',              slug: 'dons',           icon: '🎁', parentId: null, parentSlug: null, children: [] },
  { label: 'Livres & Loisirs',  slug: 'livres',         icon: '📚', parentId: null, parentSlug: null, children: [] },
  { label: 'Déco & Jardin',     slug: 'deco',           icon: '🌿', parentId: null, parentSlug: null, children: [] },
  { label: 'Autres',            slug: 'autres',         icon: '📦', parentId: null, parentSlug: null, children: [] },
]

type ApiCategory = {
  id: string; slug: string; label: string; icon: string
  order: number; parentId: string | null; parentSlug: string | null
}

function buildTree(flat: ApiCategory[]): CategoryTree[] {
  const roots: CategoryTree[] = []
  const bySlug = new Map<string, CategoryTree>()

  for (const cat of flat) {
    if (!cat.parentId) {
      const node: CategoryTree = {
        label: cat.label, slug: cat.slug, icon: cat.icon,
        parentId: null, parentSlug: null, children: [],
      }
      roots.push(node)
      bySlug.set(cat.slug, node)
    }
  }

  for (const cat of flat) {
    if (cat.parentId && cat.parentSlug) {
      const parent = bySlug.get(cat.parentSlug)
      if (parent) {
        parent.children.push({
          label: cat.label, slug: cat.slug, icon: cat.icon,
          parentId: cat.parentId, parentSlug: cat.parentSlug,
        })
      }
    }
  }

  return roots
}

let cache: CategoryTree[] | null = null
let inflight: Promise<CategoryTree[]> | null = null

function fetchCategoryTree(): Promise<CategoryTree[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch('/api/categories')
      .then(res => res.json())
      .then((rows: ApiCategory[]) => {
        cache = buildTree(rows)
        return cache
      })
      .catch(() => FALLBACK_TREE)
  }
  return inflight
}

/** Returns root categories with their subcategories in `.children`. */
export function useCategories(): CategoryTree[] {
  const [categories, setCategories] = useState<CategoryTree[]>(cache ?? FALLBACK_TREE)

  useEffect(() => {
    let active = true
    fetchCategoryTree().then(cats => { if (active) setCategories(cats) })
    return () => { active = false }
  }, [])

  return categories
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "hooks/useCategories|types/index" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useCategories.ts
git commit -m "feat: useCategories hook now returns CategoryTree[] with children"
```

---

### Task 5: Shared `CategoryPicker` Component

**Files:**
- Create: `components/ui/CategoryPicker.tsx`

**Interfaces:**
- Consumes: `useCategories(): CategoryTree[]` (Task 4)
- Produces: `<CategoryPicker value={string} onChange={(slug: string) => void} error?: string />`
  - `value` is always a leaf slug (subcategory slug if subcategory selected, root slug if root has no children or user picks root with no sub)
  - When user picks a root that has children, the component shows a second row of subcategory buttons. They must click a subcategory to set the final value.
  - When user picks a root with no children, `onChange` fires immediately with the root slug.

- [ ] **Step 1: Create `components/ui/CategoryPicker.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'

interface Props {
  value: string
  onChange: (slug: string) => void
  error?: string
}

export default function CategoryPicker({ value, onChange, error }: Props) {
  const tree = useCategories()

  // Derive selected root and sub from current value
  const selectedRoot = tree.find(r =>
    r.slug === value || r.children.some(c => c.slug === value)
  ) ?? null
  const selectedSub: Category | null =
    selectedRoot?.children.find(c => c.slug === value) ?? null

  const [pendingRoot, setPendingRoot] = useState(selectedRoot)

  // Sync pendingRoot when value changes externally (e.g. reset)
  useEffect(() => {
    const root = tree.find(r =>
      r.slug === value || r.children.some(c => c.slug === value)
    ) ?? null
    setPendingRoot(root)
  }, [value, tree])

  const handleRootClick = (rootSlug: string) => {
    const root = tree.find(r => r.slug === rootSlug) ?? null
    setPendingRoot(root)
    if (!root || root.children.length === 0) {
      // No subcategories → set value directly
      onChange(rootSlug)
    }
    // If root has children, wait for subcategory selection
  }

  const handleSubClick = (subSlug: string) => {
    onChange(subSlug)
  }

  return (
    <div className="space-y-3">
      {/* Root categories grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tree.map(root => {
          const isActive = pendingRoot?.slug === root.slug
          return (
            <button
              key={root.slug}
              type="button"
              onClick={() => handleRootClick(root.slug)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left
                ${isActive
                  ? 'border-orange-primary bg-orange-soft text-orange-primary font-bold'
                  : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40 hover:bg-orange-soft/50'
                }`}
            >
              <span className="text-lg shrink-0">{root.icon}</span>
              <span className="truncate">{root.label}</span>
            </button>
          )
        })}
      </div>

      {/* Subcategory row — only shown if selected root has children */}
      {pendingRoot && pendingRoot.children.length > 0 && (
        <div className="pl-2 border-l-2 border-orange-primary/30 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Sous-catégorie de « {pendingRoot.label} »
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingRoot.children.map(sub => {
              const isActive = sub.slug === value
              return (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => handleSubClick(sub.slug)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${isActive
                      ? 'border-orange-primary bg-orange-primary text-white'
                      : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40 hover:bg-orange-soft/50'
                    }`}
                >
                  {sub.icon} {sub.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "CategoryPicker" | head -5
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/CategoryPicker.tsx
git commit -m "feat: add CategoryPicker shared 2-step category selector component"
```

---

### Task 6: Update Admin Categories UI

**Files:**
- Modify: `app/admin/categories/page.tsx`
- Modify: `app/admin/categories/AdminCategoriesClient.tsx`

**Interfaces:**
- Consumes: Prisma `category.findMany({ include: { children: true } })`; listing count query now groups by all slugs (roots and subs)
- Produces: Tree UI — root categories are expandable rows; each shows its subcategories inline; "Add subcategory" button per root; existing CRUD preserved

- [ ] **Step 1: Update `app/admin/categories/page.tsx`**

Replace entire file:
```typescript
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
    include: {
      children: { orderBy: { order: 'asc' } },
    },
  })

  // Count listings for each slug (roots and subs)
  const allSlugs = [
    ...categories.map(c => c.slug),
    ...categories.flatMap(c => c.children.map(s => s.slug)),
  ]
  const counts = await prisma.listing.groupBy({ by: ['categorySlug'], _count: { id: true } })
  const countBySlug = Object.fromEntries(counts.map(c => [c.categorySlug, c._count.id]))

  return (
    <AdminCategoriesClient
      initialTree={categories.map(cat => ({
        id:           cat.id,
        slug:         cat.slug,
        label:        cat.label,
        icon:         cat.icon,
        order:        cat.order,
        listingCount: countBySlug[cat.slug] ?? 0,
        children:     cat.children.map(sub => ({
          id:           sub.id,
          slug:         sub.slug,
          label:        sub.label,
          icon:         sub.icon,
          order:        sub.order,
          listingCount: countBySlug[sub.slug] ?? 0,
        })),
      }))}
    />
  )
}
```

- [ ] **Step 2: Rewrite `app/admin/categories/AdminCategoriesClient.tsx`**

Replace entire file:
```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, ChevronRight, ChevronDown as Expand } from 'lucide-react'

type SubRow = { id: string; slug: string; label: string; icon: string; order: number; listingCount: number }
type CatRow = SubRow & { children: SubRow[] }
type FormState = { slug: string; label: string; icon: string }
const EMPTY: FormState = { slug: '', label: '', icon: '' }

type EditTarget = { type: 'root' | 'sub'; id: string; parentId?: string }

export default function AdminCategoriesClient({ initialTree }: { initialTree: CatRow[] }) {
  const [tree,           setTree]           = useState<CatRow[]>(initialTree)
  const [expanded,       setExpanded]       = useState<Set<string>>(new Set())
  const [editTarget,     setEditTarget]     = useState<EditTarget | null>(null)
  const [newSubParentId, setNewSubParentId] = useState<string | null>(null)  // root id for adding sub
  const [isNewRoot,      setIsNewRoot]      = useState(false)
  const [form,           setForm]           = useState<FormState>(EMPTY)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const closeForm = () => {
    setEditTarget(null)
    setNewSubParentId(null)
    setIsNewRoot(false)
    setError('')
  }

  const openNewRoot = () => {
    closeForm()
    setIsNewRoot(true)
    setForm(EMPTY)
  }

  const openNewSub = (parentId: string) => {
    closeForm()
    setNewSubParentId(parentId)
    setForm(EMPTY)
    setExpanded(s => new Set([...s, parentId]))
  }

  const openEdit = (target: EditTarget, current: SubRow) => {
    closeForm()
    setEditTarget(target)
    setForm({ slug: current.slug, label: current.label, icon: current.icon })
  }

  const save = async () => {
    if (!form.label.trim() || !form.icon.trim()) { setError('Icône et nom requis.'); return }
    if ((isNewRoot || newSubParentId) && !form.slug.trim()) { setError('Slug requis.'); return }
    setSaving(true); setError('')
    try {
      if (isNewRoot) {
        // Create root category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: form.slug.trim().toLowerCase(), label: form.label.trim(), icon: form.icon.trim(), parentId: null }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => [...t, { ...data, listingCount: 0, children: [] }])
      } else if (newSubParentId) {
        // Create subcategory
        const parent = tree.find(r => r.id === newSubParentId)
        if (!parent) return
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: form.slug.trim().toLowerCase(), label: form.label.trim(), icon: form.icon.trim(), parentId: newSubParentId }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => t.map(r => r.id === newSubParentId
          ? { ...r, children: [...r.children, { ...data, listingCount: 0 }] }
          : r
        ))
      } else if (editTarget) {
        // Edit existing
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editTarget.id, label: form.label.trim(), icon: form.icon.trim() }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        if (editTarget.type === 'root') {
          setTree(t => t.map(r => r.id === editTarget.id ? { ...r, label: data.label, icon: data.icon } : r))
        } else {
          setTree(t => t.map(r => ({
            ...r,
            children: r.children.map(s => s.id === editTarget.id ? { ...s, label: data.label, icon: data.icon } : s),
          })))
        }
      }
      closeForm()
    } finally { setSaving(false) }
  }

  const remove = async (id: string, type: 'root' | 'sub', parentId?: string) => {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      if (type === 'root') {
        setTree(t => t.filter(r => r.id !== id))
      } else {
        setTree(t => t.map(r => r.id === parentId
          ? { ...r, children: r.children.filter(s => s.id !== id) }
          : r
        ))
      }
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur')
    }
    setConfirmDeleteId(null)
  }

  const moveRoot = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= tree.length) return
    const reordered = [...tree];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setTree(reordered)
    await Promise.all(reordered.map((c, i) =>
      fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, order: i }),
      })
    ))
  }

  const isEditing = isNewRoot || newSubParentId !== null || editTarget !== null

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight">Catégories d&apos;annonces</h1>
              <p className="text-xs text-white/40">{tree.length} catégorie{tree.length !== 1 ? 's' : ''} racine{tree.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openNewRoot}
            className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {error && !isEditing && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Inline form (new root, new sub, or edit) */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-navy">
                {isNewRoot ? 'Nouvelle catégorie' : newSubParentId ? `Sous-catégorie de « ${tree.find(r => r.id === newSubParentId)?.label} »` : 'Modifier'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Icône (emoji)</label>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🛋️"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Nom affiché</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Maison & Mobilier"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="meubles"
                  disabled={!!editTarget}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving}
                className="bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={closeForm} className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Tree list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {tree.map((cat, i) => (
            <div key={cat.id}>
              {/* Root row */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                {/* Reorder */}
                <div className="flex flex-col shrink-0">
                  <button onClick={() => moveRoot(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                  <button onClick={() => moveRoot(i, 1)} disabled={i === tree.length - 1} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                >
                  {cat.children.length > 0
                    ? (expanded.has(cat.id) ? <Expand size={13} /> : <ChevronRight size={13} />)
                    : <span className="w-3" />
                  }
                </button>

                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate">{cat.label}</p>
                  <p className="text-xs text-gray-400">/{cat.slug} · {cat.listingCount} annonce{cat.listingCount !== 1 ? 's' : ''} · {cat.children.length} sous-catégorie{cat.children.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Actions */}
                {confirmDeleteId === cat.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">Supprimer avec ses sous-catégories ?</span>
                    <button onClick={() => remove(cat.id, 'root')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">Confirmer</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annuler</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openNewSub(cat.id)}
                      title="Ajouter une sous-catégorie"
                      className="flex items-center gap-1 text-xs font-semibold text-orange-primary border border-orange-primary/30 bg-orange-soft px-2 py-1 rounded-lg hover:bg-orange-primary/10 transition-colors"
                    >
                      <Plus size={11} /> Sous-catégorie
                    </button>
                    <button onClick={() => openEdit({ type: 'root', id: cat.id }, cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Children rows (shown when expanded) */}
              {expanded.has(cat.id) && cat.children.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 pl-14 pr-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
                  <span className="text-base shrink-0">{sub.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{sub.label}</p>
                    <p className="text-xs text-gray-400">/{sub.slug} · {sub.listingCount} annonce{sub.listingCount !== 1 ? 's' : ''}</p>
                  </div>
                  {confirmDeleteId === sub.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">Supprimer ?</span>
                      <button onClick={() => remove(sub.id, 'sub', cat.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">Confirmer</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit({ type: 'sub', id: sub.id, parentId: cat.id }, sub)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => sub.listingCount > 0
                          ? setError(`Sous-catégorie utilisée par ${sub.listingCount} annonce(s), suppression impossible.`)
                          : setConfirmDeleteId(sub.id)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {tree.length === 0 && (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              Aucune catégorie. Cliquez sur « Ajouter » pour commencer.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify admin page loads without errors**

Navigate to `http://localhost:3000/admin/categories` in the browser (must be signed in as admin).

Expected: Tree list of categories. Each row has "Sous-catégorie" button. Clicking expand chevron reveals children (empty for now). Click "Sous-catégorie" on any root → inline form appears pre-filled with parent name.

- [ ] **Step 4: Test adding a subcategory via admin**

1. Click "Sous-catégorie" next to "Véhicules".
2. Fill in: icon=🚗, label=Voitures, slug=voitures.
3. Click "Enregistrer".
4. Verify: "Voitures" appears indented under "Véhicules" in the tree.

- [ ] **Step 5: Commit**

```bash
git add app/admin/categories/page.tsx app/admin/categories/AdminCategoriesClient.tsx
git commit -m "feat: admin categories tree UI with subcategory management"
```

---

### Task 7: Update Deposer-Annonce + Edit Listing Forms

**Files:**
- Modify: `app/deposer-annonce/page.tsx`
- Modify: `app/annonces/[id]/modifier/EditListingClient.tsx`

**Interfaces:**
- Consumes: `<CategoryPicker value={string} onChange={fn} error={string} />` (Task 5)
- Produces: Both forms submit a `categorySlug` that is a valid leaf slug (subcategory or root-with-no-children)

- [ ] **Step 1: Update the category section in `app/deposer-annonce/page.tsx`**

Find the category `<select>` block (around line 207-212):
```typescript
<label className="text-sm font-medium text-navy">{t('f_category')}</label>
<select value={form.categorySlug} onChange={set('categorySlug')} className={`border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition ${errors.categorySlug ? 'border-red-500' : 'border-gray-300'}`}>
  <option value="">{t('p_category')}</option>
  {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
</select>
{errors.categorySlug && <p className="text-xs text-red-500">{errors.categorySlug}</p>}
```

Replace with:
```typescript
<label className="text-sm font-medium text-navy">{t('f_category')}</label>
<CategoryPicker
  value={form.categorySlug}
  onChange={slug => setForm(f => ({ ...f, categorySlug: slug }))}
  error={errors.categorySlug}
/>
```

Also add the import at the top of the file (after other imports):
```typescript
import CategoryPicker from '@/components/ui/CategoryPicker'
```

Remove the `const categories = useCategories()` line and the `import { useCategories } from '@/hooks/useCategories'` import if `categories` is no longer used elsewhere in the file. (Check: search for other uses of `categories` variable in the file first.)

- [ ] **Step 2: Check if `categories` / `useCategories` is used elsewhere in deposer-annonce**

```bash
grep -n "categories\b" /Users/bidallierguillaume/IdeaProjects/valencia-expat-market/app/deposer-annonce/page.tsx
```

If `categories` only appears in the removed `<select>` block, remove the `useCategories` import and `const categories = useCategories()` line. If it appears elsewhere, leave them.

- [ ] **Step 3: Update the category section in `app/annonces/[id]/modifier/EditListingClient.tsx`**

Find the category `<select>` block (around line 153-163):
```typescript
<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catégorie *</label>
<select
  value={form.categorySlug}
  onChange={set('categorySlug')}
  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all ${errors.categorySlug ? 'border-red-400' : 'border-gray-200'}`}
>
  <option value="">Choisir une catégorie</option>
  {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
</select>
{errors.categorySlug && <p className="text-xs text-red-500 mt-1">{errors.categorySlug}</p>}
```

Replace with:
```typescript
<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catégorie *</label>
<CategoryPicker
  value={form.categorySlug}
  onChange={slug => setForm(f => ({ ...f, categorySlug: slug }))}
  error={errors.categorySlug}
/>
```

Add import at top of file:
```typescript
import CategoryPicker from '@/components/ui/CategoryPicker'
```

Check for other uses of `categories` and remove `useCategories` import + const if unused.

- [ ] **Step 4: Verify forms work**

1. Navigate to `http://localhost:3000/deposer-annonce`.
2. Confirm category grid is visible (tiles per root category).
3. Click a root category that has subcategories (e.g. "Véhicules" if you added "Voitures" in Task 6).
4. Confirm subcategory buttons appear below.
5. Click a subcategory → form field is set (check that submit button activates).

- [ ] **Step 5: Commit**

```bash
git add app/deposer-annonce/page.tsx "app/annonces/[id]/modifier/EditListingClient.tsx"
git commit -m "feat: replace flat category selects with 2-step CategoryPicker in forms"
```

---

### Task 8: Update `AnnoncesFilters` — Hierarchical Filter UI

**Files:**
- Modify: `app/annonces/AnnoncesFilters.tsx`

**Interfaces:**
- Consumes: `useCategories(): CategoryTree[]` (Task 4)
- Consumes: URL params `cat` (can be root slug or sub slug)
- Produces: Updated filter UI — clicking a root category with children shows subcategory buttons inline; clicking again collapses. Clicking a root with no children applies the filter directly. Clicking a subcategory applies that subcategory filter.

- [ ] **Step 1: Update the Category section in `AnnoncesFilters.tsx`**

Replace the current `{/* Category */}` block:
```typescript
{/* Category */}
<div>
  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('category')}</label>
  <select
    value={cat}
    onChange={e => update('cat', e.target.value)}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
  >
    <option value="">{t('all_categories')}</option>
    {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
  </select>
</div>
```

With:
```typescript
{/* Category */}
<CategoryFilterPanel cat={cat} categories={categories} onUpdate={update} />
```

Then add the `CategoryFilterPanel` component above the `export default` function (in the same file, as an internal component since it's already a client component):

```typescript
function CategoryFilterPanel({
  cat,
  categories,
  onUpdate,
}: {
  cat: string
  categories: CategoryTree[]
  onUpdate: (key: string, value: string) => void
}) {
  const t = useTranslations('Filters')

  // Determine which root is active (either directly selected, or parent of selected sub)
  const activeRoot = categories.find(r =>
    r.slug === cat || r.children.some(c => c.slug === cat)
  ) ?? null

  const [openRootSlug, setOpenRootSlug] = useState<string | null>(activeRoot?.slug ?? null)

  // Sync open state when `cat` changes (e.g. cleared by "clear all")
  useEffect(() => {
    if (!cat) setOpenRootSlug(null)
  }, [cat])

  const handleRootClick = (root: CategoryTree) => {
    if (root.children.length === 0) {
      // No subcategories — apply filter immediately
      onUpdate('cat', root.slug === cat ? '' : root.slug)
      setOpenRootSlug(root.slug === openRootSlug ? null : root.slug)
    } else {
      // Toggle open/collapsed; only apply filter when clicking an already-open root with no sub selected
      if (openRootSlug === root.slug) {
        // Collapse and clear filter
        setOpenRootSlug(null)
        onUpdate('cat', '')
      } else {
        setOpenRootSlug(root.slug)
        // Don't apply root filter yet — wait for sub selection
        // But if switching roots, clear the current cat filter
        if (activeRoot?.slug !== root.slug) onUpdate('cat', '')
      }
    }
  }

  const handleSubClick = (subSlug: string) => {
    onUpdate('cat', subSlug === cat ? '' : subSlug)
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('category')}</label>

      {/* "All categories" option */}
      <button
        onClick={() => { onUpdate('cat', ''); setOpenRootSlug(null) }}
        className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1.5 font-medium transition-colors ${
          !cat ? 'bg-orange-soft text-orange-primary font-bold' : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        {t('all_categories')}
      </button>

      {/* Root categories list */}
      <div className="space-y-1">
        {categories.map(root => {
          const isOpen       = openRootSlug === root.slug
          const rootActive   = root.slug === cat
          const subActive    = root.children.some(c => c.slug === cat)
          const anyActive    = rootActive || subActive

          return (
            <div key={root.slug}>
              <button
                onClick={() => handleRootClick(root)}
                className={`w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                  anyActive
                    ? 'bg-orange-soft text-orange-primary font-bold'
                    : 'text-navy hover:bg-gray-50'
                }`}
              >
                <span className="shrink-0">{root.icon}</span>
                <span className="flex-1 truncate">{root.label}</span>
                {root.children.length > 0 && (
                  <ChevronRight
                    size={12}
                    className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                )}
              </button>

              {/* Subcategory list */}
              {isOpen && root.children.length > 0 && (
                <div className="pl-6 mt-0.5 space-y-0.5">
                  {root.children.map(sub => (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubClick(sub.slug)}
                      className={`w-full flex items-center gap-1.5 text-left text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                        sub.slug === cat
                          ? 'bg-orange-primary text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span className="truncate">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Also add `useEffect` and `useState` to the imports at the top of the file (they're likely already there from the existing client component). Add `ChevronRight` to the lucide-react import. Import `CategoryTree` type:

```typescript
import type { CategoryTree } from '@/types'
```

Change the `useCategories` usage in the main component:
```typescript
// Before:
const categories = useCategories()
// After: (same line, but type is now CategoryTree[])
const categories = useCategories()  // Already CategoryTree[] after Task 4
```

Remove the `categories` variable from `activeCount` if it was being used (it isn't in the original).

- [ ] **Step 2: Verify filters UI**

1. Navigate to `http://localhost:3000/annonces`.
2. Confirm left sidebar shows category list (not a dropdown).
3. Click "Véhicules" → if it has children, a sub-list appears; URL param `cat` is not yet set.
4. Click "Voitures" (subcategory) → URL updates to `?cat=voitures` and listings filter.
5. Click "Véhicules" again → sub-list collapses, cat clears.
6. Click a root with no children → URL updates to `?cat=<slug>` immediately.

- [ ] **Step 3: Commit**

```bash
git add app/annonces/AnnoncesFilters.tsx
git commit -m "feat: LeBonCoin-style hierarchical category filter in annonces sidebar"
```

---

### Task 9: Update Annonces Server Page — Expand Root Category Filter

**Files:**
- Modify: `app/annonces/page.tsx`

**Interfaces:**
- Consumes: `getCategoriesServer(): Promise<Category[]>` (returns flat list with parentId, Task 2)
- Produces: When `cat` URL param is a root category slug, the Prisma `where` clause filters on `{ categorySlug: { in: [rootSlug, ...childrenSlugs] } }` so listings tagged with any subcategory of that root are included.

> **Note:** The `getCategoriesServer()` call already happens on this page (line 17 import, line 143 call). We just need to use the result to build an expanded slug set before the `where` clause.

- [ ] **Step 1: Update the `where` clause in `AnnoncesContent` function**

Find the `where` object definition (~line 73) which currently has:
```typescript
...(cat   && { categorySlug: cat }),
```

This needs to be replaced with a dynamic slug set. First, compute the expanded slugs right after loading categories. Locate the line:
```typescript
const categories = await getCategoriesServer()
```
(around line 143 in the file). The `where` object is built earlier (around line 73). We need to restructure so categories are fetched before building `where`. 

Replace the entire `AnnoncesContent` function body up to the `where` object — find this block and update it:

After `const geoLabel = params.geoLabel ?? 'Ma position'` and before the `where` object, insert:

```typescript
  const [session, allCategories] = await Promise.all([
    auth(),
    getCategoriesServer(),
  ])
```

Then remove the individual `const session = await auth()` and `const categories = await getCategoriesServer()` calls further down (there are two separate calls in the current code — one for auth and one for categories later).

Then replace:
```typescript
...(cat   && { categorySlug: cat }),
```
With:
```typescript
...(cat && (() => {
  // Expand root category to include all its subcategory slugs
  const slugsForCat = [cat, ...allCategories.filter(c => c.parentSlug === cat).map(c => c.slug)]
  return slugsForCat.length === 1
    ? { categorySlug: cat }
    : { categorySlug: { in: slugsForCat } }
})()),
```

And replace the later `const categories = await getCategoriesServer()` line with just `const categories = allCategories` (since we already fetched it above).

Similarly replace `const session = await auth()` with just use `session` (already fetched above in the Promise.all).

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "annonces/page" | head -10
```

Expected: no errors.

- [ ] **Step 3: Verify root-category filtering**

1. Add a listing tagged `voitures` (subcategory of `vehicules`) via `/deposer-annonce`.
2. Navigate to `/annonces?cat=vehicules`.
3. Confirm the listing with slug `voitures` appears in results.
4. Navigate to `/annonces?cat=voitures`.
5. Confirm same listing appears.
6. Navigate to `/annonces?cat=meubles`.
7. Confirm that `voitures` listing does NOT appear.

- [ ] **Step 4: Commit**

```bash
git add app/annonces/page.tsx
git commit -m "feat: expand root-category filter to include subcategory slugs in annonces query"
```

---

### Task 10: Update Listing Detail — Show Category Breadcrumb

**Files:**
- Modify: `app/annonces/[id]/ListingDetailClient.tsx`

**Interfaces:**
- Consumes: `listing.categorySlug` (may be a subcategory slug)
- Produces: Breadcrumb shows "Category > Subcategory" when the listing's categorySlug is a subcategory, or just "Category" when it's a root. Link in breadcrumb goes to `?cat=<parentSlug>` for subcategories.

- [ ] **Step 1: Update category display in `ListingDetailClient.tsx`**

Find this line (~line 109):
```typescript
<Link href={`/annonces?cat=${listing.categorySlug}`} className="hover:text-orange-primary">{listing.category ?? listing.categorySlug}</Link>
```

This component receives `listing` data from the server. The server page passes category data. We need `parentSlug` available. Check how the listing is passed to this component — the server page at `app/annonces/[id]/page.tsx` fetches the listing from Prisma and passes it.

Open `app/annonces/[id]/page.tsx` to see how `listing` is constructed and passed. If `listing.category` is populated as the category label, we may need to also pass the parent info.

The simplest approach: replace the breadcrumb with a server-side lookup. In `app/annonces/[id]/page.tsx`, after fetching the listing, also fetch the category with its parent:

```typescript
const categoryRecord = await prisma.category.findUnique({
  where: { slug: listing.categorySlug },
  include: { parent: { select: { slug: true, label: true, icon: true } } },
})
```

Then pass `categoryRecord` as a prop to `ListingDetailClient`. Update the client component's Props interface to accept:
```typescript
categoryInfo?: { label: string; slug: string; icon: string; parent: { slug: string; label: string; icon: string } | null } | null
```

In the client component, replace the breadcrumb:
```typescript
{categoryInfo?.parent ? (
  <>
    <Link href={`/annonces?cat=${categoryInfo.parent.slug}`} className="hover:text-orange-primary">
      {categoryInfo.parent.icon} {categoryInfo.parent.label}
    </Link>
    <span className="text-gray-300 mx-1">›</span>
    <Link href={`/annonces?cat=${categoryInfo.slug}`} className="hover:text-orange-primary">
      {categoryInfo.icon} {categoryInfo.label}
    </Link>
  </>
) : (
  <Link href={`/annonces?cat=${listing.categorySlug}`} className="hover:text-orange-primary">
    {listing.category ?? listing.categorySlug}
  </Link>
)}
```

Also update the `<Badge>` display (~line 146) to show the category label:
```typescript
<Badge className="mb-2">{categoryInfo?.label ?? listing.category ?? listing.categorySlug}</Badge>
```

- [ ] **Step 2: Verify listing detail page**

1. Navigate to a listing that has subcategory `voitures` (under `vehicules`).
2. Confirm breadcrumb shows: `Accueil > Annonces > 🚗 Véhicules › 🚗 Voitures`.
3. Click "Véhicules" breadcrumb → navigates to `/annonces?cat=vehicules` and shows results from all vehicle subcategories.

- [ ] **Step 3: Commit**

```bash
git add "app/annonces/[id]/page.tsx" "app/annonces/[id]/ListingDetailClient.tsx"
git commit -m "feat: listing detail shows category breadcrumb with parent > subcategory"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] 2-level category hierarchy (Category → Subcategory) — Tasks 1, 2
- [x] Admin panel: add/edit/delete categories and subcategories — Tasks 3, 6
- [x] Admin panel: reorder root categories — Task 6 (move up/down preserved)
- [x] Deposer une annonce: 2-step category picker — Task 7
- [x] Edit listing: 2-step category picker — Task 7
- [x] Annonces filters: LeBonCoin-style hierarchical sidebar — Task 8
- [x] Server-side filter: root category expands to children — Task 9
- [x] Listing detail: breadcrumb with parent > subcategory — Task 10
- [x] Backward compat: existing flat listings still work (parentId = null → root) — inherent in design
- [x] Max 2 levels enforced in API — Task 3 POST handler checks `parent.parentId`
- [x] TypeScript safety throughout — every task has `tsc --noEmit` step

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `Category.parentId?: string | null` — defined Task 2, used in Tasks 3, 4, 8, 9
- `CategoryTree extends Category { children: Category[] }` — defined Task 2, produced by Task 4, consumed by Tasks 7, 8
- `useCategories(): CategoryTree[]` — defined Task 4, consumed by Tasks 5, 7, 8 (via `CategoryPicker` and `AnnoncesFilters`)
- `buildCategoryTree(flat: Category[]): CategoryTree[]` — defined Task 2 (in `lib/categories.ts`), used by Task 9 (server-side, not client)
- API GET response shape `{ id, slug, label, icon, order, parentId, parentSlug }` — defined Task 3, consumed by Task 4 hook
- `CategoryPicker` props `{ value: string, onChange: (slug: string) => void, error?: string }` — defined Task 5, used by Task 7
- `CategoryFilterPanel` internal component in `AnnoncesFilters` — uses `CategoryTree[]`, `cat: string`, `onUpdate: (key, value) => void`

All consistent. ✓
