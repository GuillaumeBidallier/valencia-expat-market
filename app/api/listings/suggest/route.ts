import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const suggestions = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      title: { contains: q, mode: 'insensitive' },
    },
    select: { id: true, title: true },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })

  return NextResponse.json(suggestions)
}
