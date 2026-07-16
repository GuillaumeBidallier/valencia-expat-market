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
