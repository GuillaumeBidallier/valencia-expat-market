import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getAdminSiteId } from '@/lib/site'
import PendingModerationPanel from './PendingModerationPanel'
import QuickCacheButton from '@/components/admin/QuickCacheButton'
import { ActivityLineChart, DonutChart } from '@/components/admin/DashboardCharts'
import {
  Clock, AlertTriangle, Shield, Users, CheckCircle, ChevronRight, ChevronDown, CalendarDays,
  FileText, Flag, CreditCard, BarChart3, Settings2,
  Rocket, Grid3x3, Eye, Download, Sparkles, TrendingUp,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const dateLabel  = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const siteId     = await getAdminSiteId()

  const [
    pendingCount, activeCount,
    usersCount, newUsersWeek, newUsersPrevWeek,
    prosCount, premiumPros, plusPros, vipPros,
    reportedListingsCount, reportsWeek,
    firewallBlockedCount, blockedWeek,
    pendingListingsRaw, listingsTwoWeeksRaw, blockedTwoWeeksCount,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { status: 'ACTIVE', siteId } }),
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: twoWeeksStart, lt: weekStart } } }),
    prisma.professional.count({ where: { siteId } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM_PLUS' } }),
    prisma.professional.count({ where: { siteId, tier: 'VIP' } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
    prisma.report.count({ where: { listing: { siteId }, createdAt: { gte: weekStart } } }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId } }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId, updatedAt: { gte: weekStart } } }),
    prisma.listing.findMany({
      where: { status: 'PENDING', siteId },
      orderBy: { publishedAt: 'asc' },
      take: 6,
      select: { id: true, title: true, price: true, city: true, publishedAt: true, user: { select: { name: true } } },
    }),
    prisma.listing.findMany({
      where: { siteId, publishedAt: { gte: twoWeeksStart }, status: { not: 'DELETED' } },
      select: { publishedAt: true },
    }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId, updatedAt: { gte: twoWeeksStart, lt: weekStart } } }),
  ])

  const freePros   = prosCount - premiumPros - plusPros - vipPros

  const pendingListings = pendingListingsRaw.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price,
    city: l.city,
    publishedAt: l.publishedAt.toISOString(),
    userName: l.user.name,
  }))

  // ── 2 x 7 jours : semaine en cours vs. semaine précédente ──────────────
  const buildBuckets = (offsetDaysStart: number) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (offsetDaysStart - i) * 24 * 60 * 60 * 1000)
      return { key: d.toDateString(), label: d.toLocaleDateString('fr-FR', { weekday: 'short' }), count: 0 }
    })
  const currentBuckets = buildBuckets(6)
  const previousBuckets = buildBuckets(13)
  for (const l of listingsTwoWeeksRaw) {
    const key = l.publishedAt.toDateString()
    const cur = currentBuckets.find(b => b.key === key)
    if (cur) { cur.count++; continue }
    const prev = previousBuckets.find(b => b.key === key)
    if (prev) prev.count++
  }
  const newListingsWeek = currentBuckets.reduce((s, b) => s + b.count, 0)
  const newListingsPrevWeek = previousBuckets.reduce((s, b) => s + b.count, 0)

  const delta = (cur: number, prev: number) => cur - prev
  const deltaLabel = (n: number) => n === 0 ? 'Stable par rapport à la semaine précédente' : `${n > 0 ? '+' : ''}${n} par rapport à la semaine précédente`

  const statCards = [
    { label: 'En attente', value: pendingCount, href: '/admin/annonces', icon: Clock, sub: `${pendingCount === 0 ? 'Aucun' : pendingCount} nouveau${pendingCount > 1 ? 'x' : ''} aujourd'hui`, iconBg: 'bg-orange-soft', iconColor: 'text-orange-primary' },
    { label: 'Signalée' + (reportedListingsCount > 1 ? 's' : ''), value: reportedListingsCount, href: '/admin/signalements', icon: AlertTriangle, sub: `${reportsWeek} nouveau${reportsWeek > 1 ? 'x' : ''} aujourd'hui`, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Bloquée (pare-feu)', value: firewallBlockedCount, href: '/admin/parefeu', icon: Shield, sub: `Total bloquées ${firewallBlockedCount}`, iconBg: 'bg-indigo-soft', iconColor: 'text-indigo-primary' },
    { label: 'Utilisateurs', value: usersCount, href: '/admin/utilisateurs', icon: Users, sub: `+${newUsersWeek} cette semaine`, iconBg: 'bg-blue-soft', iconColor: 'text-blue-valencia' },
    { label: 'Annonces actives', value: activeCount, href: '/admin/annonces', icon: CheckCircle, sub: `+${newListingsWeek} cette semaine`, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  ]

  const modules = [
    { href: '/admin/annonces', icon: FileText, title: 'Annonces', desc: 'Gérez toutes les annonces en attente ou actives' },
    { href: '/admin/utilisateurs', icon: Users, title: 'Utilisateurs', desc: 'Gérez vos utilisateurs et leurs accès' },
    { href: '/admin/paiements', icon: CreditCard, title: 'Paiements', desc: 'Suivez les transactions et abonnements' },
    { href: '/admin/signalements', icon: Flag, title: 'Signalements', desc: 'Consultez et traitez les signalements' },
    { href: '/admin/statistiques', icon: BarChart3, title: 'Statistiques', desc: 'Consultez les rapports et performances' },
    { href: '/admin/parametres', icon: Settings2, title: 'Paramètres', desc: 'Personnalisez votre plateforme' },
  ]

  const quickLinks = [
    { href: '/admin/annonces', icon: Sparkles, label: 'Ajouter une annonce en avant' },
    { href: '/admin/categories', icon: Grid3x3, label: 'Gérer les catégories' },
    { href: '/admin/annonces', icon: Eye, label: 'Voir les annonces récentes' },
    { href: '/api/admin/database/export', icon: Download, label: 'Exporter les statistiques', target: '_blank' },
  ]

  const activityFeed = [
    { icon: TrendingUp, iconBg: 'bg-orange-soft', iconColor: 'text-orange-primary', title: `${newListingsWeek} annonce${newListingsWeek > 1 ? 's' : ''} déposée${newListingsWeek > 1 ? 's' : ''}`, sub: deltaLabel(delta(newListingsWeek, newListingsPrevWeek)) },
    { icon: Users, iconBg: 'bg-indigo-soft', iconColor: 'text-indigo-primary', title: `${newUsersWeek} nouvel${newUsersWeek > 1 ? 's' : ''} utilisateur${newUsersWeek > 1 ? 's' : ''} inscrit${newUsersWeek > 1 ? 's' : ''}`, sub: deltaLabel(delta(newUsersWeek, newUsersPrevWeek)) },
    { icon: AlertTriangle, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', title: `${reportsWeek} signalement${reportsWeek > 1 ? 's' : ''}`, sub: reportsWeek === 0 ? 'Aucun nouveau signalement' : `Cette semaine` },
    { icon: Shield, iconBg: 'bg-red-50', iconColor: 'text-red-500', title: `${blockedWeek} annonce${blockedWeek > 1 ? 's' : ''} bloquée${blockedWeek > 1 ? 's' : ''}`, sub: deltaLabel(delta(blockedWeek, blockedTwoWeeksCount)) },
  ]

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Bonjour, {adminName} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Voici un aperçu global de votre plateforme 1000Click.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-sm font-semibold text-navy capitalize">
          <CalendarDays size={15} className="text-gray-400" aria-hidden />
          {dateLabel}
          <ChevronDown size={14} className="text-gray-300" aria-hidden />
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <p className="text-2xl font-black text-navy leading-none">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1.5">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-2">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Vue d'ensemble / Répartition / Activité récente ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-black text-navy">Vue d&apos;ensemble</p>
            <span className="flex items-center gap-1 text-xs text-gray-400 border border-gray-100 rounded-lg px-2.5 py-1">
              7 derniers jours <ChevronDown size={12} />
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Évolution des annonces déposées</p>
          <div className="flex items-center gap-4 mb-2 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-orange-primary" /> Cette semaine</span>
            <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-300" /> Semaine précédente</span>
          </div>
          <ActivityLineChart current={currentBuckets} previous={previousBuckets} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <p className="text-sm font-black text-navy mb-0.5">Répartition des annonces</p>
          <p className="text-xs text-gray-400 mb-4">Par type de compte professionnel</p>
          <DonutChart
            centerValue={prosCount}
            centerLabel="professionnels"
            segments={[
              { label: 'Gratuit', value: freePros, color: '#93C5FD', dot: 'bg-blue-300' },
              { label: 'Smart', value: premiumPros, color: '#818CF8', dot: 'bg-indigo-400' },
              { label: 'Pro', value: plusPros, color: '#E8571A', dot: 'bg-orange-primary' },
              { label: 'VIP', value: vipPros, color: '#1A1F36', dot: 'bg-navy' },
            ]}
          />
          <Link href="/admin/professionnels" className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-primary hover:underline">
            Voir tous les professionnels <ChevronRight size={13} />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <p className="text-sm font-black text-navy mb-0.5">Activité récente</p>
          <p className="text-xs text-gray-400 mb-4">7 derniers jours</p>
          <div className="space-y-3.5 flex-1">
            {activityFeed.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <item.icon size={14} className={item.iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy leading-snug">{item.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/statistiques" className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-primary hover:underline">
            Voir toutes les statistiques <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── À modérer ───────────────────────────────────────── */}
      <PendingModerationPanel initialListings={pendingListings} />

      {/* ── Modules de gestion / Accès rapides ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-black text-navy mb-4">Modules de gestion</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map(m => (
              <Link key={m.href} href={m.href} className="border border-gray-100 rounded-xl p-4 hover:border-orange-primary/40 hover:bg-gray-50/60 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center mb-2.5">
                  <m.icon size={16} className="text-gray-500" />
                </div>
                <p className="text-sm font-bold text-navy mb-0.5">{m.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <p className="text-sm font-black text-navy px-5 pt-5 pb-3">Accès rapides</p>
          <div className="divide-y divide-gray-50 border-t border-gray-50">
            {quickLinks.map(l => (
              <Link
                key={l.label}
                href={l.href}
                target={l.target}
                rel={l.target ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-navy font-medium">
                  <l.icon size={15} className="text-gray-400" /> {l.label}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </Link>
            ))}
            <QuickCacheButton />
          </div>
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50/60">
            <div className="flex items-center gap-2 text-gray-300">
              <Rocket size={32} strokeWidth={1.25} />
              <BarChart3 size={40} strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bandeau promo ───────────────────────────────────── */}
      <div className="bg-orange-soft rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Rocket size={20} className="text-orange-primary" />
          </div>
          <div>
            <p className="font-black text-navy text-sm">Boostez la visibilité de votre plateforme</p>
            <p className="text-xs text-gray-500 mt-0.5">Mettez en avant 1000Click et attirez plus d&apos;utilisateurs dès aujourd&apos;hui.</p>
          </div>
        </div>
        <Link
          href="/publicite"
          className="flex items-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          Découvrir nos solutions de visibilité <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  )
}
