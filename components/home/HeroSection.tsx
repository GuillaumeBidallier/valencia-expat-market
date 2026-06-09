'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Search, ChevronDown, ShieldCheck } from 'lucide-react'
import GeoModal, { GeoState } from '@/components/listings/GeoModal'

interface CategoryItem {
  label: string
  slug: string
}

export default function HeroSection({ categoryItems }: { categoryItems: CategoryItem[] }) {
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geo, setGeo] = useState<GeoState | null>(null)

  const locationLabel = geo ? `${geo.city}, ${geo.radius} km` : "Tout l'Espagne"

  return (
    <>
      <section className="relative -mt-16 min-h-[560px] sm:min-h-[620px] overflow-hidden">
        {/* Background */}
        <Image
          src="/valencia-hero.jpg"
          alt="Valencia City of Arts and Sciences"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/92 via-hero-dark/65 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/50" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-36 sm:pt-28 sm:pb-40">
          <div className="max-w-xl">
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5">
              Le site gratuit des<br />
              petites annonces entre<br />
              <span className="text-orange-primary">expatriés.</span>
            </h1>

            {/* Safety notice box */}
            <div className="flex items-start gap-3 bg-hero-dark/60 border border-indigo-primary/50 rounded-xl px-4 py-3 mb-5 max-w-lg">
              <ShieldCheck size={22} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-white/90 text-sm leading-snug">
                Le site met uniquement en relation acheteurs et vendeurs : paiement et remise des articles se font directement entre vous.
              </p>
            </div>

            {/* Clickable location */}
            <button
              onClick={() => setGeoModalOpen(true)}
              className="flex items-center gap-2 text-white hover:text-orange-primary transition-colors mb-4 group"
            >
              <MapPin size={16} className="text-orange-primary shrink-0" />
              <span className="font-semibold text-base group-hover:underline underline-offset-2">{locationLabel}</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-orange-primary" />
            </button>
          </div>
        </div>
      </section>

      {/* Floating search bar */}
      <div className="-mt-16 relative z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-3">
          {/* Mobile layout */}
          <div className="flex flex-col gap-2 sm:hidden">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
            <select className="flex-1 px-3 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <Link
              href="/annonces"
              className="flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
            >
              <Search size={16} />
              Rechercher
            </Link>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
              />
            </div>
            <select className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer hover:border-indigo-primary transition-colors min-w-[170px]">
              <option value="">Toutes les catégories</option>
              {categoryItems.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <Link
              href="/annonces"
              className="flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={16} />
              Rechercher
            </Link>
          </div>
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
