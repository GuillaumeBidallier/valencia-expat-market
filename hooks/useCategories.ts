'use client'
import { useEffect, useState } from 'react'
import type { Category, CategoryTree } from '@/types'
import { useLocale } from '@/components/providers/LocaleProvider'

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
  const byId = new Map<string, CategoryTree>()

  for (const cat of flat) {
    byId.set(cat.id, {
      label: cat.label, slug: cat.slug, icon: cat.icon,
      parentId: cat.parentId, parentSlug: cat.parentSlug, children: [],
    })
  }

  const roots: CategoryTree[] = []
  for (const cat of flat) {
    const node = byId.get(cat.id)!
    if (cat.parentId) {
      byId.get(cat.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

const treeCache = new Map<string, CategoryTree[]>()
const inflightMap = new Map<string, Promise<CategoryTree[]>>()

function fetchCategoryTree(locale: string): Promise<CategoryTree[]> {
  if (treeCache.has(locale)) return Promise.resolve(treeCache.get(locale)!)
  if (!inflightMap.has(locale)) {
    inflightMap.set(locale,
      fetch(`/api/categories?locale=${locale}`)
        .then(res => res.json())
        .then((rows: ApiCategory[]) => {
          const tree = buildTree(rows)
          treeCache.set(locale, tree)
          inflightMap.delete(locale)
          return tree
        })
        .catch(() => FALLBACK_TREE)
    )
  }
  return inflightMap.get(locale)!
}

/** Returns root categories with their subcategories in `.children`, in the current locale. */
export function useCategories(): CategoryTree[] {
  const { locale } = useLocale()
  const [categories, setCategories] = useState<CategoryTree[]>(FALLBACK_TREE)

  useEffect(() => {
    let active = true
    fetchCategoryTree(locale).then(cats => { if (active) setCategories(cats) })
    return () => { active = false }
  }, [locale])

  return categories
}

/** Invalidates the client-side category cache (call after admin mutations). */
export function invalidateCategoryCache() {
  treeCache.clear()
  inflightMap.clear()
}
