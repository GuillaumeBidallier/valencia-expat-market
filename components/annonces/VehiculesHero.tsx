'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronRight, Car, Bike, Truck, Wrench, Caravan, Anchor, type LucideIcon } from 'lucide-react'

const SUB_ICONS: Record<string, LucideIcon> = {
  voitures: Car,
  motos: Bike,
  utilitaires: Truck,
  camions: Truck,
  caravaning: Caravan,
  nautisme: Anchor,
  equipement_auto: Wrench,
  equipement_moto: Wrench,
  equipement_caravaning: Wrench,
  equipement_nautisme: Wrench,
  mercedes: Car,
}

export interface VehiculeSubcategory {
  slug: string
  label: string
  count: number
}

export default function VehiculesHero({ subcategories, currentCat }: { subcategories: VehiculeSubcategory[]; currentCat: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    params.set('cat', 'vehicules')
    if (query.trim()) params.set('q', query.trim())
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f]">
      <Image
        src="/landing-test/card-vehicules-bmw-square.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(100deg, #0a0a0f 30%, rgba(10,10,15,0.75) 55%, rgba(220,38,38,0.12) 70%, transparent 100%)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(115deg, transparent 60%, rgba(220,38,38,0.5) 61%, transparent 63%)' }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-2">Véhicules</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3 max-w-xl">
          Trouvez le véhicule<br />qui vous correspond <span className="text-red-500">à 100%</span>
        </h1>
        <p className="text-white/50 text-sm mb-7 max-w-md">
          Des milliers d&apos;annonces automobiles vérifiées chaque jour en Belgique.
        </p>

        {/* Barre de recherche sombre */}
        <div className="flex flex-col sm:flex-row gap-2 bg-[#121218]/90 backdrop-blur-sm border border-white/10 rounded-xl p-2 max-w-3xl mb-8">
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5">
            <Search size={15} className="text-white/40 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Que recherchez-vous ?"
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Search size={14} /> Rechercher
          </button>
        </div>

        {/* Sous-catégories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {subcategories.map(sub => {
            const Icon = SUB_ICONS[sub.slug] ?? Car
            const isActive = sub.slug === currentCat
            return (
              <Link
                key={sub.slug}
                href={`/annonces?cat=${sub.slug}`}
                className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-red-600/15 border-red-600'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                }`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-red-600' : 'bg-white/10'}`}>
                  <Icon size={16} className="text-white" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-bold whitespace-nowrap ${isActive ? 'text-white' : 'text-white/80'}`}>{sub.label}</span>
                  <span className="block text-[11px] text-white/40 whitespace-nowrap">
                    {sub.count} annonce{sub.count > 1 ? 's' : ''}
                  </span>
                </span>
              </Link>
            )
          })}
          <Link
            href="/annonces?cat=vehicules"
            className="shrink-0 w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 hover:border-white/25 flex items-center justify-center transition-colors"
            aria-label="Voir toutes les catégories véhicules"
          >
            <ChevronRight size={16} className="text-white/60" />
          </Link>
        </div>
      </div>
    </section>
  )
}
