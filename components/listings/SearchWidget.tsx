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
        <div className="bg-white rounded-2xl shadow-2xl p-3">

          {/* Mobile layout : stacked 3 rows */}
          <div className="flex flex-col gap-2 sm:hidden">
            {/* Input */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
            {/* Geo + categories */}
            <div className="flex gap-2">
              <button
                onClick={() => setGeoModalOpen(true)}
                className="flex-1 flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-primary transition-colors text-sm text-gray-600"
              >
                <MapPin size={14} className="text-orange-primary shrink-0" />
                <span className="font-medium truncate flex-1 text-left text-xs">{locationLabel}</span>
                <ChevronDown size={13} className="text-gray-400 shrink-0" />
              </button>
              <select className="flex-1 px-3 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer">
                <option value="">Toutes les catégories</option>
                {categoryItems.map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            {/* Rechercher full-width */}
            <Link
              href="/annonces"
              className="flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
            >
              <Search size={16} />
              Rechercher
            </Link>
          </div>

          {/* Desktop layout : single row */}
          <div className="hidden sm:flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
              />
            </div>
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:border-orange-primary hover:bg-orange-soft transition-colors text-sm text-gray-600 whitespace-nowrap shrink-0"
            >
              <MapPin size={15} className="text-orange-primary shrink-0" />
              <span className="font-medium max-w-[150px] truncate">{locationLabel}</span>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </button>
            <select className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer hover:border-indigo-primary transition-colors min-w-[170px]">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={16} />
              Rechercher
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
