'use client'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import SearchWidget from '@/components/listings/SearchWidget'

interface CategoryItem {
  label: string
  slug: string
}

export default function HeroSection({ categoryItems }: { categoryItems: CategoryItem[] }) {
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
              <span className="text-orange-primary">la communauté francophone en Espagne.</span>
            </h1>

            {/* Safety notice box */}
            <div className="flex items-start gap-3 bg-hero-dark/60 border border-indigo-primary/50 rounded-xl px-4 py-3 mb-5 max-w-lg">
              <ShieldCheck size={22} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-white/90 text-sm leading-snug">
                Le site met uniquement en relation acheteurs et vendeurs : paiement et remise des articles se font directement entre vous.
              </p>
            </div>

          </div>
        </div>
      </section>

      <SearchWidget categoryItems={categoryItems} />
    </>
  )
}
