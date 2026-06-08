'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Clock } from 'lucide-react'
import { Listing } from '@/types'
import Badge from '@/components/ui/Badge'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "À l'instant"
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days}j`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/annonces/${listing.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-orange-primary transition-colors"
          onClick={e => e.preventDefault()}
        >
          <Heart size={15} className="text-gray-400" />
        </button>
        <div className="absolute top-2.5 left-2.5">
          <Badge>{listing.category}</Badge>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-navy text-sm line-clamp-2 leading-snug">{listing.title}</h3>
        <div className="font-bold text-navy text-base">
          {listing.price !== null ? `${listing.price} €` : <span className="text-green-600">Gratuit</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin size={11} />
            <span>{listing.neighborhood}, {listing.city}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={11} />
            <span>{timeAgo(listing.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
