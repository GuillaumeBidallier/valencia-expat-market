import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getCurrentSiteId } from '@/lib/site'
import ListingDetailClient from './ListingDetailClient'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.1000click.com').replace(/\/$/, '')

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id, status: { not: 'DELETED' } },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
  })
  if (!listing) return { title: 'Annonce introuvable — 1000Click' }

  const title = `${listing.title} — 1000Click`
  const rawDesc = listing.description?.trim() ?? ''
  const description = rawDesc.length > 0
    ? rawDesc.slice(0, 155) + (rawDesc.length > 155 ? '…' : '')
    : `${listing.title} disponible sur 1000Click, petites annonces en Belgique.`
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
      siteName: '1000Click',
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
        user: { select: { name: true, showPhone: true, showWhatsapp: true, professional: { select: { verified: true } } } },
      },
    }),
    session?.user?.id
      ? prisma.favorite.findUnique({
          where: { userId_listingId: { userId: session.user.id, listingId: id } },
        })
      : null,
  ])

  if (!raw) notFound()

  const siteId = await getCurrentSiteId()
  const categoryRecord = await prisma.category.findUnique({
    where: { siteId_slug: { siteId, slug: raw.categorySlug } },
    include: {
      parent: {
        select: {
          slug: true, label: true, icon: true,
          parent: { select: { slug: true, label: true, icon: true } },
        },
      },
    },
  })
  // Top-level ancestor (e.g. "Immobilier" for a leaf 3 levels deep like Immobilier > Vente > Maisons) —
  // used for both theming and the breadcrumb, which skips intermediate levels.
  const rootCategory = categoryRecord?.parent?.parent ?? categoryRecord?.parent ?? categoryRecord ?? null

  const listing = {
    ...raw,
    price: raw.price ?? null,
    boostExpiresAt: raw.boostExpiresAt?.toISOString() ?? null,
    featuredAt: raw.featuredAt?.toISOString() ?? null,
    publishedAt: raw.publishedAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    attributes: raw.attributes as Record<string, string | number | string[]> | null,
  }

  const isVehicules = categoryRecord?.slug === 'vehicules' || rootCategory?.slug === 'vehicules'
  const isImmobilier = categoryRecord?.slug === 'immobilier' || rootCategory?.slug === 'immobilier'
  const sellerVerified = raw.user?.professional?.verified ?? false

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': listing.price !== null ? 'Product' : 'Article',
    name: listing.title,
    description: listing.description ?? undefined,
    image: listing.images.map(i => i.url),
    url: `${BASE}/annonces/${id}`,
    offers: listing.price !== null ? {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${BASE}/annonces/${id}`,
    } : undefined,
  }

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Annonces', item: `${BASE}/annonces` },
      ...(categoryRecord && rootCategory && rootCategory.slug !== categoryRecord.slug ? [
        { '@type': 'ListItem', position: 3, name: rootCategory.label, item: `${BASE}/annonces?cat=${rootCategory.slug}` },
        { '@type': 'ListItem', position: 4, name: categoryRecord.label, item: `${BASE}/annonces?cat=${categoryRecord.slug}` },
      ] : categoryRecord ? [
        { '@type': 'ListItem', position: 3, name: categoryRecord.label, item: `${BASE}/annonces?cat=${categoryRecord.slug}` },
      ] : []),
      { '@type': 'ListItem', position: categoryRecord ? (rootCategory && rootCategory.slug !== categoryRecord.slug ? 5 : 4) : 3, name: listing.title, item: `${BASE}/annonces/${id}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <ListingDetailClient
        listing={listing}
        isFavorited={!!favorite}
        categoryInfo={categoryRecord ? {
          label: categoryRecord.label,
          slug: categoryRecord.slug,
          icon: categoryRecord.icon,
          parent: rootCategory && rootCategory.slug !== categoryRecord.slug
            ? { slug: rootCategory.slug, label: rootCategory.label, icon: rootCategory.icon }
            : null,
        } : null}
        vehicules={isVehicules}
        immobilier={isImmobilier}
        sellerVerified={sellerVerified}
      />
    </>
  )
}
