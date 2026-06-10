import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const listings = await prisma.listing.findMany({
    where: { reports: { some: {} }, status: { not: 'DELETED' } },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      user: { select: { id: true, name: true, email: true, blocked: true } },
      reports: { orderBy: { createdAt: 'desc' } },
      _count: { select: { reports: true } },
    },
    orderBy: { reports: { _count: 'desc' } },
  })

  return NextResponse.json(listings)
}
