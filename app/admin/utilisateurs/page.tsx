import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const siteId = await getAdminSiteId()
  const users = await prisma.user.findMany({
    where: { siteId },
    select: {
      id: true, name: true, email: true, role: true,
      blocked: true, createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminUsersClient
      initialUsers={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      currentAdminId={(session!.user as { id: string }).id}
    />
  )
}
