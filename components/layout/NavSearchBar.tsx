'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCategories } from '@/hooks/useCategories'
import GeoModal, { GeoState } from '@/components/listings/GeoModal'

interface Suggestion { id: string; title: string }

export default function NavSearchBar() {
  const t = useTranslations('Search')
  const router = useRouter()
  const searchParams = useSearchParams()
  const categories = useCategories()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [geo, setGeo] = useState<GeoState | null>(null)
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [catOpen, setCatOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setCategory(searchParams.get('cat') ?? '')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    const geoLabel = searchParams.get('geoLabel')
    if (lat && lng && geoLabel) {
      setGeo({ city: geoLabel, lat: Number(lat), lng: Number(lng), radius: Number(radius ?? '50') })
    } else {
      setGeo(null)
    }
  }, [searchParams])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.trim().length < 2) { setSuggestions([]); return }
    try {
      const res = await fetch(`/api/listings/suggest?q=${encodeURIComponent(value.trim())}`)
      if (res.ok) setSuggestions(await res.json())
    } catch { /* ignore */ }
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActiveSuggestion(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280)
    setShowSuggestions(true)
  }

  const doSearch = useCallback((q: string, overrideCat?: string, overrideGeo?: GeoState | null) => {
    setShowSuggestions(false)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    const activeCat = overrideCat !== undefined ? overrideCat : category
    if (activeCat) params.set('cat', activeCat)
    const activeGeo = overrideGeo !== undefined ? overrideGeo : geo
    if (activeGeo) {
      params.set('lat', activeGeo.lat.toFixed(5))
      params.set('lng', activeGeo.lng.toFixed(5))
      params.set('radius', String(activeGeo.radius))
      params.set('geoLabel', activeGeo.city)
    }
    router.push(`/annonces?${params.toString()}`)
  }, [category, geo, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') doSearch(query)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0) {
        const s = suggestions[activeSuggestion]
        setQuery(s.title)
        doSearch(s.title)
      } else {
        doSearch(query)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const activeCategory = categories.find(c => c.slug === category)
  const locationLabel = geo ? geo.city : t('all_spain')

  return (
    <>
      <div ref={containerRef} className="relative flex items-stretch w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-visible focus-within:border-orange-primary transition-colors">

        {/* Category dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setCatOpen(o => !o)}
            className="h-full flex items-center gap-1 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors border-r border-gray-200 whitespace-nowrap"
          >
            <span className="hidden xl:block max-w-[130px] truncate">
              {activeCategory ? `${activeCategory.icon} ${activeCategory.label}` : t('all_categories')}
            </span>
            <span className="xl:hidden text-base" aria-hidden="true">
              {activeCategory ? activeCategory.icon : '📦'}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform text-gray-400 shrink-0 ${catOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {catOpen && (
            <ul
              role="listbox"
              aria-label="Catégories"
              className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[210px] max-h-[320px] overflow-y-auto"
            >
              <li role="option" aria-selected={!category}>
                <button
                  type="button"
                  onClick={() => { setCategory(''); setCatOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!category ? 'font-semibold text-orange-primary' : 'text-navy'}`}
                >
                  {t('all_categories')}
                </button>
              </li>
              {categories.map(c => (
                <li key={c.slug} role="option" aria-selected={category === c.slug}>
                  <button
                    type="button"
                    onClick={() => { setCategory(c.slug); setCatOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${category === c.slug ? 'font-semibold text-orange-primary' : 'text-navy'}`}
                  >
                    <span aria-hidden="true">{c.icon}</span>
                    <span className="flex-1">{c.label}</span>
                    {category === c.slug && <span className="text-orange-primary text-xs" aria-hidden="true">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Text input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <label htmlFor="nav-search-input" className="sr-only">{t('placeholder')}</label>
          <input
            id="nav-search-input"
            type="search"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={t('placeholder')}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            className="w-full py-2.5 px-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Suggestions de recherche"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={i === activeSuggestion}
                  onMouseDown={() => { setQuery(s.title); doSearch(s.title) }}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm text-navy transition-colors ${
                    i === activeSuggestion ? 'bg-orange-soft text-orange-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <Search size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                  {s.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location */}
        <button
          type="button"
          onClick={() => setGeoModalOpen(true)}
          aria-label={`Localisation : ${locationLabel}`}
          className={`hidden lg:flex items-center gap-1.5 px-3 text-sm border-l border-gray-200 transition-colors whitespace-nowrap shrink-0 hover:bg-gray-50 ${
            geo ? 'text-orange-primary font-semibold' : 'text-gray-500 hover:text-navy'
          }`}
        >
          <MapPin size={14} className="shrink-0" aria-hidden="true" />
          <span className="max-w-[110px] truncate">{locationLabel}</span>
        </button>

        {/* Search button */}
        <button
          type="button"
          onClick={() => doSearch(query)}
          aria-label={t('search_btn')}
          className="flex items-center gap-1.5 bg-orange-primary text-white px-4 m-1 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors shrink-0 whitespace-nowrap"
        >
          <Search size={15} aria-hidden="true" />
          <span className="hidden xl:inline">{t('search_btn')}</span>
        </button>
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
