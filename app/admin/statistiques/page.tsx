import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'

function StatCard({ label, value, sub, color = 'text-navy' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function AdminStatsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now   = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalUsers, newUsersMonth, premiumUsers,
    totalListings, activeListings, pendingListings, soldListings,
    newListingsMonth,
    totalPros, premiumPros, plusPros,
    totalReports,
    photoUpgradesPaid, photoUpgradesRevenue,
    listingsByCategory,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.listing.count({ where: { status: { not: 'DELETED' } } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'SOLD' } }),
    prisma.listing.count({ where: { publishedAt: { gte: monthStart }, status: { not: 'DELETED' } } }),
    prisma.professional.count(),
    prisma.professional.count({ where: { tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { tier: 'PREMIUM_PLUS' } }),
    prisma.report.count(),
    prisma.photoUpgrade.count({ where: { paid: true } }),
    prisma.photoUpgrade.count({ where: { paid: true } }), // used for revenue calc
    prisma.listing.groupBy({
      by: ['categorySlug'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
  ])

  const revenueEstimate = (photoUpgradesPaid * 1.99).toFixed(2)

  // New users last month for comparison
  const newUsersLastMonth = await prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } })
  const growthPct = newUsersLastMonth > 0
    ? Math.round(((newUsersMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : null

  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-navy transition-colors rounded-lg hover:bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-navy">📊 Statistiques</h1>
            <p className="text-sm text-gray-400">Données en temps réel · {monthLabel}</p>
          </div>
        </div>

        {/* Utilisateurs */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">👥 Utilisateurs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total inscrits" value={totalUsers} />
            <StatCard
              label="Nouveaux ce mois"
              value={newUsersMonth}
              sub={growthPct !== null ? `${growthPct >= 0 ? '+' : ''}${growthPct}% vs mois dernier` : undefined}
              color="text-emerald-600"
            />
            <StatCard label="Comptes Premium" value={premiumUsers} color="text-indigo-600" />
            <StatCard label="Taux Premium" value={totalUsers > 0 ? `${Math.round((premiumUsers / totalUsers) * 100)}%` : '0%'} sub="des inscrits" color="text-orange-primary" />
          </div>
        </section>

        {/* Annonces */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📋 Annonces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total annonces" value={totalListings} />
            <StatCard label="En ligne" value={activeListings} color="text-emerald-600" />
            <StatCard label="En attente" value={pendingListings} color={pendingListings > 0 ? 'text-amber-600' : 'text-gray-500'} />
            <StatCard label="Vendues" value={soldListings} color="text-gray-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <StatCard label="Publiées ce mois" value={newListingsMonth} color="text-blue-600" />
            <StatCard label="Signalements" value={totalReports} color={totalReports > 0 ? 'text-red-500' : 'text-gray-500'} />
            <StatCard label="Taux de vente" value={totalListings > 0 ? `${Math.round((soldListings / totalListings) * 100)}%` : '0%'} sub="annonces vendues" color="text-purple-600" />
          </div>
        </section>

        {/* Professionnels */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">⭐ Professionnels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total pros" value={totalPros} />
            <StatCard label="FREE" value={totalPros - premiumPros - plusPros} color="text-gray-500" />
            <StatCard label="Premium" value={premiumPros} color="text-indigo-600" />
            <StatCard label="Premium+" value={plusPros} color="text-orange-primary" />
          </div>
        </section>

        {/* Revenus */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">💰 Revenus photo upgrade</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Upgrades vendus" value={photoUpgradesPaid} color="text-emerald-600" />
            <StatCard label="Revenus estimés" value={`${revenueEstimate} €`} sub="à 1,99€ l'upgrade" color="text-emerald-700" />
            <StatCard label="Taux conv. upgrades" value={totalUsers > 0 ? `${Math.round((photoUpgradesPaid / totalUsers) * 100)}%` : '0%'} sub="des utilisateurs" color="text-purple-600" />
          </div>
        </section>

        {/* Top catégories */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🏷 Top catégories (annonces actives)</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {listingsByCategory.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Aucune donnée.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {listingsByCategory.map((row, i) => {
                  const pct = activeListings > 0 ? Math.round((row._count.id / activeListings) * 100) : 0
                  return (
                    <div key={row.categorySlug} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-navy capitalize">{row.categorySlug}</span>
                          <span className="text-sm font-bold text-gray-500">{row._count.id}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
