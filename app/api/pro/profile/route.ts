import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'
import { getCurrentSiteId } from '@/lib/site'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let i = 2
  while (await prisma.professional.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

const createSchema = z.object({
  name:        z.string().min(2).max(100),
  category:    z.string().min(1),
  city:        z.string().min(1),
  description: z.string().max(1000).optional().nullable(),
  phone:       z.string().optional().nullable(),
  whatsapp:    z.string().optional().nullable(),
  website:     z.string().url().optional().nullable().or(z.literal('')),
  phoneHidden: z.boolean().optional().default(false),
  zones:       z.array(z.string()).optional().default([]),
  plan:        z.enum(['premium_monthly', 'premium_annual', 'premium_plus_monthly', 'premium_plus_annual']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const existing = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (existing) return NextResponse.json({ error: 'Fiche déjà existante' }, { status: 409 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { plan, ...fields } = parsed.data
  if (!PRO_PLANS[plan as ProPlan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  // Validate env var BEFORE any DB write — getPriceId throws if the env var is missing
  let priceId: string
  try {
    priceId = getPriceId(plan as ProPlan)
  } catch {
    return NextResponse.json({ error: 'Configuration Stripe manquante.' }, { status: 500 })
  }

  const { zones, ...restFields } = fields
  const slug = await uniqueSlug(slugify(fields.name))
  const siteId = await getCurrentSiteId()

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { publiclyLive: true } })
  if (!site?.publiclyLive) {
    return NextResponse.json({ error: 'Ce site n\'est pas encore ouvert au public.' }, { status: 403 })
  }

  const pro = await prisma.professional.create({
    data: {
      ...restFields,
      slug,
      userId: session.user.id,
      siteId,
      tier: 'FREE',
      zones: { create: zones.map(zone => ({ zone })) },
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  type CheckoutParams = Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0]
  const checkoutParams: CheckoutParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/mon-compte?subscription=success`,
    cancel_url:  `${baseUrl}/mon-compte/profil-pro`,
    locale:      'fr',
    customer_email: session.user.email ?? undefined,
    metadata: { professionalId: pro.id, plan },
  }

  let checkout
  try {
    checkout = await getStripe().checkout.sessions.create(checkoutParams)
  } catch {
    await prisma.professional.delete({ where: { id: pro.id } })
    return NextResponse.json({ error: 'Erreur Stripe, veuillez réessayer.' }, { status: 502 })
  }

  if (!checkout.url) {
    await prisma.professional.delete({ where: { id: pro.id } })
    return NextResponse.json({ error: 'URL de paiement introuvable.' }, { status: 502 })
  }

  return NextResponse.json({ checkoutUrl: checkout.url })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proRow = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  if (!proRow) return NextResponse.json(null)
  return NextResponse.json({ ...proRow, photos: proRow.photos.map(p => p.url), zones: proRow.zones.map(z => z.zone) })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile linked' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'phone', 'whatsapp', 'website', 'city', 'logo', 'banner', 'phoneHidden'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  // photos/zones are relations now — the client always sends the full desired
  // array (both the zones-edit form and the photo-removal flow in
  // ProDashboardClient.tsx replace the whole list), so replace-all is correct.
  if ('zones' in body && Array.isArray(body.zones)) {
    await prisma.professionalZone.deleteMany({ where: { professionalId: pro.id } })
    if (body.zones.length > 0) {
      await prisma.professionalZone.createMany({
        data: (body.zones as string[]).map(zone => ({ professionalId: pro.id, zone })),
      })
    }
  }
  if ('photos' in body && Array.isArray(body.photos)) {
    await prisma.professionalPhoto.deleteMany({ where: { professionalId: pro.id } })
    if (body.photos.length > 0) {
      await prisma.professionalPhoto.createMany({
        data: (body.photos as string[]).map((url, order) => ({ professionalId: pro.id, url, order })),
      })
    }
  }

  const updatedRow = await prisma.professional.update({
    where: { id: pro.id },
    data,
    include: { photos: { orderBy: { order: 'asc' } }, zones: true },
  })
  return NextResponse.json({ ...updatedRow, photos: updatedRow.photos.map(p => p.url), zones: updatedRow.zones.map(z => z.zone) })
}
