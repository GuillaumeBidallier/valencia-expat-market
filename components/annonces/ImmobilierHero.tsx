'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Home, Building2, Trees, Store, Building, ParkingCircle, Key, Users, type LucideIcon } from 'lucide-react'

const SUB_ICONS: Record<string, LucideIcon> = {
  'vente-maisons': Home,
  'vente-appartements': Building2,
  'vente-terrains': Trees,
  'vente-commerces': Store,
  'immeubles-de-rapport': Building,
  'parkings-garages': ParkingCircle,
  'location-immo': Key,
  colocations: Users,
}

export interface ImmobilierSubcategory {
  slug: string
  label: string
  count: number
}

export default function ImmobilierHero({ subcategories, currentCat }: { subcategories: ImmobilierSubcategory[]; currentCat: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    params.set('cat', 'immobilier')
    if (query.trim()) params.set('q', query.trim())
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative h-[300px] sm:h-[345px]">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[62%]">
          <Image
            src="/annonces/immobilier-hero-house-v2.jpg"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 62vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.9) 8%, rgba(255,255,255,0) 28%, transparent 100%)' }}
          />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Immobilier</p>
          <h1 className="text-3xl sm:text-4xl font-black text-navy leading-tight mb-3 max-w-xl">
            Trouvez le bien<br />qui vous correspond <span className="text-orange-primary">à 100%</span>
          </h1>
          <p className="text-gray-500 text-sm mb-7 max-w-md">
            Des annonces immobilières vérifiées partout en Belgique.
          </p>

          {/* Barre de recherche compacte */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-2 max-w-3xl shadow-sm">
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Que recherchez-vous ?"
                className="flex-1 min-w-0 bg-transparent text-sm text-navy placeholder-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shrink-0"
            >
              <Search size={14} /> Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Sous-catégories — équi-réparties sur toute la largeur, comme la page Véhicules */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${subcategories.length}, minmax(0, 1fr))` }}>
          {subcategories.map(sub => {
            const Icon = SUB_ICONS[sub.slug] ?? Home
            const isActive = sub.slug === currentCat
            return (
              <Link
                key={sub.slug}
                href={`/annonces?cat=${sub.slug}`}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-white border-orange-primary'
                    : 'bg-white border-gray-200 hover:border-orange-primary/40'
                }`}
              >
                <Icon size={26} strokeWidth={1.5} className={isActive ? 'text-orange-primary' : 'text-navy'} />
                <span className="min-w-0 text-center">
                  <span className="block text-xs font-bold leading-snug text-navy">{sub.label}</span>
                  <span className="block text-[11px] text-gray-400 whitespace-nowrap">
                    {sub.count} annonce{sub.count > 1 ? 's' : ''}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
