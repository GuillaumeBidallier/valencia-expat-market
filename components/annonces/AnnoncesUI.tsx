'use client'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Listing } from '@/types'
import ListingRow from '@/components/listings/ListingRow'
import AdUnit from '@/components/ads/AdUnit'

type ListingWithDist = Listing & { distanceKm?: number }

interface Props {
  listings: ListingWithDist[]
  favoritedIds: string[]
  displayTotal: number
  page: number
  pages: number
  cat: string
  ville: string
  hasLocation: boolean
  radius: number
  geoLabel: string
  activeCatIcon?: string
  activeCatLabel?: string
  buildUrl: (p: number) => string
}

export default function AnnoncesUI({
  listings,
  favoritedIds,
  displayTotal,
  page,
  pages,
  cat,
  ville,
  hasLocation,
  radius,
  geoLabel,
  activeCatIcon,
  activeCatLabel,
  buildUrl,
}: Props) {
  const t = useTranslations('Annonces')
  const favSet = new Set(favoritedIds)

  return (
    <div className="flex-1 min-w-0">
      <div className="hidden lg:flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-500">
          <strong className="text-navy">{displayTotal !== 1 ? t('count_plural', { count: displayTotal }) : t('count', { count: displayTotal })}</strong>
          {activeCatIcon && activeCatLabel && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-orange-soft text-orange-primary px-2 py-0.5 rounded-full font-medium">
              {activeCatIcon} {activeCatLabel}
            </span>
          )}
          {ville && <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ville}</span>}
          {hasLocation && (
            <span className="ml-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <MapPin size={10} /> {t('radius_around', { radius })}
            </span>
          )}
        </span>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-navy text-lg">{t('empty_title')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('empty_sub')}</p>
          <Link href="/annonces" className="inline-block mt-4 text-sm text-orange-primary font-semibold hover:underline">
            {t('see_all')}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {listings.map((listing, i) => (
              <div key={listing.id}>
                <ListingRow listing={listing} distanceKm={listing.distanceKm} isFavorited={favSet.has(listing.id)} />
                {(i + 1) % 6 === 0 && <AdUnit size="banner" seed={i} category={cat || undefined} neighborhood={geoLabel !== 'Ma position' ? geoLabel : undefined} />}
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <Link href={buildUrl(page - 1)} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={14} /> {t('prev')}
                </Link>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i
                  if (p < 1 || p > pages) return null
                  return (
                    <Link
                      key={p}
                      href={buildUrl(p)}
                      className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg font-medium transition-colors ${
                        p === page ? 'bg-orange-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>
              {page < pages && (
                <Link href={buildUrl(page + 1)} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {t('next')} <ChevronRight size={14} />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
