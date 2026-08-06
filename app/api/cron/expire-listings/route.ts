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
  // ACTIVE listings older than 60 days → EXPIRED (still visible to the owner, hidden from search)
  const activeCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  // All listings older than 90 days → permanently deleted, regardless of status (sold or not)
  const deleteCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [expiredPending, expiredActive, deletedOld, revertedGiftedTiers] = await Promise.all([
    prisma.listing.updateMany({
      where: { status: 'PENDING', publishedAt: { lt: pendingCutoff } },
      data: { status: 'EXPIRED' },
    }),
    prisma.listing.updateMany({
      where: { status: 'ACTIVE', publishedAt: { lt: activeCutoff } },
      data: { status: 'EXPIRED' },
    }),
    // Images, favorites, messages and reports cascade automatically (onDelete: Cascade in schema)
    prisma.listing.deleteMany({
      where: { publishedAt: { lt: deleteCutoff } },
    }),
    // Admin-gifted tiers (commercial gesture) revert to FREE once expired — unless a real
    // Stripe subscription is independently keeping the account active.
    prisma.professional.updateMany({
      where: { giftTierExpiresAt: { lt: now }, NOT: { subscriptionStatus: 'active' } },
      data: { tier: 'FREE', giftTierExpiresAt: null },
    }),
  ])

  return NextResponse.json({
    ok: true,
    expiredPending: expiredPending.count,
    expiredActive: expiredActive.count,
    deletedOld: deletedOld.count,
    revertedGiftedTiers: revertedGiftedTiers.count,
    ranAt: now.toISOString(),
  })
}
