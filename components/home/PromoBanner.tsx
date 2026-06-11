'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function PromoBanner() {
  const t = useTranslations('PromoBanner')
  const [current, setCurrent] = useState(0)

  const SLIDES = [
    {
      bg: 'bg-gradient-to-r from-orange-primary to-orange-dark',
      tag: t('s1_tag'),
      title: t('s1_title'),
      subtitle: t('s1_sub'),
      cta: t('s1_cta'),
      href: '/deposer-annonce',
      emoji: '🏷️',
    },
    {
      bg: 'bg-gradient-to-r from-blue-valencia to-blue-dark',
      tag: t('s2_tag'),
      title: t('s2_title'),
      subtitle: t('s2_sub'),
      cta: t('s2_cta'),
      href: '/annonces',
      emoji: '🌍',
    },
    {
      bg: 'bg-gradient-to-r from-indigo-primary to-indigo-dark',
      tag: t('s3_tag'),
      title: t('s3_title'),
      subtitle: t('s3_sub'),
      cta: t('s3_cta'),
      href: '/annonces',
      emoji: '🗺️',
    },
  ]

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 4000)
    return () => clearInterval(id)
  }, [SLIDES.length])

  const slide = SLIDES[current]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-6">
      <div className={`relative rounded-2xl overflow-hidden ${slide.bg} transition-all duration-500`}>
        <div className="px-6 py-5 flex items-center gap-4">
          {/* Emoji */}
          <div className="text-5xl shrink-0 select-none">{slide.emoji}</div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <span className="inline-block bg-white/20 text-white text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full mb-1.5">
              {slide.tag}
            </span>
            <p className="text-white font-black text-xl leading-tight">{slide.title}</p>
            <p className="text-white/80 text-sm mt-0.5">{slide.subtitle}</p>
          </div>
          {/* CTA */}
          <Link
            href={slide.href}
            className="shrink-0 bg-white text-navy font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap hidden sm:block"
          >
            {slide.cta}
          </Link>
        </div>

        {/* Mobile CTA */}
        <div className="px-6 pb-4 sm:hidden">
          <Link
            href={slide.href}
            className="block w-full text-center bg-white text-navy font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-navy w-5' : 'bg-gray-300 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
