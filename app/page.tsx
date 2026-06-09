import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Shield, Users, Tag, Home, Briefcase, Car, Sofa, Smartphone, PawPrint, Wrench, Globe } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import AdUnit from '@/components/ads/AdUnit'
import { mockListings } from '@/data/listings'

const categoryItems = [
  { icon: Home, label: 'Immobilier', slug: 'meubles' },
  { icon: Briefcase, label: 'Emploi', slug: 'services' },
  { icon: Car, label: 'Véhicules', slug: 'vehicules' },
  { icon: Sofa, label: 'Maison', slug: 'meubles' },
  { icon: Smartphone, label: 'Électronique', slug: 'electromenager' },
  { icon: PawPrint, label: 'Animaux', slug: 'animaux' },
  { icon: Wrench, label: 'Services', slug: 'services' },
  { icon: Globe, label: 'Communauté', slug: 'dons' },
]

const trustItems = [
  { icon: Tag, title: '100% gratuit', desc: 'Déposez et consultez vos annonces gratuitement' },
  { icon: Shield, title: 'Sécurisé', desc: 'Des échanges en toute confiance' },
  { icon: Users, title: 'Communauté', desc: "Une communauté d'expatriés à travers toute l'Espagne" },
]

export default function HomePage() {
  const featured = mockListings.slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[420px] sm:min-h-[500px] overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=700&fit=crop"
          alt="Valencia"
          fill
          className="object-cover object-center"
          unoptimized
          priority
        />
        {/* Gradient overlay — dark on left, transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/90 via-hero-dark/60 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/30" />

        {/* Top-right action buttons */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-3 z-10">
          <Link
            href="/deposer-annonce"
            className="hidden sm:flex items-center gap-2 bg-orange-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors shadow"
          >
            Déposer une annonce
          </Link>
          <Link
            href="/connexion"
            className="flex items-center gap-2 border-2 border-white text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Se connecter
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-28 sm:pt-20 sm:pb-32">
          <div className="max-w-xl">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">V</span>
              </div>
              <div className="leading-tight">
                <div className="text-white font-black text-2xl tracking-tight">VALENCIA</div>
                <div className="text-orange-primary font-bold text-sm tracking-widest uppercase">Expat Market</div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Le site gratuit des<br />
              petites annonces entre<br />
              <span className="text-orange-primary">expatriés.</span>
            </h1>

            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin size={14} className="text-orange-primary" />
              <span>Tout Valencia &amp; alentours</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FLOATING SEARCH BAR ===== */}
      <div className="-mt-14 relative z-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Que recherchez-vous ?"
              className="flex-1 py-3 text-sm text-navy placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>
          <select className="px-3 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl focus:outline-none bg-white hidden sm:block min-w-[160px]">
            <option value="">Toutes les catégories</option>
            {categoryItems.map(c => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <Link
            href="/annonces"
            className="flex items-center gap-2 bg-orange-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors whitespace-nowrap"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Rechercher</span>
          </Link>
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {categoryItems.map((cat) => (
            <Link
              key={cat.label}
              href={`/annonces?cat=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-primary hover:shadow-md transition-all group"
            >
              <cat.icon size={28} className="text-indigo-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-navy text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DERNIÈRES ANNONCES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-navy">Dernières annonces</h2>
          <Link href="/annonces" className="text-orange-primary text-sm font-bold hover:underline">
            Voir toutes
          </Link>
        </div>

        {/* Ad banner above grid */}
        <AdUnit size="banner" seed={0} className="mb-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((listing, i) => (
            <>
              <ListingCard key={listing.id} listing={listing} badge={i < 2 ? 'une' : i < 4 ? 'nouveau' : undefined} />
              {i === 3 && (
                <div key="ad-inline" className="sm:col-span-2 lg:col-span-4">
                  <AdUnit size="inline" seed={2} />
                </div>
              )}
            </>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 bg-indigo-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-dark transition-colors"
          >
            Voir toutes les annonces ({mockListings.length})
          </Link>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-hero-dark">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 border-2 border-orange-primary rounded-full flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-orange-primary" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
