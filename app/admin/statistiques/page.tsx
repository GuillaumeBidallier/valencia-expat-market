import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  ArrowLeft, Users, FileText, Star, TrendingUp, TrendingDown,
  ShoppingCart, AlertTriangle, CheckCircle, Clock, CreditCard,
  BarChart2, Minus, UserCheck, Ban, Package,
} from 'lucide-react'

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, color, bg, trend, trendLabel,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  bg: string
  trend?: number | null
  trendLabel?: string
}) {
  const TrendIcon = trend == null ? Minus : trend >= 0 ? TrendingUp : TrendingDown
  const trendColor = trend == null ? 'text-gray-400' : trend >= 0 ? 'text-emerald-500' : 'text-red-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <span className={color}>{icon}</span>
        </div>
        {trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-navy leading-none mb-1">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-black text-navy uppercase tracking-wide">{title}</h2>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function MetricRow({
  label, value, sub, dot,
}: {
  label: string
  value: string | number
  sub?: string
  dot?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5">
        {dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
        <span className="text-sm text-gray-600">{label}</span>
        {sub && <span className="text-xs text-gray-400">({sub})</span>}
      </div>
      <span className="text-sm font-bold text-navy tabular-nums">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminStatsPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  const now          = new Date()
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const weekStart    = new Date(now); weekStart.setDate(now.getDate() - 7)

  const [
    totalUsers,
    newUsersMonth,
    premiumUsers,
    blockedUsers,
    newUsersLastMonth,
    newUsersWeek,
    totalListings,
    activeListings,
    pendingListings,
    soldListings,
    rejectedListings,
    newListingsMonth,
    totalPros,
    premiumPros,
    plusPros,
    totalReports,
    photoUpgradesPaid,
    listingsByCategory,
    messagesCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.user.count({ where: { blocked: true } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.listing.count({ where: { status: { not: 'DELETED' } } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'SOLD' } }),
    prisma.listing.count({ where: { status: 'REJECTED' } }),
    prisma.listing.count({ where: { publishedAt: { gte: monthStart }, status: { not: 'DELETED' } } }),
    prisma.professional.count(),
    prisma.professional.count({ where: { tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { tier: 'PREMIUM_PLUS' } }),
    prisma.report.count(),
    prisma.photoUpgrade.count({ where: { paid: true } }),
    prisma.listing.groupBy({
      by: ['categorySlug'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
    prisma.message.count(),
  ])

  const unresolvedReports = totalReports // no resolvedAt field, show total
  const revenueEstimate  = (photoUpgradesPaid * 7.99).toFixed(2)
  const freePros         = totalPros - premiumPros - plusPros
  const growthPct        = newUsersLastMonth > 0
    ? Math.round(((newUsersMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : null
  const sellRate         = totalListings > 0 ? Math.round((soldListings / totalListings) * 100) : 0
  const premiumRate      = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0
  const monthLabel       = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const maxCatCount = listingsByCategory[0]?._count.id ?? 1

  const COLORS = [
    'bg-orange-primary',
    'bg-indigo-primary',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-amber-500',
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Top header band ───────────────────────────────────────── */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight">Statistiques</h1>
              <p className="text-xs text-white/50">Données en temps réel · {monthLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* ── Hero KPI row ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Utilisateurs"
            value={totalUsers}
            icon={<Users size={18} />}
            color="text-indigo-primary"
            bg="bg-indigo-soft"
            trend={growthPct}
            trendLabel={growthPct !== null ? `${growthPct >= 0 ? '+' : ''}${growthPct}% vs m-1` : undefined}
          />
          <KpiCard
            label="Annonces actives"
            value={activeListings}
            icon={<CheckCircle size={18} />}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <KpiCard
            label="En attente"
            value={pendingListings}
            icon={<Clock size={18} />}
            color={pendingListings > 0 ? 'text-amber-600' : 'text-gray-400'}
            bg={pendingListings > 0 ? 'bg-amber-50' : 'bg-gray-50'}
            trendLabel={pendingListings > 0 ? 'À modérer' : undefined}
          />
          <KpiCard
            label="Signalements"
            value={unresolvedReports}
            icon={<AlertTriangle size={18} />}
            color={unresolvedReports > 0 ? 'text-red-500' : 'text-gray-400'}
            bg={unresolvedReports > 0 ? 'bg-red-50' : 'bg-gray-50'}
            trendLabel={unresolvedReports > 0 ? 'Non résolus' : undefined}
          />
          <KpiCard
            label="Revenus estimés"
            value={`${revenueEstimate} €`}
            icon={<CreditCard size={18} />}
            color="text-orange-primary"
            bg="bg-orange-soft"
            trendLabel={photoUpgradesPaid > 0 ? `${photoUpgradesPaid} ventes` : undefined}
          />
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Col LEFT (2/3) ─────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Utilisateurs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<Users size={16} />} title="Utilisateurs" sub="Répartition et croissance" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-50">
              {[
                { label: 'Total', value: totalUsers, sub: 'inscrits', color: 'text-navy' },
                { label: 'Ce mois', value: newUsersMonth, sub: monthLabel.split(' ')[0], color: 'text-indigo-primary' },
                { label: 'Cette semaine', value: newUsersWeek, sub: '7 derniers jours', color: 'text-blue-500' },
                { label: 'Premium', value: `${premiumRate}%`, sub: `${premiumUsers} comptes`, color: 'text-orange-primary' },
              ].map(s => (
                <div key={s.label} className="px-5 py-4">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
                  <p className="text-xs text-gray-300">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
              <MetricRow label="Comptes bloqués" value={blockedUsers} dot="bg-red-400" />
              <MetricRow label="Comptes Standard" value={totalUsers - premiumUsers} dot="bg-gray-300" />
              <MetricRow label="Comptes Premium" value={premiumUsers} dot="bg-indigo-400" />
              <MetricRow label="Messages envoyés" value={messagesCount} dot="bg-blue-400" />
            </div>
          </div>

          {/* Annonces */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<FileText size={16} />} title="Annonces" sub="Statuts et activité" />
            </div>

            {/* Status bar */}
            <div className="px-6 py-5">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                {activeListings > 0 && (
                  <div className="bg-emerald-500 transition-all" style={{ width: `${(activeListings / Math.max(totalListings, 1)) * 100}%` }} title={`Actives: ${activeListings}`} />
                )}
                {pendingListings > 0 && (
                  <div className="bg-amber-400 transition-all" style={{ width: `${(pendingListings / Math.max(totalListings, 1)) * 100}%` }} title={`En attente: ${pendingListings}`} />
                )}
                {soldListings > 0 && (
                  <div className="bg-gray-300 transition-all" style={{ width: `${(soldListings / Math.max(totalListings, 1)) * 100}%` }} title={`Vendues: ${soldListings}`} />
                )}
                {rejectedListings > 0 && (
                  <div className="bg-red-300 transition-all" style={{ width: `${(rejectedListings / Math.max(totalListings, 1)) * 100}%` }} title={`Refusées: ${rejectedListings}`} />
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  { dot: 'bg-emerald-500', label: 'Actives', value: activeListings },
                  { dot: 'bg-amber-400', label: 'En attente', value: pendingListings },
                  { dot: 'bg-gray-300', label: 'Vendues', value: soldListings },
                  { dot: 'bg-red-300', label: 'Refusées', value: rejectedListings },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    {s.label}: <span className="font-bold text-navy">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Total (hors supprimées)', value: totalListings, color: 'text-navy' },
                { label: `Publiées en ${monthLabel.split(' ')[0]}`, value: newListingsMonth, color: 'text-blue-600' },
                { label: 'Taux de vente', value: `${sellRate}%`, color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top catégories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<BarChart2 size={16} />} title="Top catégories" sub="Par nombre d'annonces actives" />
            </div>
            {listingsByCategory.length === 0 ? (
              <p className="text-center text-gray-300 py-10 text-sm">Aucune donnée disponible.</p>
            ) : (
              <div className="px-6 py-4 space-y-3">
                {listingsByCategory.map((row: { categorySlug: string; _count: { id: number } }, i: number) => {
                  const pct = Math.round((row._count.id / maxCatCount) * 100)
                  const sharePct = activeListings > 0 ? Math.round((row._count.id / activeListings) * 100) : 0
                  return (
                    <div key={row.categorySlug} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4 text-right flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-navy capitalize truncate">{row.categorySlug}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-xs text-gray-400">{sharePct}%</span>
                            <span className="text-sm font-bold text-navy tabular-nums">{row._count.id}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${COLORS[i] ?? 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Col RIGHT (1/3) ─────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Professionnels */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<Star size={16} />} title="Professionnels" />
            </div>
            <div className="px-5 py-4">
              {/* Donut-style breakdown */}
              <div className="flex items-center justify-center gap-6 py-3 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-navy">{totalPros}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'FREE', value: freePros, pct: totalPros > 0 ? Math.round((freePros / totalPros) * 100) : 0, color: 'bg-gray-200', text: 'text-gray-500' },
                  { label: 'Premium', value: premiumPros, pct: totalPros > 0 ? Math.round((premiumPros / totalPros) * 100) : 0, color: 'bg-indigo-primary', text: 'text-indigo-primary' },
                  { label: 'Premium+', value: plusPros, pct: totalPros > 0 ? Math.round((plusPros / totalPros) * 100) : 0, color: 'bg-orange-primary', text: 'text-orange-primary' },
                ].map(t => (
                  <div key={t.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${t.text}`}>{t.label}</span>
                      <span className="text-xs text-gray-500 tabular-nums">{t.value} <span className="text-gray-300">({t.pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenus */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<CreditCard size={16} />} title="Revenus" sub="Upgrades photos Stripe" />
            </div>
            <div className="px-5 py-4">
              <div className="bg-orange-soft rounded-xl p-4 mb-4 text-center">
                <p className="text-3xl font-black text-orange-primary">{revenueEstimate} €</p>
                <p className="text-xs text-orange-primary/60 mt-1">revenus estimés</p>
              </div>
              <MetricRow label="Upgrades vendus" value={photoUpgradesPaid} dot="bg-orange-primary" />
              <MetricRow label="Prix unitaire" value="7,99 €" dot="bg-gray-200" />
              <MetricRow
                label="Taux de conversion"
                value={totalUsers > 0 ? `${Math.round((photoUpgradesPaid / totalUsers) * 100)}%` : '0%'}
                sub="des users"
                dot="bg-indigo-400"
              />
            </div>
          </div>

          {/* Signalements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<AlertTriangle size={16} />} title="Signalements" />
            </div>
            <div className="px-5 py-4">
              <div className={`rounded-xl p-4 mb-4 text-center ${unresolvedReports > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className={`text-3xl font-black ${unresolvedReports > 0 ? 'text-red-500' : 'text-gray-300'}`}>{unresolvedReports}</p>
                <p className={`text-xs mt-1 ${unresolvedReports > 0 ? 'text-red-400' : 'text-gray-400'}`}>non résolus</p>
              </div>
              <MetricRow label="Total signalements" value={totalReports} dot="bg-gray-200" />
              <MetricRow label="Non résolus" value={unresolvedReports} dot={unresolvedReports > 0 ? 'bg-red-400' : 'bg-gray-200'} />
              <MetricRow label="Résolus" value={totalReports - unresolvedReports} dot="bg-emerald-400" />
            </div>
            {unresolvedReports > 0 && (
              <Link
                href="/admin/annonces"
                className="block px-5 py-3 bg-red-50 text-xs font-semibold text-red-500 hover:bg-red-100 transition-colors text-center border-t border-red-100"
              >
                Voir les signalements →
              </Link>
            )}
          </div>

          {/* Accès rapides */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
              <SectionTitle icon={<Package size={16} />} title="Accès rapides" />
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { href: '/admin/annonces', label: 'Modération annonces', icon: <FileText size={14} />, badge: pendingListings, badgeColor: 'bg-amber-500' },
                { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: <Users size={14} />, badge: null, badgeColor: '' },
                { href: '/admin/professionnels', label: 'Professionnels', icon: <Star size={14} />, badge: null, badgeColor: '' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2.5 text-gray-600 group-hover:text-navy transition-colors">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge != null && item.badge > 0 && (
                      <span className={`${item.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                        {item.badge}
                      </span>
                    )}
                    <ArrowLeft size={12} className="rotate-180 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
