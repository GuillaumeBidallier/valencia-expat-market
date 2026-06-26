import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Settings2 } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* Header */}
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Tableau de bord
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Paramètres du site</h1>
              <p className="text-sm text-white/40 mt-0.5">Gérez le contenu et la configuration de 1000Click</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
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
    </div>
  )
}
