import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AnnonceEnAttentePage() {
  const t = await getTranslations('PendingReview')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={32} className="text-orange-primary" />
        </div>
        <h1 className="text-xl font-black text-navy mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{t('body')}</p>
        <p className="text-xs text-gray-400 mb-6">{t('note')}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/annonces"
            className="bg-orange-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
          >
            {t('see_listings')}
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-navy transition-colors py-1"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
