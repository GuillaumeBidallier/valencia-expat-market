import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category     = searchParams.get('category')     ?? undefined
  const neighborhood = searchParams.get('neighborhood') ?? undefined
  const count        = Math.min(8, parseInt(searchParams.get('count') ?? '4'))

  // Géolocalisation IP : Vercel injecte x-vercel-ip-city automatiquement (gratuit, sans API externe)
  const rawCity = req.headers.get('x-vercel-ip-city')
  const userCity = rawCity ? decodeURIComponent(rawCity) : undefined

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

  // 2. Pros proches de la ville de l'utilisateur (géoloc IP — évite les doublons avec le quartier de l'annonce)
  const cityMatched = (userCity && userCity !== neighborhood)
    ? await prisma.professional.findMany({
        where: { ...activeFilter, zones: { has: userCity }, id: { notIn: exclude1 } },
        orderBy: baseOrder,
        take: count - geoMatched.length,
      })
    : []

  const afterGeo = [...geoMatched, ...cityMatched]
  if (afterGeo.length >= count) return NextResponse.json(afterGeo.slice(0, count))

  const exclude2 = afterGeo.map(p => p.id)

  // 3. Pros de la même catégorie (sans doublon)
  const catMatched = category
    ? await prisma.professional.findMany({
        where: { ...activeFilter, category, id: { notIn: exclude2 } },
        orderBy: baseOrder,
        take: count - afterGeo.length,
      })
    : []

  const combined = [...afterGeo, ...catMatched]
  if (combined.length >= count) return NextResponse.json(combined.slice(0, count))

  // 4. Compléter avec n'importe quel pro premium
  const exclude3 = combined.map(p => p.id)
  const extras = await prisma.professional.findMany({
    where: { ...activeFilter, id: { notIn: exclude3 } },
    orderBy: baseOrder,
    take: count - combined.length,
  })

  return NextResponse.json([...combined, ...extras])
}
