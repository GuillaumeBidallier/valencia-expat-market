import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category    = searchParams.get('category')    ?? undefined
  const neighborhood = searchParams.get('neighborhood') ?? undefined
  const count       = Math.min(8, parseInt(searchParams.get('count') ?? '4'))

  const tiers = ['PREMIUM', 'PREMIUM_PLUS'] as ('PREMIUM' | 'PREMIUM_PLUS')[]
  const baseOrder = [{ tier: 'desc' as const }, { featured: 'desc' as const }, { name: 'asc' as const }]
  const activeFilter = {
    tier: { in: tiers },
    subscriptionStatus: 'active',
    subscriptionCurrentPeriodEnd: { gt: new Date() },
  }

  // 1. Pros avec zone correspondant au quartier de l'annonce (Géo Pub)
  const geoMatched = neighborhood
    ? await prisma.professional.findMany({
        where: { ...activeFilter, zones: { has: neighborhood } },
        orderBy: baseOrder,
        take: count,
      })
    : []

  if (geoMatched.length >= count) return NextResponse.json(geoMatched.slice(0, count))

  const exclude1 = geoMatched.map(p => p.id)

  // 2. Pros de la même catégorie (sans doublon)
  const catMatched = category
    ? await prisma.professional.findMany({
        where: { ...activeFilter, category, id: { notIn: exclude1 } },
        orderBy: baseOrder,
        take: count - geoMatched.length,
      })
    : []

  const combined = [...geoMatched, ...catMatched]
  if (combined.length >= count) return NextResponse.json(combined.slice(0, count))

  // 3. Compléter avec n'importe quel pro premium
  const exclude2 = combined.map(p => p.id)
  const extras = await prisma.professional.findMany({
    where: { ...activeFilter, id: { notIn: exclude2 } },
    orderBy: baseOrder,
    take: count - combined.length,
  })

  return NextResponse.json([...combined, ...extras])
}
