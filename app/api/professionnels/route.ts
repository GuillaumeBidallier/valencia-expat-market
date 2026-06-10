import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat  = searchParams.get('cat')  ?? undefined
  const city = searchParams.get('city') ?? undefined

  const pros = await prisma.professional.findMany({
    where: {
      ...(cat  && { category: cat }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    },
    orderBy: [
      { tier: 'desc' },
      { featured: 'desc' },
      { name: 'asc' },
    ],
  })

  return NextResponse.json(pros)
}
