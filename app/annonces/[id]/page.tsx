import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import ListingDetailClient from './ListingDetailClient'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id, status: { not: 'DELETED' } },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
  })
  if (!listing) return { title: 'Annonce introuvable — Vendo' }

  const title = `${listing.title} — Vendo`
  const rawDesc = listing.description?.trim() ?? ''
  const description = rawDesc.length > 0
    ? rawDesc.slice(0, 155) + (rawDesc.length > 155 ? '…' : '')
    : `${listing.title} disponible sur Vendo, petites annonces entre expatriés en Espagne.`
  const image = listing.images[0]?.url
  const url = `${BASE}/annonces/${id}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vendo',
      type: 'website',
      locale: 'fr_FR',
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: listing.title }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const [raw, favorite] = await Promise.all([
    prisma.listing.findUnique({
      where: { id, status: { not: 'DELETED' } },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: { select: { name: true } },
      },
    }),
    session?.user?.id
      ? prisma.favorite.findUnique({
          where: { userId_listingId: { userId: session.user.id, listingId: id } },
        })
      : null,
  ])

  if (!raw) notFound()

  const listing = {
    ...raw,
    price: raw.price ?? null,
    boostExpiresAt: raw.boostExpiresAt?.toISOString() ?? null,
    featuredAt: raw.featuredAt?.toISOString() ?? null,
    publishedAt: raw.publishedAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': listing.price !== null ? 'Product' : 'Offer',
    name: listing.title,
    description: listing.description ?? undefined,
    image: listing.images.map(i => i.url),
    url: `${BASE}/annonces/${id}`,
    offers: {
      '@type': 'Offer',
      price: listing.price ?? 0,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${BASE}/annonces/${id}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailClient listing={listing} isFavorited={!!favorite} />
    </>
  )
}
