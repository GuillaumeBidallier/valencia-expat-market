'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { categories, neighborhoods } from '@/lib/categories'

interface SearchBarProps {
  defaultQuery?: string
  defaultCategory?: string
  defaultCity?: string
}

export default function SearchBar({ defaultQuery = '', defaultCategory = '', defaultCity = '' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [category, setCategory] = useState(defaultCategory)
  const [city, setCity] = useState(defaultCity)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('cat', category)
    if (city) params.set('ville', city)
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl shadow-md p-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Que recherchez-vous ?"
        className="flex-1 px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none rounded-lg"
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="px-3 py-2.5 text-sm text-navy border-l border-gray-100 focus:outline-none bg-white cursor-pointer sm:min-w-[160px]"
      >
        <option value="">Toutes les catégories</option>
        {categories.map(c => (
          <option key={c.slug} value={c.slug}>{c.label}</option>
        ))}
      </select>
      <select
        value={city}
        onChange={e => setCity(e.target.value)}
        className="px-3 py-2.5 text-sm text-navy border-l border-gray-100 focus:outline-none bg-white cursor-pointer sm:min-w-[130px]"
      >
        <option value="">Valencia</option>
        {neighborhoods.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button
        type="submit"
        className="flex items-center gap-2 bg-orange-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-dark transition-colors"
      >
        <Search size={16} />
        Rechercher
      </button>
    </form>
  )
}
