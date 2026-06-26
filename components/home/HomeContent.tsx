'use client'
import Link from 'next/link'
import { Shield, Users, Tag, Home, Briefcase, Car, Sofa, Smartphone, PawPrint, Wrench, Globe } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import AdUnit from '@/components/ads/AdUnit'
import PromoBanner from '@/components/home/PromoBanner'
import ProsBanner from '@/components/home/ProsBanner'
import HeroSection from '@/components/home/HeroSection'
import { useTranslations } from 'next-intl'
import type { Listing } from '@/types'
import type { Professional } from '@prisma/client'

export default function HomeContent({
  featured,
  featuredPros,
  homeFavIds,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featured: any[]
  featuredPros: (Professional & { recommended?: boolean })[]
  homeFavIds: string[]
}) {
  const t = useTranslations('Home')

  const categoryItems = [
    { icon: Home,        label: t('cat_real_estate'), slug: 'meubles' },
    { icon: Briefcase,   label: t('cat_jobs'),        slug: 'services' },
    { icon: Car,         label: t('cat_vehicles'),    slug: 'vehicules' },
    { icon: Sofa,        label: t('cat_home'),        slug: 'meubles' },
    { icon: Smartphone,  label: t('cat_electronics'), slug: 'electromenager' },
    { icon: PawPrint,    label: t('cat_pets'),        slug: 'animaux' },
    { icon: Wrench,      label: t('cat_services'),    slug: 'services' },
    { icon: Globe,       label: t('cat_misc'),        slug: 'autres' },
  ]

  const trustItems = [
    { icon: Tag,    title: t('trust_free_title'),      desc: t('trust_free_desc') },
    { icon: Shield, title: t('trust_secure_title'),    desc: t('trust_secure_desc') },
    { icon: Users,  title: t('trust_community_title'), desc: t('trust_community_desc') },
  ]

  const favSet = new Set(homeFavIds)

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />

      <div className="max-w-screen-2xl mx-auto px-2 lg:px-6 flex gap-4 items-start">
        <div className="hidden xl:block shrink-0 sticky top-20 pt-10">
          <AdUnit size="skyscraper" seed={0} />
        </div>

        <div className="flex-1 min-w-0">
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

          <PromoBanner />
          <ProsBanner pros={featuredPros} />

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-navy">{t('latest')}</h2>
              <Link href="/annonces" className="text-orange-primary text-sm font-bold hover:underline">
                {t('view_all')}
              </Link>
            </div>

            <AdUnit size="banner" seed={0} className="mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((listing, i) => (
                <>
                  <ListingCard key={listing.id} listing={listing as Listing} badge={i < 2 ? 'une' : i < 4 ? 'nouveau' : undefined} isFavorited={favSet.has(listing.id)} />
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
                {t('view_all_btn')}
              </Link>
            </div>
          </section>
        </div>

        <div className="hidden xl:block shrink-0 sticky top-20 pt-10">
          <AdUnit size="skyscraper" seed={4} />
        </div>
      </div>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">1000Click</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-2">{t('how_title')}</h2>
            <p className="text-gray-500 text-sm">{t('how_sub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-orange-primary/30 via-orange-primary to-orange-primary/30 pointer-events-none" />
            {[
              { num: t('how_step1_num'), title: t('how_step1_title'), desc: t('how_step1_desc') },
              { num: t('how_step2_num'), title: t('how_step2_title'), desc: t('how_step2_desc') },
              { num: t('how_step3_num'), title: t('how_step3_title'), desc: t('how_step3_desc') },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-full bg-orange-primary flex items-center justify-center mb-4 shadow-lg shadow-orange-primary/30 z-10">
                  <span className="text-2xl font-black text-white">{step.num}</span>
                </div>
                <p className="font-black text-navy text-base mb-2">{step.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/deposer-annonce"
              className="inline-flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-8 py-3.5 rounded-xl font-black text-sm transition-colors shadow-lg shadow-orange-primary/30"
            >
              {t('how_cta')} →
            </Link>
          </div>
        </div>
      </section>

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
