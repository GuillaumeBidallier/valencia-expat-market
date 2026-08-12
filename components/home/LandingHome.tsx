'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Tag, Shield, Users, Search, MapPin, ChevronDown, ChevronLeft, ChevronRight, Handshake,
  Car, Home, Zap, Repeat, TrendingUp, ShieldCheck,
  Sofa, Laptop, Shirt, Dumbbell, Baby, PawPrint, Briefcase, Heart, LayoutGrid, type LucideIcon,
} from 'lucide-react'
import FavoriteButton from '@/components/listings/FavoriteButton'
import VipBanner from '@/components/home/VipBanner'
import { useCategories } from '@/hooks/useCategories'
import { isVehicleCategory, FUEL } from '@/lib/vehicleAttributes'
import { isRealEstateCategory } from '@/lib/realEstateAttributes'
import type { Listing } from '@/types'
import type { CategoryTree } from '@/types'

function formatSpecs(listing: Listing): string | null {
  const attrs = listing.attributes ?? {}
  if (isVehicleCategory(listing.categorySlug)) {
    const year = attrs.regdate
    const mileageRaw = attrs.mileage
    const fuelCode = attrs.fuel
    const fuelLabel = typeof fuelCode === 'string' ? FUEL.find(f => f.value === fuelCode)?.label : undefined
    const mileage = mileageRaw != null ? `${Number(mileageRaw).toLocaleString('fr-FR')} km` : null
    return [year, mileage, fuelLabel].filter(Boolean).join(' • ') || null
  }
  if (isRealEstateCategory(listing.categorySlug)) {
    const chambres = attrs.chambres
    const surface = attrs.surface_habitable
    return [chambres ? `${chambres} ch.` : null, surface ? `${surface} m²` : null].filter(Boolean).join(' • ') || null
  }
  return null
}

function getCategoryBadge(categorySlug: string, categories: CategoryTree[]): { label: string; className: string } {
  if (isVehicleCategory(categorySlug)) return { label: 'Véhicule', className: 'bg-indigo-primary' }
  if (isRealEstateCategory(categorySlug)) return { label: 'Immobilier', className: 'bg-purple-600' }
  const all = categories.flatMap(c => [c, ...c.children])
  const found = all.find(c => c.slug === categorySlug)
  return { label: found?.label ?? 'Annonce', className: 'bg-teal-600' }
}

