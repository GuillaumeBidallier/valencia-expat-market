'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { Listing } from '@/types'
import FavoriteButton from './FavoriteButton'
import { FUEL, GEARBOX } from '@/lib/vehicleAttributes'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "à l'instant"
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hier'
  return `il y a ${days}j`
}

function formatSpecs(listing: Listing): string | null {
  const attrs = listing.attributes ?? {}
  const year = attrs.regdate
  const mileageRaw = attrs.mileage
  const fuelCode = attrs.fuel
  const gearboxCode = attrs.gearbox
  const fuelLabel = typeof fuelCode === 'string' ? FUEL.find(f => f.value === fuelCode)?.label : undefined
  const gearboxLabel = typeof gearboxCode === 'string' ? GEARBOX.find(g => g.value === gearboxCode)?.label : undefined
  const mileage = mileageRaw != null ? `${Number(mileageRaw).toLocaleString('fr-FR')} km` : null
  return [year, mileage, fuelLabel, gearboxLabel].filter(Boolean).join(' • ') || null
}

export default function VehicleListingCardDark({
  listing,
  badge,
  isFavorited,
}: {
  listing: Listing
  badge?: 'nouveau'
  isFavorited?: boolean
}) {
  const specs = formatSpecs(listing)

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="group flex flex-col sm:flex-row gap-4 bg-[#121218] border border-white/10 rounded-xl p-3 hover:border-red-600/50 transition-colors"
    >
      <div className="relative w-full sm:w-56 h-40 sm:h-36 shrink-0 rounded-lg overflow-hidden bg-white/5">
        <Image
          src={listing.images[0]?.url ?? ''}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, 224px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge === 'nouveau' && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide">
            Nouveau
          </span>
        )}
        <FavoriteButton
          listingId={listing.id}
          initialFavorited={isFavorited}
          iconSize={13}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 border border-white/20 rounded-full hover:scale-110 flex items-center justify-center"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="font-bold text-white text-base line-clamp-1">{listing.title}</h3>
          {specs && <p className="text-white/40 text-xs mt-1">{specs}</p>}
          <p className="text-white/40 text-sm mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
            {listing.description}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2 mt-3">
          <div className="font-black text-white text-xl shrink-0">
            {listing.price !== null ? `${listing.price.toLocaleString('fr-FR')} €` : <span className="text-emerald-400 text-base">Gratuit</span>}
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right min-w-0">
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate max-w-[120px]">{listing.neighborhood}</span>
            </div>
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Clock size={11} className="shrink-0" />
              <span>{timeAgo(listing.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
