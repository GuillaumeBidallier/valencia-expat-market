'use client'
import { useTranslations } from 'next-intl'

export default function ProfessionnelsHeader() {
  const t = useTranslations('Pros')
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-navy mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('subtitle')}
        </p>
      </div>
    </div>
  )
}
