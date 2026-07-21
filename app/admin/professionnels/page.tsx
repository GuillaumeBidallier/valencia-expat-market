import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminProsClient from './AdminProsClient'

export default async function AdminProsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const siteId = await getAdminSiteId()
  const proRows = await prisma.professional.findMany({
    where: { siteId },
    orderBy: [{ tier: 'desc' }, { name: 'asc' }],
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  const pros = proRows.map(row => ({ ...row, photos: row.photos.map(p => p.url), zones: row.zones.map(z => z.zone) }))

  return <AdminProsClient initialPros={pros} />
}
