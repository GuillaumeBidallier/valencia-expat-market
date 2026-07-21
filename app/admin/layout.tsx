import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAdminSiteId, listActiveSites } from '@/lib/site'
import AdminSiteSelector from '@/components/admin/AdminSiteSelector'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [sites, currentSiteId] = await Promise.all([listActiveSites(), getAdminSiteId()])

  return (
    <div>
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/admin" className="font-black text-sm tracking-tight hover:text-white/80 transition-colors">
            1000Click Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin/sites" className="text-xs font-semibold text-white/60 hover:text-white transition-colors">
              Sites &amp; Pays
            </Link>
            <AdminSiteSelector sites={sites} currentSiteId={currentSiteId} />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
