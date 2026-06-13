import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { neighborhoodCoords } from '@/lib/neighborhoods'
import { checkFirewall } from '@/lib/content-firewall'
import { sendAdminNewListingEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? undefined
  const cat = searchParams.get('cat') ?? undefined
  const ville = searchParams.get('ville') ?? undefined
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const where = {
    status: 'ACTIVE' as const,
    ...(cat && { categorySlug: cat }),
    ...(ville && { neighborhood: ville }),
    ...(q && { title: { contains: q, mode: 'insensitive' as const } }),
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { name: true } },
      },
      orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  return NextResponse.json({ listings, total, page, pages: Math.ceil(total / limit) })
}

const createSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().nullable(),
  categorySlug: z.string().min(1),
  city: z.string().min(1),
  neighborhood: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  // ── Firewall check (runs regardless of auto-publish setting) ──────────────────
  const fw = checkFirewall(parsed.data.title, parsed.data.description)
  if (fw.blocked) {
    return NextResponse.json(
      { error: 'FIREWALL_BLOCKED', category: fw.category, message: fw.reason },
      { status: 422 },
    )
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  const autoPublish = settings?.autoPublish ?? true

  const fallback = neighborhoodCoords[parsed.data.neighborhood] ?? neighborhoodCoords['Valencia']
  const lat = parsed.data.lat ?? fallback.lat
  const lng = parsed.data.lng ?? fallback.lng

  const { lat: _lat, lng: _lng, ...listingData } = parsed.data
  void _lat; void _lng

  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      userId: session.user.id,
      lat,
      lng,
      status: autoPublish ? 'ACTIVE' : 'PENDING',
    },
  })

  // Notify admin on every new listing (PENDING needs moderation, ACTIVE is FYI)
  const submitter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
  if (submitter) {
    sendAdminNewListingEmail({
      listingTitle: listing.title,
      listingId: listing.id,
      userName: submitter.name,
      userEmail: submitter.email,
    }).catch(() => {})
  }

  return NextResponse.json({ ...listing, pendingReview: !autoPublish }, { status: 201 })
}
