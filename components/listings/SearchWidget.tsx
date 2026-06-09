'use client'
import { useState } from 'react'
import { MapPin, Search, ChevronDown } from 'lucide-react'
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
        <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3 flex flex-col gap-2">

          {/* Row 1 : search + button */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
              />
            </div>
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={16} />
              <span>Rechercher</span>
            </Link>
          </div>

          {/* Row 2 : geo + categories */}
          <div className="flex gap-2">
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-primary hover:bg-orange-soft transition-colors text-sm text-gray-600 whitespace-nowrap flex-1 sm:flex-none"
            >
              <MapPin size={15} className="text-orange-primary shrink-0" />
              <span className="font-medium truncate max-w-[160px]">{locationLabel}</span>
              <ChevronDown size={14} className="text-gray-400 shrink-0 ml-auto sm:ml-0" />
            </button>

            <select className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer hover:border-indigo-primary transition-colors">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
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
