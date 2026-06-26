import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const DEFAULT_SETTINGS = {
  id: 'default',
  autoPublish: true,
  heroImages: [],
  announcementText: null,
  announcementEnabled: false,
  contactEmail: null,
  maintenanceMode: false,
}

async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: DEFAULT_SETTINGS,
    update: {},
  })
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    autoPublish,
    heroImages,
    announcementText,
    announcementEnabled,
    contactEmail,
    maintenanceMode,
  } = body

  const data: Record<string, unknown> = {}
  if (typeof autoPublish === 'boolean') data.autoPublish = autoPublish
  if (Array.isArray(heroImages)) data.heroImages = heroImages
  if (announcementText !== undefined) data.announcementText = announcementText || null
  if (typeof announcementEnabled === 'boolean') data.announcementEnabled = announcementEnabled
  if (contactEmail !== undefined) data.contactEmail = contactEmail || null
  if (typeof maintenanceMode === 'boolean') data.maintenanceMode = maintenanceMode

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { ...DEFAULT_SETTINGS, ...data },
    update: data,
  })

  return NextResponse.json(settings)
}
