import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminParefeuClient from './AdminParefeuClient'

export default async function AdminParefeuPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [blocked, blockedThisMonth, byCategory] = await Promise.all([
    prisma.listing.findMany({
      where: { blockedReason: { not: null } },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.listing.count({
      where: { blockedReason: { not: null }, publishedAt: { gte: monthStart } },
    }),
    prisma.listing.groupBy({
      by: ['blockedReason'],
      where: { blockedReason: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  const serialized = blocked.map(l => ({
    id: l.id,
    title: l.title,
    description: l.description,
    categorySlug: l.categorySlug,
    neighborhood: l.neighborhood,
    price: l.price,
    publishedAt: l.publishedAt.toISOString(),
    status: l.status as string,
    blockedReason: l.blockedReason!,
    images: l.images.map(i => ({ url: i.url })),
    user: l.user,
  }))

  return (
    <AdminParefeuClient
      initialListings={serialized}
      blockedThisMonth={blockedThisMonth}
      byCategory={byCategory.map(r => ({ category: r.blockedReason ?? 'Inconnu', count: r._count.id }))}
    />
  )
}
