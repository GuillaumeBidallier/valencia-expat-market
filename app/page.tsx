import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import ListingRow from '@/components/listings/ListingRow'
import { mockListings } from '@/data/listings'
import { categories } from '@/lib/categories'

export default function HomePage() {
  const recent = mockListings.slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner — compact, Leboncoin style */}
      <section className="bg-blue-valencia">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Le site gratuit des petites annonces entre expatriés à Valencia
            </h1>
            <p className="text-white/70 text-sm">{mockListings.length} annonces disponibles à Valencia</p>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex bg-white rounded-lg overflow-hidden shadow">
              <input
                type="text"
                placeholder="Que recherchez-vous ? (meuble, vélo, télévision...)"
                className="flex-1 px-4 py-3 text-sm text-navy placeholder-gray-400 focus:outline-none"
              />
              <select className="px-3 py-3 text-sm text-gray-600 border-l border-gray-200 focus:outline-none bg-white hidden sm:block">
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-orange-dark transition-colors shrink-0"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Rechercher</span>
            </Link>
          </div>

          {/* CTA déposer */}
          <div className="text-center mt-4">
            <Link
              href="/deposer-annonce"
              className="inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-dark transition-colors shadow-lg"
            >
              <Plus size={16} />
              Déposer une annonce gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/annonces?cat=${cat.slug}`}
                className="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-lg hover:bg-blue-soft transition-colors group"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-valencia whitespace-nowrap">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy text-base">
            Annonces récentes
            <span className="ml-2 text-gray-400 font-normal text-sm">({mockListings.length} annonces)</span>
          </h2>
          <Link href="/annonces" className="text-blue-valencia text-sm font-medium hover:underline">
            Voir toutes →
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {recent.map(listing => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 border-2 border-blue-valencia text-blue-valencia px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-soft transition-colors"
          >
            Voir toutes les annonces ({mockListings.length})
          </Link>
        </div>
      </main>
    </div>
  )
}
