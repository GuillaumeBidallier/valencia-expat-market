import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AccountClient from './AccountClient'

export default async function MonComptePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')
  const userId = session.user.id

  const [dbUser, listings, favorites, pro] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, role: true, showPhone: true, showWhatsapp: true },
    }),
    prisma.listing.findMany({
      where: { userId, status: { not: 'DELETED' } },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        _count: { select: { favorites: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.professional.findUnique({
      where: { userId },
      select: {
        slug: true, name: true, tier: true,
        subscriptionStatus: true, subscriptionPeriod: true,
        subscriptionCurrentPeriodEnd: true,
      },
    }),
  ])

  if (!dbUser) redirect('/connexion')

  return (
    <AccountClient
      proProfile={pro ? {
        slug: pro.slug,
        name: pro.name,
        tier: pro.tier,
        subscriptionStatus: pro.subscriptionStatus,
        subscriptionPeriod: pro.subscriptionPeriod,
        subscriptionCurrentPeriodEnd: pro.subscriptionCurrentPeriodEnd?.toISOString() ?? null,
      } : null}
      user={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        createdAt: dbUser.createdAt.toISOString(),
        role: dbUser.role,
        showPhone: dbUser.showPhone,
        showWhatsapp: dbUser.showWhatsapp,
      }}
      initialListings={listings.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price ?? null,
        city: l.city,
        status: l.status as 'ACTIVE' | 'SOLD' | 'EXPIRED',
        publishedAt: l.publishedAt.toISOString(),
        image: l.images[0]?.url ?? null,
        views: l.views,
        favoritesCount: l._count.favorites,
      }))}
      initialFavorites={favorites
        .filter(f => f.listing.status !== 'DELETED')
        .map(f => ({
          id: f.id,
          listingId: f.listingId,
          listing: {
            id: f.listing.id,
            title: f.listing.title,
            price: f.listing.price ?? null,
            city: f.listing.city,
            status: f.listing.status,
            image: f.listing.images[0]?.url ?? null,
            sellerName: f.listing.user.name,
          },
        }))}
    />
  )
}
