'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ProCard from './ProCard'
import ProsFilters from './ProsFilters'
import AdUnit from '@/components/ads/AdUnit'
import { proCategories } from '@/lib/proCategories'
import type { Professional } from '@prisma/client'

interface Props {
  pros: Professional[]
  cat: string
  city: string
  activeCatLabel?: string
}

export default function ProfessionnelsUI({ pros, cat, city, activeCatLabel }: Props) {
  const t = useTranslations('Pros')

  return (
    <div className="flex-1 min-w-0">
      {/* Catégories */}
      <div className="flex gap-2 flex-wrap mb-6">
        <a
          href="/professionnels"
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            !cat ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy'
          }`}
        >
          {t('all')}
        </a>
        {proCategories.map(c => (
          <a
            key={c.slug}
            href={`/professionnels?cat=${c.slug}${city ? `&city=${city}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              cat === c.slug
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-navy'
            }`}
          >
            {c.icon} {c.label}
          </a>
        ))}
      </div>

      {/* Filtre ville */}
      <ProsFilters currentCat={cat} currentCity={city} />

      {/* Titre résultats */}
      <p className="text-sm text-gray-500 mb-5">
        <strong className="text-navy">
          {pros.length !== 1 ? t('count_plural', { count: pros.length }) : t('count', { count: pros.length })}
        </strong>
        {activeCatLabel ? ` · ${activeCatLabel}` : ''}
        {city ? ` · ${city}` : ''}
      </p>

      {/* Bannière pub */}
      <AdUnit size="banner" seed={11} category={cat || undefined} className="mb-5" />

      {pros.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-navy text-lg">{t('empty_title')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('empty_sub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pros.map(pro => (
            <ProCard key={pro.id} pro={pro} />
          ))}
        </div>
      )}

      {/* CTA inscription */}
      <div className="mt-12 bg-navy rounded-2xl p-6 sm:p-8 text-center text-white">
        <h2 className="text-xl font-black mb-2">{t('cta_title')}</h2>
        <p className="text-white/70 text-sm mb-5">{t('cta_desc')}</p>
        <a
          href="mailto:bidallierguillaume@gmail.com?subject=Référencement professionnel Vendo"
          className="inline-block bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
        >
          {t('cta_btn')}
        </a>
      </div>
    </div>
  )
}
