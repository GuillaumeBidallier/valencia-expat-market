'use client'
import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import ListingRow from '@/components/listings/ListingRow'
import SearchBar from '@/components/listings/SearchBar'
import AdUnit from '@/components/ads/AdUnit'
import { useListings } from '@/context/ListingsContext'
import { categories, neighborhoods } from '@/lib/categories'

function AnnoncesContent() {
  const searchParams = useSearchParams()
  const { listings } = useListings()

  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date')
  const [showFilters, setShowFilters] = useState(false)

  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || ''
  const ville = searchParams.get('ville') || ''

  const filtered = useMemo(() => {
    let result = listings.filter(l => {
      const matchQ = !q || l.title.toLowerCase().includes(q.toLowerCase()) || l.description.toLowerCase().includes(q.toLowerCase())
      const matchCat = !cat || l.categorySlug === cat
      const matchVille = !ville || l.neighborhood === ville || l.city === ville
      const matchMin = !priceMin || (l.price !== null && l.price >= Number(priceMin))
      const matchMax = !priceMax || (l.price !== null && l.price <= Number(priceMax))
      return matchQ && matchCat && matchVille && matchMin && matchMax
    })
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    return result
  }, [listings, q, cat, ville, priceMin, priceMax, sortBy])

  const activeFiltersCount = [cat, ville, priceMin, priceMax].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar defaultQuery={q} defaultCategory={cat} defaultCity={ville} />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-2 lg:px-6 py-5">
        <div className="flex gap-3 items-start">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-32">
              <h3 className="font-bold text-navy text-sm mb-4">Filtres</h3>

              {/* Category */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Catégorie</label>
                <select
                  value={cat}
                  onChange={e => {
                    const params = new URLSearchParams(window.location.search)
                    e.target.value ? params.set('cat', e.target.value) : params.delete('cat')
                    window.history.pushState({}, '', `/annonces?${params}`)
                    window.location.href = `/annonces?${params}`
                  }}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-valencia"
                >
                  <option value="">Toutes</option>
                  {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Prix (€)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-valencia"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-valencia"
                  />
                </div>
              </div>

              {/* Neighborhood */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Quartier</label>
                <select
                  value={ville}
                  onChange={e => {
                    const params = new URLSearchParams(window.location.search)
                    e.target.value ? params.set('ville', e.target.value) : params.delete('ville')
                    window.history.pushState({}, '', `/annonces?${params}`)
                    window.location.href = `/annonces?${params}`
                  }}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-valencia"
                >
                  <option value="">Tous les quartiers</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Trier par</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-valencia"
                >
                  <option value="date">Plus récentes</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>

              {/* Sidebar ad */}
              <AdUnit size="rectangle" seed={2} className="mt-2" />
              <AdUnit size="rectangle" seed={5} className="mt-2" />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters toggle + count */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 font-medium">
                <strong className="text-navy">{filtered.length}</strong> annonce{filtered.length > 1 ? 's' : ''}
                {cat && <span className="ml-2 text-xs bg-blue-soft text-blue-valencia px-2 py-0.5 rounded-full">{categories.find(c => c.slug === cat)?.label}</span>}
                {ville && <span className="ml-1 text-xs bg-blue-soft text-blue-valencia px-2 py-0.5 rounded-full">{ville}</span>}
              </span>
              <button
                onClick={() => setShowFilters(f => !f)}
                className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-blue-valencia border border-blue-valencia px-3 py-1.5 rounded-lg"
              >
                <SlidersHorizontal size={14} />
                Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>

            {/* Mobile filters panel */}
            {showFilters && (
              <div className="lg:hidden bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-navy text-sm">Filtres</span>
                  <button onClick={() => setShowFilters(false)}><X size={16} className="text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Prix min (€)</label>
                    <input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Prix max (€)</label>
                    <input type="number" placeholder="∞" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Listing rows */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-gray-200">
                <p className="text-lg">Aucune annonce trouvée.</p>
                <p className="text-sm mt-1">Essayez d&apos;autres filtres.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((listing, i) => (
                  <>
                    <ListingRow key={listing.id} listing={listing} />
                    {(i + 1) % 6 === 0 && (
                      <AdUnit key={`ad-${i}`} size="banner" seed={i} />
                    )}
                  </>
                ))}
              </div>
            )}
          </div>

          {/* Right skyscraper — desktop only */}
          <div className="hidden xl:block shrink-0 sticky top-32">
            <AdUnit size="skyscraper" seed={3} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-400">Chargement...</div>}>
      <AnnoncesContent />
    </Suspense>
  )
}
