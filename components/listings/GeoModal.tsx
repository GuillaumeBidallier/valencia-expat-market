'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface GeoState {
  city: string
  lat: number
  lng: number
  radius: number
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

interface GeoModalProps {
  isOpen: boolean
  onClose: () => void
  onValidate: (geo: GeoState | null) => void
  currentGeo: GeoState | null
}

export default function GeoModal({ isOpen, onClose, onValidate, currentGeo }: GeoModalProps) {
  const t = useTranslations('Search')
  const [cityInput, setCityInput] = useState(currentGeo?.city ?? '')
  const [radius, setRadius] = useState(currentGeo?.radius ?? 50)
  const [coords, setCoords] = useState<{ lat: number; lng: number; name: string } | null>(
    currentGeo ? { lat: currentGeo.lat, lng: currentGeo.lng, name: currentGeo.city } : null
  )
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setCityInput(currentGeo?.city ?? '')
    setRadius(currentGeo?.radius ?? 50)
    setCoords(currentGeo ? { lat: currentGeo.lat, lng: currentGeo.lng, name: currentGeo.city } : null)
    setSuggestions([])
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=es&accept-language=fr`,
        { headers: { 'User-Agent': 'VendoExpat/1.0' } }
      )
      const data: NominatimResult[] = await res.json()
      setSuggestions(data)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const handleCityInput = (val: string) => {
    setCityInput(val)
    setCoords(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  const selectSuggestion = (s: NominatimResult) => {
    const name = s.display_name.split(',')[0]
    setCityInput(name)
    setCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), name })
    setSuggestions([])
  }

  const getMapUrl = () => {
    if (!coords) return null
    const { lat, lng } = coords
    const dlat = radius / 111
    const dlon = radius / (111 * Math.cos((lat * Math.PI) / 180))
    const bbox = `${lng - dlon},${lat - dlat},${lng + dlon},${lat + dlat}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  }

  const handleValidate = () => {
    if (!coords) {
      onValidate(null)
    } else {
      onValidate({ city: coords.name, lat: coords.lat, lng: coords.lng, radius })
    }
    onClose()
  }

  const handleEffacer = () => {
    setCityInput('')
    setCoords(null)
    setSuggestions([])
    setRadius(50)
  }

  if (!isOpen) return null

  const mapUrl = getMapUrl()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy">{t('geo_title')}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* City input */}
          <div className="relative">
            <div className="flex items-center gap-3 border-2 border-navy rounded-xl px-4 py-3">
              <MapPin size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={cityInput}
                onChange={e => handleCityInput(e.target.value)}
                placeholder={t('geo_placeholder')}
                className="flex-1 text-sm text-navy placeholder-gray-400 focus:outline-none bg-transparent"
                autoFocus
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin shrink-0" />
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                  >
                    <MapPin size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{s.display_name.split(',').slice(0, 3).join(', ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Radius slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-navy">{t('radius_label')}</span>
              <span className="text-sm font-bold text-blue-valencia">{radius} km</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              style={{ accentColor: '#1A1F36' }}
              className="w-full h-2 cursor-pointer"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">0 km</span>
              <span className="text-xs text-gray-400">200 km</span>
            </div>
          </div>

          {/* Map */}
          {mapUrl ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                loading="lazy"
                title="Carte de localisation"
                className="border-0"
              />
            </div>
          ) : (
            <div className="rounded-xl bg-gray-100 h-32 flex items-center justify-center">
              <p className="text-sm text-gray-400">{t('map_empty')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleEffacer}
            className="flex-1 py-3 rounded-xl border-2 border-navy text-navy font-bold text-sm hover:bg-navy/5 transition-colors"
          >
            {t('clear')}
          </button>
          <button
            onClick={handleValidate}
            className="flex-[2] py-3 rounded-xl bg-orange-primary text-white font-bold text-sm hover:bg-orange-dark transition-colors truncate px-3"
          >
            {coords ? t('validate_city', { city: coords.name, radius }) : t('all_spain')}
          </button>
        </div>
      </div>
    </div>
  )
}
