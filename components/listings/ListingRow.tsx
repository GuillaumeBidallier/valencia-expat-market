'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Navigation } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Listing } from '@/types'
import FavoriteButton from './FavoriteButton'

export default function ListingRow({ listing, distanceKm, isFavorited }: { listing: Listing; distanceKm?: number; isFavorited?: boolean }) {
  const t = useTranslations('Listings')

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return t('just_now')
    if (hours < 24) return t('hours_ago', { h: hours })
    const days = Math.floor(hours / 24)
    if (days === 1) return t('yesterday')
    return t('days_ago', { d: days })
  }

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="relative flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-valencia hover:shadow-md transition-all"
    >
      <FavoriteButton
        listingId={listing.id}
        initialFavorited={isFavorited}
        iconSize={14}
        className="absolute top-3 right-3 w-7 h-7 bg-white border border-gray-100 rounded-full shadow-sm hover:scale-110 z-10"
      />
      {/* Image */}
      <div className="relative w-28 h-24 sm:w-44 sm:h-36 md:w-56 md:h-40 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]?.url ?? ''}
          alt={listing.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="font-semibold text-navy text-sm sm:text-base md:text-lg line-clamp-2 leading-snug mb-1 sm:mb-2">
            {listing.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed hidden sm:block">
            {listing.description.slice(0, 130)}...
          </p>
        </div>
        <div className="flex items-end justify-between gap-1 sm:gap-2 mt-2 sm:mt-3">
          <div className="font-bold text-navy text-base sm:text-xl shrink-0">
            {listing.price !== null
              ? `${listing.price} €`
              : <span className="text-green-600 text-sm sm:text-lg">{t('free')}</span>
            }
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right min-w-0">
            <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">{listing.neighborhood}</span>
            </div>
            {distanceKm !== undefined && (
              <div className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                <Navigation size={11} className="shrink-0" />
                <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
              <Clock size={11} className="shrink-0" />
              <span>{timeAgo(listing.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
