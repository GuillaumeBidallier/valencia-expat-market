import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const siteId = await getAdminSiteId()

  const [users, total, TOTAL, USER, PREMIUM, ADMIN, BLOCKED, PROS] = await Promise.all([
    prisma.user.findMany({
      where: { siteId },
      select: {
        id: true, name: true, email: true, role: true,
        blocked: true, createdAt: true,
        _count: { select: { listings: true, favorites: true, sentMessages: true } },
        professional: { select: { id: true, verified: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, role: 'USER' } }),
    prisma.user.count({ where: { siteId, role: 'PREMIUM' } }),
    prisma.user.count({ where: { siteId, role: 'ADMIN' } }),
    prisma.user.count({ where: { siteId, blocked: true } }),
    prisma.user.count({ where: { siteId, professional: { isNot: null } } }),
  ])

  return (
    <AdminUsersClient
      initialUsers={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      initialTotal={total}
      currentAdminId={(session!.user as { id: string }).id}
      counts={{ TOTAL, USER, PREMIUM, ADMIN, BLOCKED, PROS }}
    />
  )
}
