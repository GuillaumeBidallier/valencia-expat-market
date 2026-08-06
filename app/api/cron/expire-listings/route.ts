import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Called by Vercel Cron — protected by CRON_SECRET
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // PENDING listings older than 7 days → EXPIRED
  const pendingCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  // ACTIVE listings older than 60 days → EXPIRED
  const activeCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [expiredPending, expiredActive] = await Promise.all([
    prisma.listing.updateMany({
      where: { status: 'PENDING', publishedAt: { lt: pendingCutoff } },
      data: { status: 'EXPIRED' },
    }),
    prisma.listing.updateMany({
      where: { status: 'ACTIVE', publishedAt: { lt: activeCutoff } },
      data: { status: 'EXPIRED' },
    }),
  ])

  return NextResponse.json({
    ok: true,
    expiredPending: expiredPending.count,
    expiredActive: expiredActive.count,
    ranAt: now.toISOString(),
  })
}
