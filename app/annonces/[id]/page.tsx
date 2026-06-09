import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ListingDetailClient from './ListingDetailClient'

type Props = { params: Promise<{ id: string }> }

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params

  const raw = await prisma.listing.findUnique({
    where: { id, status: { not: 'DELETED' } },
    include: {
      images: { orderBy: { order: 'asc' } },
      user: { select: { name: true } },
    },
  })

  if (!raw) notFound()

  const listing = {
    ...raw,
    price: raw.price ?? null,
    boostExpiresAt: raw.boostExpiresAt?.toISOString() ?? null,
    featuredAt: raw.featuredAt?.toISOString() ?? null,
    publishedAt: raw.publishedAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }

  return <ListingDetailClient listing={listing} />
}
