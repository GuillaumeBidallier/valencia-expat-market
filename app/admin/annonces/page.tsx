import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminAnnoncesClient from './AdminAnnoncesClient'

export default async function AdminAnnoncesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [pendingListings, settings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', autoPublish: true },
      update: {},
    }),
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

  return <AdminAnnoncesClient initialListings={serialized} autoPublish={settings.autoPublish} />
}
