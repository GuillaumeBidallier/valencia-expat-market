'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Listing } from '@/types'
import ListingRow from '@/components/listings/ListingRow'
import VehicleListingCardDark from '@/components/listings/VehicleListingCardDark'
import RealEstateListingCard from '@/components/listings/RealEstateListingCard'
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
  q: string
  sort: string
  priceMin?: number
  priceMax?: number
  lat?: number
  lng?: number
  dark?: boolean
  immobilier?: boolean
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
  q,
  sort,
  priceMin,
  priceMax,
  lat,
  lng,
  dark,
  immobilier,
}: Props) {
  const router = useRouter()
  const buildUrl = (p: number, sortOverride?: string) => {
    const sp = new URLSearchParams()
    if (q)                   sp.set('q',        q)
    if (cat)                 sp.set('cat',      cat)
    if (ville)               sp.set('ville',    ville)
    if (priceMin !== undefined) sp.set('priceMin', String(priceMin))
    if (priceMax !== undefined) sp.set('priceMax', String(priceMax))
    const sortValue = sortOverride !== undefined ? sortOverride : sort
    if (sortValue)           sp.set('sort',     sortValue)
    if (lat !== undefined)   sp.set('lat',      String(lat))
    if (lng !== undefined)   sp.set('lng',      String(lng))
    if (hasLocation) { sp.set('radius', String(radius)); sp.set('geoLabel', geoLabel) }
    if (p > 1)               sp.set('page',     String(p))
    return `/annonces?${sp.toString()}`
  }
  const t = useTranslations('Annonces')
  const tf = useTranslations('Filters')
  const favSet = new Set(favoritedIds)

  return (
    <div className="flex-1 min-w-0">
      <div className="hidden lg:flex items-center gap-2 mb-3">
        <span className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>
          <strong className={dark ? 'text-white' : 'text-navy'}>{displayTotal !== 1 ? t('count_plural', { count: displayTotal }) : t('count', { count: displayTotal })}</strong>
          {activeCatIcon && activeCatLabel && (
            <span className={`ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-red-600/15 text-red-400' : 'bg-orange-soft text-orange-primary'}`}>
              {activeCatIcon} {activeCatLabel}
            </span>
          )}
          {ville && <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}>{ville}</span>}
          {hasLocation && (
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${dark ? 'bg-red-600/15 text-red-400' : 'bg-blue-50 text-blue-600'}`}>
              <MapPin size={10} /> {t('radius_around', { radius })}
            </span>
          )}
        </span>

        {immobilier && (
          <label className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            {tf('sort_by')} :
            <select
              value={sort}
              onChange={e => router.push(buildUrl(1, e.target.value))}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
            >
              <option value="">{tf('sort_pertinence')}</option>
              <option value="recent">{tf('sort_recent')}</option>
              <option value="oldest">{tf('sort_oldest')}</option>
              {hasLocation && <option value="distance">{tf('sort_nearest')}</option>}
              <option value="price_asc">{tf('sort_price_asc')}</option>
              <option value="price_desc">{tf('sort_price_desc')}</option>
            </select>
          </label>
        )}
      </div>

      {listings.length === 0 ? (
        <div className={`text-center py-20 rounded-xl border ${dark ? 'bg-[#121218] border-white/10' : 'bg-white border-gray-100'}`}>
          <p className="text-4xl mb-3">🔍</p>
          <p className={`font-semibold text-lg ${dark ? 'text-white' : 'text-navy'}`}>{t('empty_title')}</p>
          <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{t('empty_sub')}</p>
          <Link href="/annonces" className={`inline-block mt-4 text-sm font-semibold hover:underline ${dark ? 'text-red-400' : 'text-orange-primary'}`}>
            {t('see_all')}
          </Link>
        </div>
      ) : dark ? (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {listings.map((listing, i) => (
              <VehicleListingCardDark
                key={listing.id}
                listing={listing}
                badge={i < 2 ? 'nouveau' : undefined}
                isFavorited={favSet.has(listing.id)}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <Link href={buildUrl(page - 1)} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/70 bg-[#121218] border border-white/10 rounded-lg hover:border-white/25 transition-colors">
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
                        p === page ? 'bg-red-600 text-white' : 'bg-[#121218] border border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>
              {page < pages && (
                <Link href={buildUrl(page + 1)} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/70 bg-[#121218] border border-white/10 rounded-lg hover:border-white/25 transition-colors">
                  {t('next')} <ChevronRight size={14} />
                </Link>
              )}
            </div>
          )}
        </>
      ) : immobilier ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing, i) => (
              <RealEstateListingCard
                key={listing.id}
                listing={listing}
                badge={i === 0 ? 'nouveau' : undefined}
                isFavorited={favSet.has(listing.id)}
              />
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
