'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Listing } from '@/types'
import FavoriteButton from './FavoriteButton'

const EXTERIEUR_LABELS: Record<string, string> = {
  balcon: 'Balcon',
  terrasse: 'Terrasse',
  jardin: 'Jardin',
  cour: 'Cour',
}

function formatSpecs(listing: Listing): string | null {
  const attrs = listing.attributes ?? {}
  const parts: string[] = []

  const chambres = attrs.chambres
  if (chambres != null) parts.push(`${chambres} ch.`)

  const surface = attrs.surface_habitable
  if (surface != null) parts.push(`${surface} m²`)

  const terrain = attrs.surface_terrain
  if (terrain != null) {
    parts.push(`Terrain ${terrain} m²`)
  } else {
    const exterieur = attrs.exterieur
    const values = Array.isArray(exterieur) ? exterieur : []
    for (const v of values.slice(0, 2)) {
      const label = EXTERIEUR_LABELS[v]
      if (label) parts.push(label)
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null
}

export default function RealEstateListingCard({
  listing,
  badge,
  isFavorited,
}: {
  listing: Listing
  badge?: 'nouveau'
  isFavorited?: boolean
}) {
  const t = useTranslations('Listings')
  const specs = formatSpecs(listing)

  return (
    <Link
      href={`/annonces/${listing.id}`}
      aria-label={`${listing.title} — ${listing.price !== null ? `${listing.price} €` : t('free')} — ${listing.neighborhood}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-orange-primary/30 transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]?.url ?? ''}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge === 'nouveau' && (
          <span className="absolute top-2.5 left-2.5 bg-orange-primary text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide">
            {t('new_badge')}
          </span>
        )}
        <FavoriteButton
          listingId={listing.id}
          initialFavorited={isFavorited}
          iconSize={13}
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full shadow hover:scale-110 flex items-center justify-center"
        />
      </div>

      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-navy text-sm line-clamp-2 leading-snug">{listing.title}</h3>
        {specs && <p className="text-gray-500 text-xs">{specs}</p>}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs min-w-0">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{listing.neighborhood}</span>
          </div>
          <div className="font-black text-orange-primary text-base shrink-0">
            {listing.price !== null ? `${listing.price.toLocaleString('fr-FR')} €` : <span className="text-green-600 font-bold text-sm">{t('free')}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
