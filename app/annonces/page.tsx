'use client'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import SearchBar from '@/components/listings/SearchBar'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/context/ListingsContext'
import { categories } from '@/lib/categories'

function AnnoncesContent() {
  const searchParams = useSearchParams()
  const { listings } = useListings()
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date')

  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || ''
  const ville = searchParams.get('ville') || ''

  const filtered = useMemo(() => {
    let result = listings.filter(l => {
      const matchQ = !q || l.title.toLowerCase().includes(q.toLowerCase()) || l.description.toLowerCase().includes(q.toLowerCase())
      const matchCat = !cat || l.categorySlug === cat
      const matchVille = !ville || l.neighborhood === ville || l.city === ville
      return matchQ && matchCat && matchVille
    })
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    return result
  }, [listings, q, cat, ville, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <SearchBar defaultQuery={q} defaultCategory={cat} defaultCity={ville} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</span>
          {cat && <span className="text-xs bg-orange-soft text-orange-primary px-2 py-1 rounded-full font-medium">{categories.find(c => c.slug === cat)?.label}</span>}
          {ville && <span className="text-xs bg-orange-soft text-orange-primary px-2 py-1 rounded-full font-medium">{ville}</span>}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-primary"
          >
            <option value="date">Plus récentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <a href="/annonces" className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${!cat ? 'bg-orange-primary text-white border-orange-primary' : 'border-gray-200 text-gray-600 hover:border-orange-primary'}`}>
          Tout
        </a>
        {categories.map(c => (
          <a key={c.slug} href={`/annonces?cat=${c.slug}`} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${cat === c.slug ? 'bg-orange-primary text-white border-orange-primary' : 'border-gray-200 text-gray-600 hover:border-orange-primary'}`}>
            {c.icon} {c.label}
          </a>
        ))}
      </div>

      <ListingGrid listings={filtered} />
    </div>
  )
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">Chargement...</div>}>
      <AnnoncesContent />
    </Suspense>
  )
}
