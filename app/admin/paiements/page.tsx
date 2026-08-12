import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminSiteId } from '@/lib/site'
import AdminPaiementsClient from './AdminPaiementsClient'

const TIER_PRICE_YEAR: Record<string, number> = {
  FREE: 0, PREMIUM: 99, PREMIUM_PLUS: 299, VIP: 499,
}

export default async function AdminPaiementsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const siteId = await getAdminSiteId()

  const [tierCounts, payingPros] = await Promise.all([
    prisma.professional.groupBy({ by: ['tier'], where: { siteId }, _count: true }),
    prisma.professional.findMany({
      where: { siteId, tier: { not: 'FREE' } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, name: true, slug: true, logo: true, category: true, city: true,
        verified: true, tier: true,
        subscriptionStatus: true, subscriptionPeriod: true, subscriptionCurrentPeriodEnd: true,
        giftTierExpiresAt: true, stripeSubscriptionId: true,
      },
    }),
  ])

  const countByTier = (tier: string) => tierCounts.find(t => t.tier === tier)?._count ?? 0

  const arr = payingPros
    .filter(p => p.stripeSubscriptionId)
    .reduce((sum, p) => sum + (TIER_PRICE_YEAR[p.tier] ?? 0), 0)

  const serialized = payingPros.map(p => ({
    ...p,
    subscriptionCurrentPeriodEnd: p.subscriptionCurrentPeriodEnd?.toISOString() ?? null,
    giftTierExpiresAt: p.giftTierExpiresAt?.toISOString() ?? null,
  }))

  return (
    <AdminPaiementsClient
      initialPros={serialized}
      counts={{
        PREMIUM: countByTier('PREMIUM'),
        PREMIUM_PLUS: countByTier('PREMIUM_PLUS'),
        VIP: countByTier('VIP'),
        TOTAL_PAYING: payingPros.length,
      }}
      arr={arr}
    />
  )
}
