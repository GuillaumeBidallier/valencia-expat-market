export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, Users, Tag, Home, Briefcase, Car, Sofa, Smartphone, PawPrint, Wrench, Globe } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import AdUnit from '@/components/ads/AdUnit'
import HeroSection from '@/components/home/HeroSection'
import PromoBanner from '@/components/home/PromoBanner'
import { prisma } from '@/lib/prisma'

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

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featured: any[] = []

  try {
    const rows = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }],
      take: 8,
    })
    featured = rows.map(l => ({
      ...l,
      boostExpiresAt: l.boostExpiresAt?.toISOString() ?? null,
      featuredAt: l.featuredAt?.toISOString() ?? null,
      publishedAt: l.publishedAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }))
  } catch (e) {
    console.error('[HomePage] DB error:', e)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO + SEARCH ===== */}
      <HeroSection />

      {/* ===== CATEGORIES + ANNONCES + SKYSCRAPERS ===== */}
      <div className="max-w-screen-2xl mx-auto px-2 lg:px-6 flex gap-4 items-start">

        {/* Left skyscraper */}
        <div className="hidden xl:block shrink-0 sticky top-20 pt-10">
          <AdUnit size="skyscraper" seed={0} />
        </div>

        <div className="flex-1 min-w-0">

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

      {/* ===== PROMO BANNER ===== */}
      <PromoBanner />

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
            Voir toutes les annonces
          </Link>
        </div>
      </section>

        </div>{/* end flex-1 */}

        {/* Right skyscraper */}
        <div className="hidden xl:block shrink-0 sticky top-20 pt-10">
          <AdUnit size="skyscraper" seed={4} />
        </div>

      </div>{/* end skyscraper wrapper */}

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
