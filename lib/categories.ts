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
