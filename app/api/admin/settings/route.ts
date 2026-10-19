import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { SITE_SETTINGS_TAG } from '@/lib/hero-slides'
import { normalizeSocialUrl, normalizeWhatsapp } from '@/lib/social-links'

const DEFAULT_SETTINGS = {
  id: 'default',
  autoPublish: true,
  heroImages: [],
  announcementText: null,
  announcementEnabled: false,
  contactEmail: null,
  maintenanceMode: false,
  facebookUrl: null,
  instagramUrl: null,
  whatsappNumber: null,
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
    facebookUrl,
    instagramUrl,
    whatsappNumber,
  } = body

  const data: Record<string, unknown> = {}
  if (typeof autoPublish === 'boolean') data.autoPublish = autoPublish
  if (Array.isArray(heroImages)) data.heroImages = heroImages
  if (announcementText !== undefined) data.announcementText = announcementText || null
  if (typeof announcementEnabled === 'boolean') data.announcementEnabled = announcementEnabled
  if (contactEmail !== undefined) data.contactEmail = contactEmail || null
  if (typeof maintenanceMode === 'boolean') data.maintenanceMode = maintenanceMode

  const social = [
    ['facebookUrl', facebookUrl, normalizeSocialUrl, 'Le lien Facebook'],
    ['instagramUrl', instagramUrl, normalizeSocialUrl, 'Le lien Instagram'],
    ['whatsappNumber', whatsappNumber, normalizeWhatsapp, "Le numéro WhatsApp (avec l'indicatif du pays, par exemple +32)"],
  ] as const
  for (const [field, raw, normalize, label] of social) {
    if (raw === undefined) continue
    const value = normalize(raw)
    if (value === 'invalid') {
      return NextResponse.json({ error: `${label} n'est pas valide.` }, { status: 400 })
    }
    data[field] = value
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { ...DEFAULT_SETTINGS, ...data },
    update: data,
  })

  // Expire immediately: an admin saving here expects to see the change on the
  // site right away, not after the 60s revalidate window.
  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 })

  return NextResponse.json(settings)
}
