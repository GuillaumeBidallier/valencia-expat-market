import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  ClipboardList, Users, Star, BarChart3, Flag,
  AlertTriangle, Clock, CheckCircle, TrendingUp, ChevronRight,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const [
    pendingCount, activeCount, soldCount,
    usersCount, newUsersMonth, premiumUsers, blockedUsers,
    prosCount, premiumPros, plusPros,
    reportsCount, reportedListingsCount,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'SOLD' } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.user.count({ where: { blocked: true } }),
    prisma.professional.count(),
    prisma.professional.count({ where: { tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { tier: 'PREMIUM_PLUS' } }),
    prisma.report.count(),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' } } }),
  ])

  const freePros  = prosCount - premiumPros - plusPros
  const hasAlerts = pendingCount > 0 || reportedListingsCount > 0 || blockedUsers > 0

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Panneau d&apos;administration</p>
              <h1 className="text-2xl font-black tracking-tight">Bonjour, {adminName} 👋</h1>
              <p className="text-sm text-white/40 mt-0.5">{monthLabel} · Vendo Valencia Expat Market</p>
            </div>
            {hasAlerts && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-white/70 font-medium">Actions requises</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Hero KPIs ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Annonces en attente',
              value: pendingCount,
              icon: <Clock size={18} />,
              color: pendingCount > 0 ? 'text-amber-600' : 'text-gray-400',
              bg: pendingCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
              sub: pendingCount > 0 ? 'À modérer' : 'Tout traité',
              urgent: pendingCount > 0,
            },
            {
              label: 'Annonces signalées',
              value: reportedListingsCount,
              icon: <AlertTriangle size={18} />,
              color: reportedListingsCount > 0 ? 'text-red-500' : 'text-gray-400',
              bg: reportedListingsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
              sub: reportedListingsCount > 0 ? `${reportsCount} signalement${reportsCount > 1 ? 's' : ''}` : 'Aucun actif',
              urgent: reportedListingsCount > 0,
            },
            {
              label: 'Utilisateurs inscrits',
              value: usersCount,
              icon: <Users size={18} />,
              color: 'text-indigo-primary',
              bg: 'bg-indigo-soft',
              sub: `+${newUsersMonth} ce mois`,
              urgent: false,
            },
            {
              label: 'Annonces actives',
              value: activeCount,
              icon: <CheckCircle size={18} />,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              sub: `${soldCount} vendues`,
              urgent: false,
            },
          ].map(k => (
            <div key={k.label} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${k.urgent ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.bg}`}>
                  <span className={k.color}>{k.icon}</span>
                </div>
                {k.urgent && <span className="w-2 h-2 rounded-full bg-amber-400 mt-1" />}
              </div>
              <div>
                <p className="text-3xl font-black text-navy leading-none mb-1">{k.value}</p>
                <p className="text-sm text-gray-500 font-medium">{k.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation modules ─────────────────────────────── */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Modules</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                href: '/admin/annonces',
                icon: <ClipboardList size={22} />,
                label: 'Modération annonces',
                color: 'text-orange-primary',
                bg: 'bg-orange-soft',
                badge: pendingCount > 0 ? pendingCount : null,
                badgeColor: 'bg-amber-500',
                items: [
                  { label: 'En attente', value: pendingCount, dot: 'bg-amber-400' },
                  { label: 'Publiées', value: activeCount, dot: 'bg-emerald-400' },
                  { label: 'Vendues', value: soldCount, dot: 'bg-gray-300' },
                ],
              },
              {
                href: '/admin/utilisateurs',
                icon: <Users size={22} />,
                label: 'Utilisateurs',
                color: 'text-indigo-primary',
                bg: 'bg-indigo-soft',
                badge: blockedUsers > 0 ? blockedUsers : null,
                badgeColor: 'bg-red-400',
                items: [
                  { label: 'Total', value: usersCount, dot: 'bg-indigo-400' },
                  { label: 'Premium', value: premiumUsers, dot: 'bg-orange-primary' },
                  { label: 'Bloqués', value: blockedUsers, dot: 'bg-red-400' },
                ],
              },
              {
                href: '/admin/professionnels',
                icon: <Star size={22} />,
                label: 'Professionnels',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'FREE', value: freePros, dot: 'bg-gray-300' },
                  { label: 'Premium', value: premiumPros, dot: 'bg-indigo-400' },
                  { label: 'Premium+', value: plusPros, dot: 'bg-orange-primary' },
                ],
              },
              {
                href: '/admin/signalements',
                icon: <Flag size={22} />,
                label: 'Signalements',
                color: reportedListingsCount > 0 ? 'text-red-500' : 'text-gray-400',
                bg: reportedListingsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
                badge: reportedListingsCount > 0 ? reportedListingsCount : null,
                badgeColor: 'bg-red-500',
                items: [
                  { label: 'Annonces signalées', value: reportedListingsCount, dot: reportedListingsCount > 0 ? 'bg-red-400' : 'bg-gray-200' },
                  { label: 'Total signalements', value: reportsCount, dot: 'bg-amber-400' },
                  { label: 'Haute priorité (≥3)', value: 0, dot: 'bg-gray-200' },
                ],
              },
              {
                href: '/admin/statistiques',
                icon: <BarChart3 size={22} />,
                label: 'Statistiques',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'Nouveaux/mois', value: newUsersMonth, dot: 'bg-emerald-400' },
                  { label: 'Taux premium', value: `${usersCount > 0 ? Math.round((premiumUsers / usersCount) * 100) : 0}%`, dot: 'bg-blue-400' },
                  { label: 'Pros référencés', value: prosCount, dot: 'bg-indigo-400' },
                ],
              },
            ].map(m => (
              <Link
                key={m.href}
                href={m.href}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg}`}>
                      <span className={m.color}>{m.icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.badge != null && m.badge > 0 && (
                        <span className={`${m.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                          {m.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <p className="font-black text-navy text-sm mb-3 group-hover:text-orange-primary transition-colors">{m.label}</p>
                  <div className="space-y-1.5">
                    {m.items.map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                          <span className="text-xs text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-navy tabular-nums">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`h-1 ${m.bg}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick stats strip ──────────────────────────────── */}
        <div className="bg-navy rounded-2xl px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Utilisateurs Premium', value: `${usersCount > 0 ? Math.round((premiumUsers / usersCount) * 100) : 0}%`, sub: `${premiumUsers} comptes`, icon: <TrendingUp size={14} /> },
            { label: 'Pros référencés', value: prosCount, sub: `${plusPros} Premium+`, icon: <Star size={14} /> },
            { label: 'Nouvelles inscriptions', value: newUsersMonth, sub: 'ce mois', icon: <Users size={14} /> },
            { label: 'Annonces en ligne', value: activeCount, sub: 'statut ACTIVE', icon: <CheckCircle size={14} /> },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center gap-1.5 text-white/30 mb-1">
                {s.icon}
                <span className="text-[10px] uppercase tracking-wider font-semibold">{s.label}</span>
              </div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
