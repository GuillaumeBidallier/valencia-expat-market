'use client'
import { useState } from 'react'
import { MapPin, Search, Tag } from 'lucide-react'
import Link from 'next/link'
import GeoModal, { GeoState } from './GeoModal'

interface CategoryItem {
  label: string
  slug: string
}

interface SearchWidgetProps {
  categoryItems: CategoryItem[]
}

export default function SearchWidget({ categoryItems }: SearchWidgetProps) {
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geo, setGeo] = useState<GeoState | null>(null)

  const locationLabel = geo ? `${geo.city}, ${geo.radius} km` : "Tout l'Espagne"

  return (
    <>
      <div className="-mt-16 relative z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl shadow-2xl overflow-hidden">
          {/* Location banner */}
          <div className="bg-hero-dark px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex items-center gap-2 hover:opacity-75 transition-opacity"
            >
              <MapPin size={14} className="text-orange-primary shrink-0" />
              <span className="text-white text-sm font-semibold underline-offset-2 hover:underline">
                {locationLabel}
              </span>
            </button>
            <Link
              href="/deposer-annonce"
              className="flex items-center gap-1.5 bg-orange-primary text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-orange-dark transition-colors whitespace-nowrap"
            >
              <Tag size={13} />
              Déposer une annonce
            </Link>
          </div>
          {/* Search row */}
          <div className="bg-white p-2 sm:p-3 flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
            <select className="px-3 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white hidden sm:block min-w-[160px]">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Rechercher</span>
            </Link>
          </div>
        </div>
      </div>

      <GeoModal
        isOpen={geoModalOpen}
        onClose={() => setGeoModalOpen(false)}
        onValidate={g => setGeo(g)}
        currentGeo={geo}
      />
    </>
  )
}
