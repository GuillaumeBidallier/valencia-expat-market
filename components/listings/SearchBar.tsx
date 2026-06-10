'use client'
import { useState } from 'react'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/categories'
import GeoModal, { GeoState } from './GeoModal'

interface Props {
  defaultQuery?: string
  defaultCategory?: string
  defaultGeo?: GeoState | null
}

export default function SearchBar({ defaultQuery = '', defaultCategory = '', defaultGeo = null }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [category, setCategory] = useState(defaultCategory)
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geo, setGeo] = useState<GeoState | null>(defaultGeo)

  const locationLabel = geo ? `${geo.city}, ${geo.radius} km` : "Tout l'Espagne"

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('cat', category)
    if (geo) {
      params.set('lat', geo.lat.toFixed(5))
      params.set('lng', geo.lng.toFixed(5))
      params.set('radius', String(geo.radius))
      params.set('geoLabel', geo.city)
    }
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-2.5">
        {/* Mobile : 3 lignes empilées */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Que recherchez-vous ?"
              className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex-1 flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-primary transition-colors min-w-0"
            >
              <MapPin size={14} className={`shrink-0 ${geo ? 'text-orange-primary' : 'text-gray-400'}`} />
              <span className="font-medium truncate flex-1 text-left text-xs text-gray-600">{locationLabel}</span>
              <ChevronDown size={13} className="text-gray-400 shrink-0" />
            </button>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 px-3 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer min-w-0"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
          >
            <Search size={16} /> Rechercher
          </button>
        </div>

        {/* Desktop : ligne unique */}
        <div className="hidden sm:flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Que recherchez-vous ?"
              className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
            />
          </div>
          <button
            onClick={() => setGeoModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors text-sm whitespace-nowrap shrink-0 ${
              geo
                ? 'border-orange-primary bg-orange-soft text-orange-primary'
                : 'border-gray-200 bg-white hover:border-orange-primary hover:bg-orange-soft text-gray-600'
            }`}
          >
            <MapPin size={15} className={`shrink-0 ${geo ? 'text-orange-primary' : 'text-gray-400'}`} />
            <span className="font-medium max-w-[150px] truncate">{locationLabel}</span>
            <ChevronDown size={14} className="shrink-0 opacity-60" />
          </button>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer hover:border-indigo-primary transition-colors min-w-[170px]"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
          >
            <Search size={16} /> Rechercher
          </button>
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
