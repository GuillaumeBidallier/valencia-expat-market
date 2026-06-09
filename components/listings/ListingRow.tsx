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
      className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-valencia hover:shadow-md transition-all"
    >
      {/* Image — plus grande */}
      <div className="relative w-44 h-36 sm:w-56 sm:h-40 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]?.url ?? ''}
          alt={listing.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
        <div>
          <h3 className="font-semibold text-navy text-base sm:text-lg line-clamp-2 leading-snug mb-2">
            {listing.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed hidden sm:block">
            {listing.description.slice(0, 130)}...
          </p>
        </div>
        <div className="flex items-end justify-between gap-2 mt-3">
          <div className="font-bold text-navy text-xl">
            {listing.price !== null
              ? `${listing.price} €`
              : <span className="text-green-600 text-lg">Gratuit</span>
            }
          </div>
          <div className="flex flex-col items-end gap-1 text-right shrink-0">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin size={12} />
              <span>{listing.neighborhood}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock size={12} />
              <span>{timeAgo(listing.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
