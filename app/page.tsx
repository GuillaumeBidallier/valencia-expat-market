export const dynamic = 'force-dynamic'

import HomeContent from '@/components/home/HomeContent'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export default async function HomePage() {
  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featured: any[] = []
  let featuredPros: Awaited<ReturnType<typeof prisma.professional.findMany>> = []
  let homeFavIds: string[] = []

  try {
    const [rows, prosRows, favRows] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        include: { images: { take: 1, orderBy: { order: 'asc' } } },
        orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }],
        take: 8,
      }),
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
      session?.user?.id
        ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { listingId: true } })
        : Promise.resolve([]),
    ])
    featured = rows.map(l => ({
      ...l,
      boostExpiresAt: l.boostExpiresAt?.toISOString() ?? null,
      featuredAt: l.featuredAt?.toISOString() ?? null,
      publishedAt: l.publishedAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }))
    featuredPros = prosRows
    homeFavIds = favRows.map(f => f.listingId)
  } catch (e) {
    console.error('[HomePage] DB error:', e)
  }

  return (
    <HomeContent
      featured={featured}
      featuredPros={featuredPros}
      homeFavIds={homeFavIds}
    />
  )
}
