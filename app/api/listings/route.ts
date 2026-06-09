import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

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

  const listing = await prisma.listing.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json(listing, { status: 201 })
}
