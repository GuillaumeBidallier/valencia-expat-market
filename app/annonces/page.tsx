import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Listing } from '@/types'
import SearchBar from '@/components/listings/SearchBar'
import type { GeoState } from '@/components/listings/GeoModal'
import ListingRow from '@/components/listings/ListingRow'
import AnnoncesFilters from './AnnoncesFilters'
import AdUnit from '@/components/ads/AdUnit'
import { categories } from '@/lib/categories'
import { haversineKm, boundingBox } from '@/lib/neighborhoods'

const PER_PAGE = 20

type RawListing = Awaited<ReturnType<typeof prisma.listing.findMany<{
  include: { images: { orderBy: { order: 'asc' }; take: 1 } }
}>>>[number]

type ListingWithDist = Listing & { distanceKm?: number }

type Props = {
  searchParams: Promise<{
    q?: string; cat?: string; ville?: string
    priceMin?: string; priceMax?: string; sort?: string; page?: string
    lat?: string; lng?: string; radius?: string; geoLabel?: string
  }>
}

function toListingWithDist(l: RawListing & { images: { id: string; url: string; order: number }[] }, distanceKm?: number): ListingWithDist {
  return {
    ...l,
    publishedAt:    l.publishedAt.toISOString(),
    updatedAt:      l.updatedAt.toISOString(),
    featuredAt:     l.featuredAt?.toISOString()     ?? null,
    boostExpiresAt: l.boostExpiresAt?.toISOString() ?? null,
    images:         l.images,
    distanceKm,
  }
}

async function AnnoncesContent({ searchParams }: Props) {
  const params   = await searchParams
  const q        = params.q        ?? ''
  const cat      = params.cat      ?? ''
  const ville    = params.ville    ?? ''
  const priceMin = params.priceMin ? Number(params.priceMin) : undefined
  const priceMax = params.priceMax ? Number(params.priceMax) : undefined
  const sort     = params.sort     ?? ''
  const page     = Math.max(1, parseInt(params.page ?? '1'))
  const userLat  = params.lat    ? Number(params.lat)    : undefined
  const userLng  = params.lng    ? Number(params.lng)    : undefined
  const radius   = params.radius ? Number(params.radius) : 10
  const geoLabel = params.geoLabel ?? 'Ma position'

  const hasLocation = userLat !== undefined && userLng !== undefined
  const defaultGeo: GeoState | null = hasLocation
    ? { city: geoLabel, lat: userLat!, lng: userLng!, radius }
    : null

  // Build bounding-box pre-filter when searching by position
  const bbox = hasLocation ? boundingBox(userLat!, userLng!, radius) : null

  const where = {
    status: 'ACTIVE' as const,
    ...(cat   && { categorySlug: cat }),
    ...(ville && { neighborhood: ville }),
    ...(q && {
      OR: [
        { title:       { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...((priceMin !== undefined || priceMax !== undefined) && {
      price: {
        ...(priceMin !== undefined && { gte: priceMin }),
        ...(priceMax !== undefined && { lte: priceMax }),
      },
    }),
    ...(bbox && {
      lat: { gte: bbox.latMin, lte: bbox.latMax },
      lng: { gte: bbox.lngMin, lte: bbox.lngMax },
    }),
  }

  const orderByDb =
    sort === 'price_asc'  ? [{ price: { sort: 'asc'  as const, nulls: 'last' as const } }] :
    sort === 'price_desc' ? [{ price: { sort: 'desc' as const, nulls: 'last' as const } }] :
    [{ featuredAt: 'desc' as const }, { publishedAt: 'desc' as const }]

  // When sorting by distance, fetch all from bounding box without skip/take
  const fetchAll = hasLocation && sort === 'distance'

  const [rawListings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: fetchAll ? undefined : orderByDb,
      skip: fetchAll ? undefined : (page - 1) * PER_PAGE,
      take: fetchAll ? undefined : PER_PAGE,
    }),
    prisma.listing.count({ where }),
  ])

  let listings: ListingWithDist[]

  if (hasLocation) {
    // Attach distance + exact Haversine filter (bounding box can overshoot corners)
    const withDist = rawListings
      .map(l => {
        const km = l.lat != null && l.lng != null
          ? haversineKm(userLat!, userLng!, l.lat, l.lng)
          : undefined
        return { l, km }
      })
      .filter(({ km }) => km === undefined || km <= radius)

    if (sort === 'distance') {
      withDist.sort((a, b) => (a.km ?? 999) - (b.km ?? 999))
      const start = (page - 1) * PER_PAGE
      listings = withDist.slice(start, start + PER_PAGE).map(({ l, km }) => toListingWithDist(l, km))
    } else {
      listings = withDist.map(({ l, km }) => toListingWithDist(l, km))
    }
  } else {
    listings = rawListings.map(l => toListingWithDist(l))
  }

  const displayTotal = fetchAll ? listings.length : total
  const pages = Math.ceil((fetchAll ? listings.length : total) / PER_PAGE)

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams()
    if (q)     sp.set('q',     q)
    if (cat)   sp.set('cat',   cat)
    if (ville) sp.set('ville', ville)
    if (priceMin !== undefined) sp.set('priceMin', String(priceMin))
    if (priceMax !== undefined) sp.set('priceMax', String(priceMax))
    if (sort)  sp.set('sort',  sort)
    if (userLat !== undefined) sp.set('lat', String(userLat))
    if (userLng !== undefined) sp.set('lng', String(userLng))
    if (hasLocation) { sp.set('radius', String(radius)); sp.set('geoLabel', geoLabel) }
    if (p > 1) sp.set('page', String(p))
    return `/annonces?${sp.toString()}`
  }

  const activeCat = categories.find(c => c.slug === cat)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar defaultQuery={q} defaultCategory={cat} defaultGeo={defaultGeo} />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-3 lg:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          <Suspense fallback={null}>
            <AnnoncesFilters totalCount={displayTotal} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500">
                <strong className="text-navy">{displayTotal}</strong> annonce{displayTotal !== 1 ? 's' : ''}
                {activeCat && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs bg-orange-soft text-orange-primary px-2 py-0.5 rounded-full font-medium">
                    {activeCat.icon} {activeCat.label}
                  </span>
                )}
                {ville && <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ville}</span>}
                {hasLocation && (
                  <span className="ml-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <MapPin size={10} /> {radius} km autour de vous
                  </span>
                )}
              </span>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-navy text-lg">Aucune annonce trouvée</p>
                <p className="text-sm text-gray-400 mt-1">Essayez d&apos;autres filtres ou un rayon plus grand.</p>
                <Link href="/annonces" className="inline-block mt-4 text-sm text-orange-primary font-semibold hover:underline">
                  Voir toutes les annonces
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {listings.map((listing, i) => (
                    <div key={listing.id}>
                      <ListingRow listing={listing} distanceKm={listing.distanceKm} />
                      {(i + 1) % 6 === 0 && <AdUnit size="banner" seed={i} />}
                    </div>
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {page > 1 && (
                      <Link href={buildUrl(page - 1)} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={14} /> Précédent
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
                        Suivant <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden xl:block shrink-0 sticky top-32">
            <AdUnit size="skyscraper" seed={3} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnnoncesPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement des annonces…</div>
      </div>
    }>
      <AnnoncesContent {...props} />
    </Suspense>
  )
}
