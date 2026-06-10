import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'PENDING'

  const listings = await prisma.listing.findMany({
    where: { status: status as 'PENDING' | 'ACTIVE' | 'REJECTED' },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      user: { select: { name: true, email: true } },
    },
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json(listings)
}
