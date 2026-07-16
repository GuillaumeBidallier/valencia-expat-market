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
 * Builds an N-level tree from a flat category list (server-side).
 * SERVER-ONLY: this file imports Prisma — never import it from a client component.
 */
export function buildCategoryTree(flat: Category[]): CategoryTree[] {
  const bySlug = new Map<string, CategoryTree>()
  const roots: CategoryTree[] = []

  for (const cat of flat) {
    bySlug.set(cat.slug, { ...cat, children: [] })
  }

  for (const cat of flat) {
    const node = bySlug.get(cat.slug)!
    if (cat.parentSlug) {
      bySlug.get(cat.parentSlug)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
