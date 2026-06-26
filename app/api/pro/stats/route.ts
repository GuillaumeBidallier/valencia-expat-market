import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true, tier: true },
  })

  if (!pro) return NextResponse.json({ error: 'No professional profile' }, { status: 404 })
  if (pro.tier !== 'PREMIUM_PLUS') return NextResponse.json({ error: 'Premium+ required' }, { status: 403 })

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const clicks = await prisma.proClick.findMany({
    where: { professionalId: pro.id, createdAt: { gte: since } },
    select: { type: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Totals per type
  const totals: Record<string, number> = {}
  for (const c of clicks) {
    totals[c.type] = (totals[c.type] ?? 0) + 1
  }

  // Daily aggregation — pre-fill all 30 days with 0
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const c of clicks) {
    const day = c.createdAt.toISOString().slice(0, 10)
    if (day in dailyMap) dailyMap[day] = (dailyMap[day] ?? 0) + 1
  }

  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  return NextResponse.json({ totals, daily, period: '30d' })
}
