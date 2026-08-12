import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminParametresPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      autoPublish: true,
      heroImages: [],
      announcementEnabled: false,
      maintenanceMode: false,
    },
    update: {},
  })

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-navy tracking-tight">Paramètres du site</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gérez le contenu et la configuration de 1000Click.</p>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <SettingsClient
        initialSettings={{
          autoPublish: settings.autoPublish,
          heroImages: Array.isArray(settings.heroImages)
            ? (settings.heroImages as Array<{ src: string; alt: string }>)
            : [],
          announcementText: settings.announcementText ?? '',
          announcementEnabled: settings.announcementEnabled,
          contactEmail: settings.contactEmail ?? '',
          maintenanceMode: settings.maintenanceMode,
        }}
      />
    </div>
  )
}
