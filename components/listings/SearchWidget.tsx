'use client'
import { useState } from 'react'
import { MapPin, Search, Tag, ChevronDown } from 'lucide-react'
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
      <div className="-mt-14 relative z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
          {/* Single search row */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">

            {/* Search input */}
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
              />
            </div>

            {/* Geo selector — looks like a clickable input */}
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl bg-white hover:border-indigo-primary hover:bg-indigo-soft transition-colors text-sm text-gray-600 whitespace-nowrap shrink-0"
            >
              <MapPin size={15} className="text-orange-primary shrink-0" />
              <span className="hidden sm:inline font-medium max-w-[140px] truncate">{locationLabel}</span>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </button>

            {/* Category selector */}
            <select className="px-3 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white hidden lg:block min-w-[160px] cursor-pointer hover:border-indigo-primary transition-colors">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>

            {/* Rechercher */}
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={16} />
              <span>Rechercher</span>
            </Link>

            {/* Déposer une annonce */}
            <Link
              href="/deposer-annonce"
              className="flex items-center gap-2 bg-indigo-primary text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-indigo-dark transition-colors whitespace-nowrap shrink-0"
            >
              <Tag size={15} />
              <span className="hidden sm:inline">Déposer une annonce</span>
              <span className="sm:hidden">Déposer</span>
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
