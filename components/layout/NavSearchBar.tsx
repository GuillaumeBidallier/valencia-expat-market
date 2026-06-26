'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Suggestion { id: string; title: string }

export default function NavSearchBar() {
  const t = useTranslations('Search')
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
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

  const doSearch = useCallback((q: string) => {
    setShowSuggestions(false)
    // Preserve active filters (cat, ville, lat, etc.) when refining from results page
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) { params.set('q', q.trim()) } else { params.delete('q') }
    params.delete('page')
    router.push(`/annonces?${params.toString()}`)
  }, [router, searchParams])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') doSearch(query)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(p => Math.min(p + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(p => Math.max(p - 1, -1))
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

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* Bar — overflow-hidden clips the orange button to rounded corners */}
      <div className="flex items-stretch h-11 rounded-xl border border-gray-300 bg-white focus-within:border-orange-primary focus-within:ring-2 focus-within:ring-orange-primary/20 transition-all overflow-hidden shadow-sm">

        <label htmlFor="nav-search-input" className="sr-only">{t('placeholder')}</label>
        <input
          id="nav-search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={t('placeholder')}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          className="flex-1 min-w-0 px-4 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }}
            className="flex items-center px-2 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Effacer"
          >
            <X size={15} />
          </button>
        )}

        {/* Orange search button — flush right, clipped by overflow-hidden */}
        <button
          type="button"
          onClick={() => doSearch(query)}
          aria-label={t('search_btn')}
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-5 font-semibold text-sm transition-colors shrink-0"
        >
          <Search size={16} aria-hidden="true" />
          <span className="hidden xl:inline">{t('search_btn')}</span>
        </button>
      </div>

      {/* Suggestions dropdown — sibling of bar, NOT inside overflow-hidden */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Suggestions de recherche"
          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === activeSuggestion}
              onMouseDown={() => { setQuery(s.title); doSearch(s.title) }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm text-navy transition-colors ${
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
  )
}
