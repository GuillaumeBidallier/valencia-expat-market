'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCategories } from '@/hooks/useCategories'
import GeoModal, { GeoState } from './GeoModal'

interface Suggestion { id: string; title: string }

interface Props {
  defaultQuery?: string
  defaultCategory?: string
  defaultGeo?: GeoState | null
}

export default function SearchBar({ defaultQuery = '', defaultCategory = '', defaultGeo = null }: Props) {
  const t = useTranslations('Search')
  const router = useRouter()
  const categories = useCategories()
  const [query, setQuery] = useState(defaultQuery)
  const [category, setCategory] = useState(defaultCategory)
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geo, setGeo] = useState<GeoState | null>(defaultGeo)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const locationLabel = geo ? `${geo.city}, ${geo.radius} km` : t('all_spain')

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

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const doSearch = (q: string) => {
    setShowSuggestions(false)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category) params.set('cat', category)
    if (geo) {
      params.set('lat', geo.lat.toFixed(5))
      params.set('lng', geo.lng.toFixed(5))
      params.set('radius', String(geo.radius))
      params.set('geoLabel', geo.city)
    }
    router.push(`/annonces?${params.toString()}`)
  }

  const handleSearch = () => doSearch(query)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch()
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
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const SuggestionsDropdown = ({ id }: { id: string }) =>
    showSuggestions && suggestions.length > 0 ? (
      <ul
        id={id}
        ref={listRef}
        role="listbox"
        aria-label="Suggestions de recherche"
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
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
    ) : null

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-2.5">
        {/* Mobile : 3 lignes empilées */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="relative flex items-center gap-2 bg-gray-50 rounded-xl px-4">
            <Search size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
            <label htmlFor="search-query-mobile" className="sr-only">{t('placeholder')}</label>
            <input
              id="search-query-mobile"
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t('placeholder')}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="suggestions-mobile"
              aria-expanded={showSuggestions && suggestions.length > 0}
              className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <SuggestionsDropdown id="suggestions-mobile" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGeoModalOpen(true)}
              aria-label={`Localisation : ${locationLabel}`}
              aria-haspopup="dialog"
              className="flex-1 flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-primary transition-colors min-w-0"
            >
              <MapPin size={14} aria-hidden="true" className={`shrink-0 ${geo ? 'text-orange-primary' : 'text-gray-400'}`} />
              <span className="font-medium truncate flex-1 text-left text-xs text-gray-600" aria-hidden="true">{locationLabel}</span>
              <ChevronDown size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
            </button>
            <label htmlFor="search-category-mobile" className="sr-only">{t('all_categories')}</label>
            <select
              id="search-category-mobile"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 px-3 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer min-w-0"
            >
              <option value="">{t('all_categories')}</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
          >
            <Search size={16} /> {t('search_btn')}
          </button>
        </div>

        {/* Desktop : ligne unique */}
        <div role="search" aria-label="Rechercher des annonces" className="hidden sm:flex gap-2">
          <div className="relative flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
            <Search size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
            <label htmlFor="search-query" className="sr-only">{t('placeholder')}</label>
            <input
              id="search-query"
              type="search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t('placeholder')}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="suggestions-desktop"
              aria-expanded={showSuggestions && suggestions.length > 0}
              className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
            />
            <SuggestionsDropdown id="suggestions-desktop" />
          </div>
          <button
            onClick={() => setGeoModalOpen(true)}
            aria-label={`Localisation : ${locationLabel}`}
            aria-haspopup="dialog"
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors text-sm whitespace-nowrap shrink-0 ${
              geo
                ? 'border-orange-primary bg-orange-soft text-orange-primary'
                : 'border-gray-200 bg-white hover:border-orange-primary hover:bg-orange-soft text-gray-600'
            }`}
          >
            <MapPin size={15} aria-hidden="true" className={`shrink-0 ${geo ? 'text-orange-primary' : 'text-gray-400'}`} />
            <span className="font-medium max-w-[150px] truncate" aria-hidden="true">{locationLabel}</span>
            <ChevronDown size={14} className="shrink-0 opacity-60" aria-hidden="true" />
          </button>
          <label htmlFor="search-category" className="sr-only">{t('all_categories')}</label>
          <select
            id="search-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer hover:border-indigo-primary transition-colors min-w-[170px]"
          >
            <option value="">{t('all_categories')}</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
          >
            <Search size={16} /> {t('search_btn')}
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
