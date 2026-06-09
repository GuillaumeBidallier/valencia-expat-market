import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { Listing } from '@/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "À l'instant"
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days}j`
}

export default function ListingRow({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="flex gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-valencia hover:shadow-sm transition-all"
    >
      <div className="relative w-36 h-28 sm:w-44 sm:h-32 shrink-0 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
        <div>
          <h3 className="font-semibold text-navy text-sm sm:text-base line-clamp-2 leading-snug mb-1">
            {listing.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed hidden sm:block">
            {listing.description.slice(0, 100)}...
          </p>
        </div>
        <div className="flex items-end justify-between gap-2 mt-2">
          <div className="font-bold text-navy text-lg">
            {listing.price !== null
              ? `${listing.price} €`
              : <span className="text-green-600 text-base">Gratuit</span>
            }
          </div>
          <div className="flex flex-col items-end gap-1 text-right shrink-0">
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <MapPin size={10} />
              <span>{listing.neighborhood}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock size={10} />
              <span>{timeAgo(listing.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
