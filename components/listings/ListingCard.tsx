'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin } from 'lucide-react'
import { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
  badge?: 'une' | 'nouveau'
}

export default function ListingCard({ listing, badge }: ListingCardProps) {
  return (
    <Link href={`/annonces/${listing.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-indigo-primary/30 transition-all duration-200 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        {badge && (
          <div className={`absolute top-2.5 left-2.5 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide ${badge === 'une' ? 'bg-orange-primary' : 'bg-indigo-primary'}`}>
            {badge === 'une' ? 'À la une' : 'Nouveau'}
          </div>
        )}
        <button
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:text-orange-primary transition-colors"
          onClick={e => e.preventDefault()}
        >
          <Heart size={13} className="text-gray-400" />
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-navy text-sm line-clamp-2 leading-snug">{listing.title}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <MapPin size={10} />
          <span>{listing.neighborhood}</span>
        </div>
        <div className="font-black text-navy text-base mt-1">
          {listing.price !== null ? `${listing.price} €` : <span className="text-green-600 font-bold text-sm">Gratuit</span>}
        </div>
      </div>
    </Link>
  )
}
