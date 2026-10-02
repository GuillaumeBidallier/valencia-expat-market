import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentSiteId } from '@/lib/site'
import { VEHICLE_ATTRIBUTES } from '@/lib/vehicleAttributes'
import { REAL_ESTATE_ATTRIBUTES } from '@/lib/realEstateAttributes'

/**
 * Real figures for the homepage, counted from the database. Each one is null
 * until it reaches a level worth advertising, and the UI hides null figures.
 * Never replace these with invented numbers.
 */
export interface HomeStats {
  activeListings: number | null
  members: number | null
  cities: number | null
  professionals: number | null
  vehicles: number | null
  vehiclesThisWeek: number | null
  realEstate: number | null
  realEstateThisWeek: number | null
}

const EMPTY: HomeStats = {
  activeListings: null, members: null, cities: null, professionals: null,
  vehicles: null, vehiclesThisWeek: null, realEstate: null, realEstateThisWeek: null,
}

const MIN_COUNT = 20
const MIN_CITIES = 5
const MIN_WEEKLY = 5

const atLeast = (n: number, min: number) => (n >= min ? n : null)

const fetchHomeStats = unstable_cache(
  async (siteId: string): Promise<HomeStats> => {
    const active = { siteId, status: 'ACTIVE' as const }
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const vehicleSlugs = ['vehicules', ...Object.keys(VEHICLE_ATTRIBUTES)]
    const realEstateSlugs = ['immobilier', ...Object.keys(REAL_ESTATE_ATTRIBUTES)]

    const [activeListings, members, cities, professionals, vehicles, vehiclesThisWeek, realEstate, realEstateThisWeek] =
      await Promise.all([
        prisma.listing.count({ where: active }),
        prisma.user.count({ where: { siteId } }),
        prisma.listing.findMany({ where: active, select: { city: true }, distinct: ['city'] }).then(r => r.length),
        prisma.professional.count({ where: { siteId } }),
        prisma.listing.count({ where: { ...active, categorySlug: { in: vehicleSlugs } } }),
        prisma.listing.count({ where: { ...active, categorySlug: { in: vehicleSlugs }, publishedAt: { gte: weekAgo } } }),
        prisma.listing.count({ where: { ...active, categorySlug: { in: realEstateSlugs } } }),
        prisma.listing.count({ where: { ...active, categorySlug: { in: realEstateSlugs }, publishedAt: { gte: weekAgo } } }),
      ])

    return {
      activeListings: atLeast(activeListings, MIN_COUNT),
      members: atLeast(members, MIN_COUNT),
      cities: atLeast(cities, MIN_CITIES),
      professionals: atLeast(professionals, MIN_CITIES),
      vehicles: atLeast(vehicles, MIN_COUNT),
      vehiclesThisWeek: atLeast(vehiclesThisWeek, MIN_WEEKLY),
      realEstate: atLeast(realEstate, MIN_COUNT),
      realEstateThisWeek: atLeast(realEstateThisWeek, MIN_WEEKLY),
    }
  },
  ['home-stats'],
  { revalidate: 600 }
)

/**
 * Homepage figures for the current site. Falls back to "nothing to show" if
 * the DB is unreachable — the homepage must still render. Server only.
 */
export async function getHomeStats(): Promise<HomeStats> {
  try {
    return await fetchHomeStats(await getCurrentSiteId())
  } catch {
    return EMPTY
  }
}
