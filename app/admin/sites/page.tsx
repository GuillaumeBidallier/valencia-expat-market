import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminSitesClient from './AdminSitesClient'

export default async function AdminSitesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } })

  return (
    <AdminSitesClient
      initialSites={sites.map(s => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() }))}
    />
  )
}