function HeroSearchBar({ categoryItems }: { categoryItems: CategoryTree[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('cat', category)
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-1.5 flex items-center gap-1.5">
      <div className="flex-1 min-w-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
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
        className="hidden md:flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl hover:border-orange-primary transition-colors shrink-0"
      >
        <MapPin size={14} className="text-gray-400" />
        <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Toute la Belgique</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="hidden md:block px-3 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white cursor-pointer shrink-0 max-w-[150px]"
      >
        <option value="">Toutes les catégories</option>
        {categoryItems.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
      </select>
      <button
        type="button"
        onClick={handleSearch}
        className="flex items-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-colors shrink-0 whitespace-nowrap"
      >
        <Search size={14} /> <span className="hidden sm:inline">Rechercher</span>
      </button>
    </div>
  )
}

function RecentListings({ categories }: { categories: CategoryTree[] }) {
  const [listings, setListings] = useState<Listing[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/listings?limit=10')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data.listings) ? data.listings : []))
      .catch(() => {})
  }, [])

  if (listings.length === 0) return null

  const scrollByCard = (dir: 1 | -1) => scrollerRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-navy">Annonces récentes</h2>
        <Link href="/annonces" className="text-orange-primary text-sm font-bold hover:underline">
          Voir toutes les annonces →
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Précédent"
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center hover:border-orange-primary transition-colors"
        >
          <ChevronLeft size={16} className="text-navy" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Suivant"
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center hover:border-orange-primary transition-colors"
        >
          <ChevronRight size={16} className="text-navy" />
        </button>

        <div ref={scrollerRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map(listing => {
            const badge = getCategoryBadge(listing.categorySlug, categories)
            const specs = formatSpecs(listing)
            return (
              <Link
                key={listing.id}
                href={`/annonces/${listing.id}`}
                className="group w-[85%] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] shrink-0 bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-indigo-primary/30 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={listing.images[0]?.url ?? ''}
                    alt={listing.title}
                    fill
                    sizes="240px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-2.5 left-2.5 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide ${badge.className}`}>
                    {badge.label}
                  </span>
                  <FavoriteButton
                    listingId={listing.id}
                    iconSize={13}
                    className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full shadow hover:scale-110 flex items-center justify-center"
                  />
                </div>
                <div className="p-3.5 flex flex-col gap-1">
                  <h3 className="font-bold text-navy text-sm line-clamp-2 leading-snug">{listing.title}</h3>
                  {specs && <p className="text-gray-400 text-xs">{specs}</p>}
                  <p className="font-black text-navy text-base mt-0.5">
                    {listing.price != null ? `${listing.price.toLocaleString('fr-FR')} €` : <span className="text-emerald-600 text-sm font-bold">Gratuit</span>}
                  </p>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MapPin size={10} />
                    <span className="truncate">{listing.city}, Belgique</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SmallListingsGrid({ categories }: { categories: CategoryTree[] }) {
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    fetch('/api/listings?limit=12')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data.listings) ? data.listings : []))
      .catch(() => {})
  }, [])

  if (listings.length === 0) return null

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-navy">À découvrir aussi</h2>
          <p className="text-sm text-gray-400 mt-0.5">Un aperçu de ce qui se publie sur 1000Click</p>
        </div>
        <Link href="/annonces" className="text-orange-primary text-sm font-bold hover:underline shrink-0 ml-4">
          Tout voir →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {listings.map(listing => {
          const badge = getCategoryBadge(listing.categorySlug, categories)
          return (
            <Link
              key={listing.id}
              href={`/annonces/${listing.id}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <Image
                src={listing.images[0]?.url ?? ''}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className={`absolute top-1.5 left-1.5 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${badge.className}`}>
                {badge.label}
              </span>
              <FavoriteButton
                listingId={listing.id}
                iconSize={11}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow hover:scale-110 flex items-center justify-center"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="text-white text-xs font-bold leading-snug line-clamp-1">{listing.title}</p>
                <p className="text-white text-sm font-black mt-0.5">
                  {listing.price != null ? `${listing.price.toLocaleString('fr-FR')} €` : <span className="text-emerald-300">Gratuit</span>}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  vehicules: Car,
  immobilier: Home,
  meubles: Sofa,
  multimedia: Laptop,
  mode: Shirt,
  livres: Dumbbell,
  enfants: Baby,
  animaux: PawPrint,
  services: Briefcase,
  dons: Heart,
  autres: LayoutGrid,
}

export default function LandingHome() {
  const allCategories = useCategories()
  const categoryItems = allCategories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero : image unique véhicule + immobilier ──────────────── */}
      <section className="relative -mt-[104px] min-h-[540px] sm:min-h-[580px] overflow-hidden">
        <Image
          src="/landing-test/hero-vehicules-immobilier.png"
          alt="Véhicules et biens immobiliers"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />

        {/* Callout gauche — Véhicules */}
        <div className="hidden lg:flex absolute left-8 xl:left-14 top-1/2 -translate-y-1/2 flex-col items-start z-10 max-w-[220px]">
          <p className="text-white/80 text-xs font-black tracking-[0.2em] uppercase mb-1">Trouvez votre</p>
          <p className="text-white text-4xl xl:text-5xl font-black leading-[0.95] mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">VÉHICULE</p>
          <Link
            href="/annonces?cat=vehicules"
            className="bg-indigo-primary text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-indigo-dark transition-colors whitespace-nowrap"
          >
            Parmi des milliers d&apos;annonces
          </Link>
        </div>

        {/* Callout droite — Immobilier */}
        <div className="hidden lg:flex absolute right-8 xl:right-14 top-1/2 -translate-y-1/2 flex-col items-end text-right z-10 max-w-[240px]">
          <p className="text-white/80 text-xs font-black tracking-[0.2em] uppercase mb-1">Découvrez votre</p>
          <p className="text-white text-4xl xl:text-5xl font-black leading-[0.95] mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">BIEN IDÉAL</p>
          <Link
            href="/annonces?cat=immobilier"
            className="bg-indigo-primary text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-indigo-dark transition-colors whitespace-nowrap"
          >
            Maisons, appartements, terrains...
          </Link>
        </div>

        {/* Halo clair pour garantir la lisibilité du texte central quel que soit le fond */}
        <div
          className="absolute inset-x-0 top-0 h-[480px] z-[5] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 760px 480px at 50% 48%, rgba(255,255,255,0.55), rgba(255,255,255,0.28) 55%, transparent 80%)' }}
        />

        {/* Bloc central */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-40 sm:pt-44 pb-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-white/60 text-navy text-[11px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 shadow-sm">
            Rapide <span className="text-emerald-600">&amp;</span> Sécurisé
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-navy leading-tight mb-4 drop-shadow-[0_2px_16px_rgba(255,255,255,0.7)]">
            Le site des petites annonces<br />qui connecte <span className="text-orange-primary">vos projets</span>
          </h1>
          <p className="text-navy font-bold mb-10 drop-shadow-[0_1px_10px_rgba(255,255,255,0.85)]">
            Déposez, trouvez, échangez. Simple, rapide et efficace.
          </p>
          <div className="w-full max-w-3xl">
            <HeroSearchBar categoryItems={categoryItems} />
          </div>
        </div>
      </section>

      {/* ── Icônes catégories : chevauche le bas du hero ─────────────── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 -mt-[52px] pb-6">
        <div
          className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-[repeat(var(--cat-count),minmax(0,1fr))] gap-3"
          style={{ '--cat-count': categoryItems.length } as React.CSSProperties}
        >
          {categoryItems.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug]
            return (
              <Link
                key={cat.slug}
                href={`/annonces?cat=${cat.slug}`}
                className="flex flex-col items-center gap-2 py-4 px-2 bg-white border border-gray-100 rounded-xl hover:border-indigo-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-soft flex items-center justify-center group-hover:bg-indigo-primary transition-colors">
                  {Icon
                    ? <Icon size={18} className="text-indigo-primary group-hover:text-white transition-colors" />
                    : <span className="text-lg">{cat.icon}</span>}
                </div>
                <span className="text-xs font-semibold text-navy text-center leading-tight">{cat.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Cartes promo Véhicules / Immobilier ─────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Véhicules — badge sur le bord GAUCHE */}
          <div className="relative rounded-2xl">
            <Link href="/annonces?cat=vehicules" className="group relative flex items-end h-64 rounded-t-2xl overflow-hidden">
              <Image
                src="/landing-test/card-vehicules-v2.png"
                alt="Véhicules"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/35 to-transparent" />
              <div className="relative z-10 p-6">
                <p className="text-indigo-200 text-[11px] font-black uppercase tracking-widest mb-2">Véhicules</p>
                <p className="text-white text-2xl font-black leading-tight mb-2">Trouvez votre<br /><span className="text-indigo-300">véhicule idéal</span></p>
                <p className="text-white/70 text-sm mb-4 max-w-xs">Voitures, motos, utilitaires et pièces détachées. Des milliers d&apos;annonces au meilleur prix.</p>
                <span className="inline-flex items-center gap-1.5 bg-indigo-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl group-hover:bg-indigo-dark transition-colors">
                  Voir les véhicules →
                </span>
              </div>
            </Link>
            <div className="bg-navy rounded-b-2xl px-6 sm:px-8 pl-14 py-4 flex items-center justify-between gap-3">
              {[
                { icon: Repeat, value: '23k+', label: 'Véhicules disponibles' },
                { icon: TrendingUp, value: '1k+', label: 'Nouvelles annonces / jour' },
                { icon: ShieldCheck, value: '98%', label: 'Satisfaction client' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 min-w-0">
                  <s.icon size={16} className="text-indigo-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-black leading-none">{s.value}</p>
                    <p className="text-white/50 text-[10px] leading-tight mt-0.5 truncate">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-primary border-4 border-white flex items-center justify-center shadow-md">
              <Car size={20} className="text-white" />
            </div>
          </div>

          {/* Immobilier — badge sur le bord DROIT */}
          <div className="relative rounded-2xl">
            <Link href="/annonces?cat=immobilier" className="group relative flex items-end h-64 rounded-t-2xl overflow-hidden">
              <Image
                src="/landing-test/card-immobilier-v2.png"
                alt="Immobilier"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/35 to-transparent" />
              <div className="relative z-10 p-6">
                <p className="text-orange-200 text-[11px] font-black uppercase tracking-widest mb-2">Immobilier</p>
                <p className="text-white text-2xl font-black leading-tight mb-2">Trouvez le bien<br /><span className="text-orange-primary">qui vous correspond</span></p>
                <p className="text-white/70 text-sm mb-4 max-w-xs">Appartements, maisons, terrains... Achetez, louez ou investissez en toute confiance.</p>
                <span className="inline-flex items-center gap-1.5 bg-orange-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl group-hover:bg-orange-dark transition-colors">
                  Voir l&apos;immobilier →
                </span>
              </div>
            </Link>
            <div className="bg-navy rounded-b-2xl px-6 sm:px-8 pr-14 py-4 flex items-center justify-between gap-3">
              {[
                { icon: Repeat, value: '15k+', label: 'Biens disponibles' },
                { icon: TrendingUp, value: '850+', label: 'Nouvelles annonces / jour' },
                { icon: ShieldCheck, value: '97%', label: 'Utilisateurs satisfaits' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 min-w-0">
                  <s.icon size={16} className="text-orange-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-black leading-none">{s.value}</p>
                    <p className="text-white/50 text-[10px] leading-tight mt-0.5 truncate">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-orange-primary border-4 border-white flex items-center justify-center shadow-md">
              <Home size={20} className="text-white" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Réassurance ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
          {[
            { icon: Zap, color: 'text-blue-valencia bg-blue-soft', title: 'Rapide & simple', desc: 'Publiez votre annonce en quelques minutes, sans complications.' },
            { icon: Shield, color: 'text-blue-valencia bg-blue-soft', title: 'Sécurisé', desc: 'Vos transactions et échanges sont protégées et confidentielles.' },
            { icon: Users, color: 'text-orange-primary bg-orange-soft', title: 'Communauté', desc: "Rejoignez une communauté active et grandissante en Belgique." },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-black text-navy text-sm mb-1">{item.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bannière VIP réelle (masquée s'il n'y a aucun professionnel VIP actif) ── */}
      <VipBanner />

      {/* ── Annonces récentes ───────────────────────────────────────── */}
      <RecentListings categories={allCategories} />

      {/* ── Grille compacte : autre style visuel, cards plus petites ─── */}
      <SmallListingsGrid categories={allCategories} />

      {/* ── Bandeau chiffres clés ───────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-navy rounded-2xl px-6 sm:px-10 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { icon: Tag, value: '50k+', label: 'Annonces actives', sub: 'Trouvez ce que vous cherchez' },
            { icon: Users, value: '20k+', label: 'Membres actifs', sub: 'Une communauté en croissance' },
            { icon: MapPin, value: '50+', label: 'Villes couvertes', sub: 'Partout en Belgique' },
            { icon: Handshake, value: '98%', label: 'Satisfaction', sub: 'Nos utilisateurs nous font confiance' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon size={26} className="text-orange-primary shrink-0" />
              <div>
                <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
                <p className="text-sm font-bold text-white/90 mt-1">{stat.label}</p>
                <p className="text-xs text-white/40 mt-0.5 hidden sm:block">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA finale : déposer une annonce ─────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-14">
        <div className="relative rounded-2xl overflow-hidden bg-navy grid sm:grid-cols-2 items-center min-h-[220px]">
          <div className="relative z-10 p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">Prêt à publier votre annonce ?</h2>
            <p className="text-white/70 text-sm mb-6 max-w-sm">
              Rejoignez des milliers d&apos;utilisateurs et vendez, louez ou trouvez rapidement ce dont vous avez besoin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/deposer-annonce"
                className="inline-flex items-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors"
              >
                Déposer une annonce →
              </Link>
              <Link
                href="/#comment-ca-marche"
                className="inline-flex items-center gap-1.5 border border-white/30 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Comment ça marche ?
              </Link>
            </div>
          </div>
          <div className="relative h-48 sm:h-full min-h-[220px]">
            <Image
              src="/brussels-hero.png"
              alt="Publier une annonce en Belgique"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy sm:from-navy via-navy/10 to-transparent sm:bg-gradient-to-r" />
          </div>
        </div>
      </section>

    </div>
  )
}
