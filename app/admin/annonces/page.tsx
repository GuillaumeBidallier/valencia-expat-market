import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminAnnoncesClient from './AdminAnnoncesClient'

export default async function AdminAnnoncesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const siteId = await getAdminSiteId()

  const [
    pendingListings, settings,
    pendingCount, activeCount, rejectedCount, soldCount, expiredCount, reportedCount, totalCount,
  ] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING', siteId },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    }),
    prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', autoPublish: true },
      update: {},
    }),
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { status: 'ACTIVE', siteId } }),
    prisma.listing.count({ where: { status: 'REJECTED', siteId } }),
    prisma.listing.count({ where: { status: 'SOLD', siteId } }),
    prisma.listing.count({ where: { status: 'EXPIRED', siteId } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
    prisma.listing.count({ where: { status: { not: 'DELETED' }, siteId } }),
  ])

  const serialized = pendingListings.map(l => ({
    id: l.id,
    title: l.title,
    categorySlug: l.categorySlug,
    neighborhood: l.neighborhood,
    price: l.price,
    publishedAt: l.publishedAt.toISOString(),
    status: l.status as string,
    images: l.images.map(i => ({ url: i.url })),
    user: { id: l.user.id, name: l.user.name, email: l.user.email, blocked: l.user.blocked },
  }))

  return (
    <AdminAnnoncesClient
      initialListings={serialized}
      initialTotal={pendingCount}
      autoPublish={settings.autoPublish}
      counts={{
        TOTAL: totalCount,
        PENDING: pendingCount,
        ACTIVE: activeCount,
        REJECTED: rejectedCount,
        SOLD: soldCount,
        EXPIRED: expiredCount,
        REPORTED: reportedCount,
      }}
    />
  )
}
