import { Listing } from '@/types'
import ListingCard from './ListingCard'

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Aucune annonce trouvée.</p>
        <p className="text-sm mt-1">Essayez d'autres filtres.</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
