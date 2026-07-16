'use client'
import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/useCategories'
import type { CategoryTree } from '@/types'

interface Props {
  value: string
  onChange: (slug: string) => void
  error?: string
}

function findPath(tree: CategoryTree[], slug: string): [CategoryTree | null, CategoryTree | null, CategoryTree | null] {
  for (const root of tree) {
    if (root.slug === slug) return [root, null, null]
    for (const sub of root.children) {
      if (sub.slug === slug) return [root, sub, null]
      for (const subsub of sub.children) {
        if (subsub.slug === slug) return [root, sub, subsub]
      }
    }
  }
  return [null, null, null]
}

export default function CategoryPicker({ value, onChange, error }: Props) {
  const tree = useCategories()

  const [root, sub] = findPath(tree, value)
  const [pendingRoot, setPendingRoot] = useState<CategoryTree | null>(root)
  const [pendingSub,  setPendingSub]  = useState<CategoryTree | null>(sub)

  useEffect(() => {
    const [r, s] = findPath(tree, value)
    setPendingRoot(r)
    setPendingSub(s)
  }, [value, tree])

  const handleRootClick = (r: CategoryTree) => {
    setPendingRoot(r)
    setPendingSub(null)
    if (r.children.length === 0) onChange(r.slug)
  }

  const handleSubClick = (s: CategoryTree) => {
    setPendingSub(s)
    onChange(s.slug)
  }

  const handleSubSubClick = (ss: CategoryTree) => {
    onChange(ss.slug)
  }

  return (
    <div className="space-y-3">
      {/* Level 1 — root categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tree.map(r => {
          const isActive = pendingRoot?.slug === r.slug
          return (
            <button key={r.slug} type="button" onClick={() => handleRootClick(r)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left
                ${isActive
                  ? 'border-orange-primary bg-orange-soft text-orange-primary font-bold'
                  : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40 hover:bg-orange-soft/50'
                }`}
            >
              <span className="text-lg shrink-0">{r.icon}</span>
              <span className="truncate">{r.label}</span>
            </button>
          )
        })}
      </div>

      {/* Level 2 — subcategories */}
      {pendingRoot && pendingRoot.children.length > 0 && (
        <div className="pl-2 border-l-2 border-orange-primary/30 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Sous-catégorie de « {pendingRoot.label} »
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingRoot.children.map(s => {
              const isActive = pendingSub?.slug === s.slug || (value === s.slug && !pendingSub)
              return (
                <button key={s.slug} type="button" onClick={() => handleSubClick(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${isActive
                      ? 'border-orange-primary bg-orange-primary text-white'
                      : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40 hover:bg-orange-soft/50'
                    }`}
                >
                  {s.label}{s.children.length > 0 && ' ›'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Level 3 — sub-subcategories */}
      {pendingSub && pendingSub.children.length > 0 && (
        <div className="pl-4 border-l-2 border-indigo-primary/30 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Sous-catégorie de « {pendingSub.label} »
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingSub.children.map(ss => {
              const isActive = value === ss.slug
              return (
                <button key={ss.slug} type="button" onClick={() => handleSubSubClick(ss)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${isActive
                      ? 'border-indigo-primary bg-indigo-primary text-white'
                      : 'border-gray-200 bg-white text-navy hover:border-indigo-primary/40 hover:bg-indigo-50'
                    }`}
                >
                  {ss.label}
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
