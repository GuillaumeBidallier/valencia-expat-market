'use client'
import { useEffect, useState } from 'react'
import type { Category } from '@/types'

const FALLBACK: Category[] = [
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

let cache: Category[] | null = null
let inflight: Promise<Category[]> | null = null

function fetchCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch('/api/categories')
      .then(res => res.json())
      .then((rows: { slug: string; label: string; icon: string }[]) => {
        cache = rows.map(r => ({ slug: r.slug, label: r.label, icon: r.icon }))
        return cache
      })
      .catch(() => FALLBACK)
  }
  return inflight
}

/** Client-side categories, DB-backed and admin-editable. Returns the static fallback until loaded. */
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>(cache ?? FALLBACK)

  useEffect(() => {
    let active = true
    fetchCategories().then(cats => { if (active) setCategories(cats) })
    return () => { active = false }
  }, [])

  return categories
}
