import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

const VALID_STATUSES = ['PENDING', 'ACTIVE', 'REJECTED', 'SOLD', 'EXPIRED'] as const

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const statusParam = searchParams.get('status') ?? 'PENDING'
  const status = (VALID_STATUSES as readonly string[]).includes(statusParam) ? statusParam : 'PENDING'
  const q      = searchParams.get('q') ?? ''
  const cat    = searchParams.get('cat') ?? ''
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const siteId = await getAdminSiteId()

  const where = {
    status: status as 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED',
    siteId,
    ...(q && { title: { contains: q } }),
    ...(cat && { categorySlug: cat }),
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true, blocked: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  return NextResponse.json({ listings, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
}
