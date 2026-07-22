'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  transparent: boolean
}

// Categories that live elsewhere in the tree (e.g. under Loisirs & Sports or Services)
// but are shown as shortcuts in the Véhicules mega-menu, matching leboncoin's own
// "mirror" behaviour for Vélos / Équipements vélos / Services de réparations mécaniques.
const VEHICULES_MIRRORS: { slug: string; label: string; children: never[] }[] = [
  { slug: 'velos-trottinettes', label: 'Vélos & Trottinettes', children: [] },
  { slug: 'equipements-velos', label: 'Équipements vélos', children: [] },
  { slug: 'reparation-mecanique', label: 'Services de réparations mécaniques', children: [] },
]

// Exact 3-column grouping used by leboncoin's own Véhicules mega-menu: Voitures/Motos
// (with brand shortcuts) on their own, then the vehicle-type categories, then all
// the "Équipement *" + mirrored services categories.
const VEHICULES_COLUMNS: string[][] = [
  ['voitures', 'motos'],
  ['caravaning', 'utilitaires', 'camions', 'nautisme', 'velos-trottinettes'],
  ['equipement_auto', 'equipement_moto', 'equipement_caravaning', 'equipement_nautisme', 'equipements-velos', 'reparation-mecanique'],
]

// Brand shortcuts shown under "Voitures" / "Motos" in the mega-menu, matching
// leboncoin's own nav (their top marques + "Voir toutes les marques"). These
// are search shortcuts (?attr_brand=), not real categories.
const BRAND_SHORTCUTS: Record<string, { value: string; label: string }[]> = {
  voitures: [
    { value: 'AUDI', label: 'Audi' },
    { value: 'BMW', label: 'BMW' },
    { value: 'MERCEDES-BENZ', label: 'Mercedes' },
    { value: 'PEUGEOT', label: 'Peugeot' },
    { value: 'RENAULT', label: 'Renault' },
    { value: 'VOLKSWAGEN', label: 'Volkswagen' },
  ],
  motos: [
    { value: 'BMW', label: 'BMW' },
    { value: 'HONDA', label: 'Honda' },
    { value: 'KAWASAKI', label: 'Kawasaki' },
    { value: 'SUZUKI', label: 'Suzuki' },
    { value: 'YAMAHA', label: 'Yamaha' },
  ],
}

type NavChild = { slug: string; label: string; children: readonly { slug: string; label: string }[] }

function renderChildCard(child: NavChild, setActiveSlug: (slug: string | null) => void) {
  const brandShortcuts = BRAND_SHORTCUTS[child.slug]
  return (
    <div key={child.slug} className="break-inside-avoid mb-4">
      {/* Subcategory as bold header */}
      <Link
        href={`/annonces?cat=${child.slug}`}
        className="block text-sm text-gray-900 font-semibold mb-1.5 hover:text-orange-primary transition-colors"
        onClick={() => setActiveSlug(null)}
      >
        {child.label}
      </Link>
      {/* Sub-subcategories listed below */}
      {child.children.map(sub => (
        <Link
          key={sub.slug}
          href={`/annonces?cat=${sub.slug}`}
          className="block text-xs text-gray-500 mb-1 hover:text-orange-primary transition-colors pl-1"
          onClick={() => setActiveSlug(null)}
        >
          {sub.label}
        </Link>
      ))}
      {/* Brand shortcuts (Voitures/Motos) — search shortcuts, not real categories */}
      {brandShortcuts && brandShortcuts.map(b => (
        <Link
          key={b.value}
          href={`/annonces?cat=${child.slug}&attr_brand=${encodeURIComponent(b.value)}`}
          className="block text-xs text-gray-500 mb-1 hover:text-orange-primary transition-colors pl-1"
          onClick={() => setActiveSlug(null)}
        >
          {b.label}
        </Link>
      ))}
      {brandShortcuts && (
        <Link
          href={`/annonces?cat=${child.slug}`}
          className="block text-xs text-orange-primary font-semibold mb-1 hover:underline pl-1"
          onClick={() => setActiveSlug(null)}
        >
          Voir toutes les marques
        </Link>
      )}
    </div>
  )
}

export default function CategoryNavBar({ transparent }: Props) {
  const categories = useCategories()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveSlug(slug)
  }

  const close = () => {
    timeoutRef.current = setTimeout(() => setActiveSlug(null), 120)
  }

  const stay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const activeCategory = categories.find(c => c.slug === activeSlug)
  const isVehicules = activeCategory?.slug === 'vehicules'
  const combinedItems = activeCategory
    ? isVehicules
      ? [...activeCategory.children, ...VEHICULES_MIRRORS]
      : activeCategory.children
    : []
  const vehiculesColumns = isVehicules
    ? VEHICULES_COLUMNS.map(slugs => slugs.map(slug => combinedItems.find(c => c.slug === slug)).filter((c): c is typeof combinedItems[number] => Boolean(c)))
    : null

  return (
    <div
      className={`hidden md:block border-b transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-white/10'
          : 'bg-white border-gray-100'
      }`}
      onMouseLeave={close}
    >
      {/* Category bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-10 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat, i) => (
            <span key={cat.slug} className="flex items-center shrink-0">
              {i > 0 && (
                <span
                  className={`mx-4 text-xs select-none ${transparent ? 'text-white/30' : 'text-gray-300'}`}
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
              <Link
                href={`/annonces?cat=${cat.slug}`}
                className={`text-xs whitespace-nowrap py-2 border-b-2 transition-colors font-normal ${
                  activeSlug === cat.slug
                    ? 'text-orange-primary border-orange-primary'
                    : transparent
                    ? 'text-white/80 border-transparent hover:text-white hover:border-white/50'
                    : 'text-gray-700 border-transparent hover:text-orange-primary hover:border-orange-primary'
                }`}
                onMouseEnter={() => open(cat.slug)}
                onClick={() => setActiveSlug(null)}
              >
                {cat.label}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* Mega dropdown */}
      {activeCategory && (
        <div
          className="absolute left-0 right-0 bg-gray-50 border-b border-gray-200 shadow-xl z-40"
          onMouseEnter={stay}
          onMouseLeave={close}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-10">
              {/* Left: icon + name + "tout voir" */}
              <div className="shrink-0 w-44">
                <div className="flex items-center gap-2.5 border-l-4 border-orange-primary pl-3 mb-3">
                  <span className="text-2xl leading-none">{activeCategory.icon}</span>
                  <span className="font-black text-navy text-sm leading-tight">{activeCategory.label}</span>
                </div>
                <Link
                  href={`/annonces?cat=${activeCategory.slug}`}
                  className="text-xs text-orange-primary font-semibold hover:underline"
                  onClick={() => setActiveSlug(null)}
                >
                  Tout {activeCategory.label}
                </Link>
              </div>

              {/* Right: subcategories + their children */}
              {vehiculesColumns ? (
                <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-1">
                  {vehiculesColumns.map((column, i) => (
                    <div key={i}>
                      {column.map(child => renderChildCard(child, setActiveSlug))}
                    </div>
                  ))}
                </div>
              ) : combinedItems.length > 0 ? (
                <div className="flex-1 grid gap-x-8 gap-y-1"
                  style={{ gridTemplateColumns: `repeat(${Math.min(4, combinedItems.length)}, minmax(0, 1fr))` }}
                >
                  {combinedItems.map(child => renderChildCard(child, setActiveSlug))}
                </div>
              ) : (
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-gray-400 italic">
                    Parcourir toutes les annonces · {activeCategory.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
