import { unstable_cache } from 'next/cache'
import { Category } from '@/types'
import { prisma } from '@/lib/prisma'

/** Used only if the DB is unreachable — keeps the site usable. */
const FALLBACK_CATEGORIES: Category[] = [
  { label: 'Maison & Mobilier', slug: 'meubles', icon: '🛋️' },
  { label: 'Électroménager', slug: 'electromenager', icon: '🏠' },
  { label: 'Enfants & Famille', slug: 'enfants', icon: '👶' },
  { label: 'Véhicules', slug: 'vehicules', icon: '🚗' },
  { label: 'Mode & Vêtements', slug: 'mode', icon: '👗' },
  { label: 'Services', slug: 'services', icon: '🔧' },
  { label: 'Dons', slug: 'dons', icon: '🎁' },
  { label: 'Livres & Loisirs', slug: 'livres', icon: '📚' },
  { label: 'Déco & Jardin', slug: 'deco', icon: '🌿' },
  { label: 'Autres', slug: 'autres', icon: '📦' },
]

const fetchCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    return rows.map(r => ({ label: r.label, slug: r.slug, icon: r.icon }))
  },
  ['categories'],
  { revalidate: 60, tags: ['categories'] }
)

/** Server components / route handlers — DB-backed, admin-editable. */
export async function getCategoriesServer(): Promise<Category[]> {
  return fetchCategories().catch(() => FALLBACK_CATEGORIES)
}

export const neighborhoods = [
  'Valencia', 'Ruzafa', 'Benimaclet', 'Campanar',
  'Paterna', 'Alboraya', 'El Carmen', 'Eixample', 'La Malva-rosa',
]
