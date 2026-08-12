import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId, listActiveSites } from '@/lib/site'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [sites, siteId] = await Promise.all([listActiveSites(), getAdminSiteId()])

  const [pendingCount, reportedListingsCount, firewallBlockedCount] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId } }),
  ])

  const adminName = (session.user as { name?: string }).name ?? 'Admin'

  return (
    <AdminShell
      adminName={adminName}
      notificationCount={pendingCount + reportedListingsCount + firewallBlockedCount}
      sites={sites}
      currentSiteId={siteId}
    >
      {children}
    </AdminShell>
  )
}
