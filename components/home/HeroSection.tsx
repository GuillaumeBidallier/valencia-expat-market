'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import SearchWidget from '@/components/listings/SearchWidget'
import { useTranslations } from 'next-intl'

const SLIDES = [
  { src: '/valencia-hero.jpg', alt: 'Valencia — Cité des Arts et des Sciences' },
  { src: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1920&q=80', alt: 'Madrid — skyline du centre-ville' },
  { src: 'https://images.unsplash.com/photo-1578095172812-dcc191c5aed8?w=1920&q=80', alt: 'Barcelone — Sagrada Família' },
  { src: 'https://images.unsplash.com/photo-1559386081-325882507af7?w=1920&q=80', alt: 'Séville — Plaza de España' },
]
const SLIDE_DURATION = 6000

export default function HeroSection() {
  const t = useTranslations('Hero')
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % SLIDES.length), SLIDE_DURATION)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <section className="relative -mt-16 min-h-[560px] sm:min-h-[620px] overflow-hidden">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            priority={i === 0}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/92 via-hero-dark/65 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/50" />

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setActive(i)}
              aria-label={`Diapositive ${i + 1} : ${slide.alt}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-36 sm:pt-28 sm:pb-40">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5">
              {t('line1')}<br />
              {t('line2')}<br />
              <span className="text-orange-primary">{t('highlight')}</span>
            </h1>
            <div className="flex items-start gap-3 bg-hero-dark/60 border border-indigo-primary/50 rounded-xl px-4 py-3 mb-5 max-w-lg">
              <ShieldCheck size={22} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-white/90 text-sm leading-snug">
                {t('trust')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SearchWidget />
    </>
  )
}
