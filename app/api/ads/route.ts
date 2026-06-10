import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category') ?? undefined
  const count    = Math.min(8, parseInt(searchParams.get('count') ?? '4'))

  // 1. Pros de la même catégorie d'abord (Premium+ en tête)
  const matched = category
    ? await prisma.professional.findMany({
        where: { category, tier: { in: ['PREMIUM', 'PREMIUM_PLUS'] } },
        orderBy: [{ tier: 'desc' }, { featured: 'desc' }, { name: 'asc' }],
        take: count,
      })
    : []

  // 2. Compléter avec n'importe quel pro premium si pas assez
  if (matched.length < count) {
    const excludeIds = matched.map(p => p.id)
    const extras = await prisma.professional.findMany({
      where: {
        id:   { notIn: excludeIds },
        tier: { in: ['PREMIUM', 'PREMIUM_PLUS'] },
      },
      orderBy: [{ tier: 'desc' }, { featured: 'desc' }],
      take: count - matched.length,
    })
    return NextResponse.json([...matched, ...extras])
  }

  return NextResponse.json(matched)
}
