import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'

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

  const slug = await uniqueSlug(slugify(fields.name))
  const pro = await prisma.professional.create({
    data: { ...fields, slug, userId: session.user.id, tier: 'FREE' },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  type CheckoutParams = Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0]
  const checkoutParams: CheckoutParams = {
    mode: 'subscription',
    line_items: [{ price: getPriceId(plan as ProPlan), quantity: 1 }],
    success_url: `${baseUrl}/mon-compte?subscription=success`,
    cancel_url:  `${baseUrl}/publicite`,
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

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(pro ?? null)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile linked' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'phone', 'whatsapp', 'website', 'city', 'zones', 'logo', 'banner', 'photos', 'phoneHidden'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const updated = await prisma.professional.update({
    where: { id: pro.id },
    data,
  })
  return NextResponse.json(updated)
}
