'use client'
import { useState, useRef, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface Result {
  display_name: string
  lat: string
  lon: string
}

export interface CitySelection {
  name: string
  lat: number
  lng: number
}

interface Props {
  value: string
  onChange: (val: CitySelection | null) => void
  error?: string
  placeholder?: string
}

export default function CityAutocomplete({ value, onChange, error, placeholder = 'Ex : Ruzafa, Valencia…' }: Props) {
  const [input, setInput]           = useState(value)
  const [results, setResults]       = useState<Result[]>([])
  const [loading, setLoading]       = useState(false)
  const [open, setOpen]             = useState(false)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef                = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', España')}&format=json&limit=5&accept-language=fr`,
        { headers: { 'User-Agent': 'VendoExpat/1.0' } }
      )
      setResults(await res.json())
      setOpen(true)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const handleInput = (val: string) => {
    setInput(val)
    onChange(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  const select = (r: Result) => {
    const name = r.display_name.split(',')[0].trim()
    setInput(name)
    setResults([])
    setOpen(false)
    onChange({ name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })
  }

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm transition focus-within:ring-2 focus-within:ring-orange-primary/30 ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <MapPin size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={input}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent text-navy placeholder-gray-400"
          autoComplete="off"
        />
        {loading && <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((r, i) => {
            const parts = r.display_name.split(',')
            return (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => select(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors"
                >
                  <p className="text-sm font-medium text-navy">{parts[0]}</p>
                  <p className="text-xs text-gray-400">{parts.slice(1, 3).join(',').trim()}</p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
