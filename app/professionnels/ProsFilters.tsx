'use client'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function ProsFilters({ currentCat, currentCity }: { currentCat: string; currentCity: string }) {
  const router = useRouter()
  const [city, setCity] = useState(currentCity)

  const handleCity = (val: string) => {
    setCity(val)
    const params = new URLSearchParams()
    if (currentCat) params.set('cat', currentCat)
    if (val.trim()) params.set('city', val.trim())
    router.push(`/professionnels?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 max-w-xs">
      <Search size={14} className="text-gray-400 shrink-0" />
      <input
        type="text"
        value={city}
        onChange={e => handleCity(e.target.value)}
        placeholder="Filtrer par ville…"
        className="flex-1 text-sm text-navy placeholder-gray-400 focus:outline-none bg-transparent"
      />
    </div>
  )
}
