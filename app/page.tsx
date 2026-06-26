export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { unstable_cache } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import HomeContent from '@/components/home/HomeContent'

export const metadata: Metadata = {
  title: '1000Click — Petites annonces entre expatriés en Espagne',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés en Espagne. La marketplace des expatriés francophones.',
  alternates: { canonical: '/' },
}

const getFeaturedListings = unstable_cache(
  async () => {
    const rows = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }],
      take: 8,
    })
    return rows.map(l => ({
      ...l,
      boostExpiresAt: l.boostExpiresAt?.toISOString() ?? null,
      featuredAt: l.featuredAt?.toISOString() ?? null,
      publishedAt: l.publishedAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }))
  },
  ['home-featured-listings'],
  { revalidate: 60 }
)

const getFeaturedPros = unstable_cache(
  async () =>
    prisma.professional.findMany({
      where: {
        OR: [
          { recommended: true },
          { tier: { in: ['PREMIUM', 'PREMIUM_PLUS'] } },
        ],
      },
      orderBy: [{ recommended: 'desc' }, { tier: 'desc' }, { featured: 'desc' }, { name: 'asc' }],
      take: 6,
    }),
  ['home-featured-pros'],
  { revalidate: 60 }
)

export default async function HomePage() {
  preload('/valencia-hero.jpg', { as: 'image', fetchPriority: 'high' })

  const session = await auth()

  const [featured, featuredPros, favRows] = await Promise.all([
    getFeaturedListings().catch(() => []),
    getFeaturedPros().catch(() => []),
    session?.user?.id
      ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { listingId: true } })
      : Promise.resolve([]),
  ])

  return (
    <HomeContent
      featured={featured}
      featuredPros={featuredPros}
      homeFavIds={favRows.map(f => f.listingId)}
    />
  )
}
