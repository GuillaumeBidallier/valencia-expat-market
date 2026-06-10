import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminSignalementsClient from './AdminSignalementsClient'

export default async function AdminSignalementsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const reported = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' } },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      user: { select: { id: true, name: true, email: true, blocked: true } },
      reports: { orderBy: { createdAt: 'desc' } },
      _count: { select: { reports: true } },
    },
    orderBy: { reports: { _count: 'desc' } },
  })

  const serialized = reported.map(l => ({
    id: l.id,
    title: l.title,
    categorySlug: l.categorySlug,
    neighborhood: l.neighborhood,
    price: l.price,
    publishedAt: l.publishedAt.toISOString(),
    status: l.status as string,
    images: l.images.map(i => ({ url: i.url })),
    user: l.user,
    reports: l.reports.map(r => ({ reason: r.reason, createdAt: r.createdAt.toISOString() })),
    reportCount: l._count.reports,
  }))

  return <AdminSignalementsClient initialListings={serialized} />
}
