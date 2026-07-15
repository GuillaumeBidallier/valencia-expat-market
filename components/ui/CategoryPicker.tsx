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

  // Silence unused variable warning — selectedSub is used for derivation only
  void selectedSub

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
