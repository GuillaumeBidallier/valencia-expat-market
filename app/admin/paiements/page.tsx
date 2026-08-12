import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { getAdminSiteId } from '@/lib/site'

const TIER_LABELS: Record<string, string> = {
  FREE: 'Gratuit',
  PREMIUM: 'Smart',
  PREMIUM_PLUS: 'Pro',
  VIP: 'VIP',
}

const TIER_DOT: Record<string, string> = {
  FREE: 'bg-gray-300',
  PREMIUM: 'bg-indigo-400',
  PREMIUM_PLUS: 'bg-orange-primary',
  VIP: 'bg-navy',
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
        id: true, name: true, slug: true, tier: true,
        subscriptionStatus: true, subscriptionPeriod: true, subscriptionCurrentPeriodEnd: true,
        giftTierExpiresAt: true, stripeSubscriptionId: true,
      },
    }),
  ])

  const countByTier = (tier: string) => tierCounts.find(t => t.tier === tier)?._count ?? 0

  return (
    <div className="min-h-screen">
      <div className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Paiements</h1>
              <p className="text-sm text-white/40 mt-0.5">Abonnements et transactions des professionnels</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['FREE', 'PREMIUM', 'PREMIUM_PLUS', 'VIP'] as const).map(tier => (
            <div key={tier} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${TIER_DOT[tier]}`} /> {TIER_LABELS[tier]}
              </span>
              <p className="text-xl font-black text-navy">{countByTier(tier)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-black text-navy uppercase tracking-wider">Abonnements payants ({payingPros.length})</p>
          </div>

          {payingPros.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucun professionnel en abonnement payant pour le moment.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {payingPros.map(pro => (
                <Link
                  key={pro.id}
                  href={`/admin/professionnels`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/80 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${TIER_DOT[pro.tier]}`} />
                  <span className="text-sm font-semibold text-navy w-48 shrink-0 truncate">{pro.name}</span>
                  <span className="text-xs text-gray-400 w-20 shrink-0">{TIER_LABELS[pro.tier]}</span>
                  <span className="text-xs text-gray-400 flex-1">
                    {pro.stripeSubscriptionId
                      ? `${pro.subscriptionStatus ?? 'actif'}${pro.subscriptionPeriod ? ` · ${pro.subscriptionPeriod}` : ''}${pro.subscriptionCurrentPeriodEnd ? ` · renouvelle le ${pro.subscriptionCurrentPeriodEnd.toLocaleDateString('fr-FR')}` : ''}`
                      : pro.giftTierExpiresAt
                        ? `Palier offert · expire le ${pro.giftTierExpiresAt.toLocaleDateString('fr-FR')}`
                        : 'Palier offert manuellement'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
