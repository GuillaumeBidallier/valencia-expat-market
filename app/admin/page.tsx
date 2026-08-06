import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getAdminSiteId } from '@/lib/site'
import PendingModerationPanel from './PendingModerationPanel'
import {
  Users, Star, Flag, Shield,
  AlertTriangle, Clock, CheckCircle, ChevronRight, BookOpen, Tags, Settings2,
  HelpCircle, BarChart3,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const dayLabel   = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const siteId     = await getAdminSiteId()

  const [
    pendingCount, activeCount, soldCount, newListingsWeek,
    usersCount, newUsersMonth, blockedUsers,
    prosCount, premiumPros, plusPros, vipPros,
    reportsCount, reportedListingsCount, firewallBlockedCount,
    blogTotal, blogPublished, categoriesCount,
    pendingListingsRaw, recentActivityRaw,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { status: 'ACTIVE', siteId } }),
    prisma.listing.count({ where: { status: 'SOLD', siteId } }),
    prisma.listing.count({ where: { siteId, publishedAt: { gte: weekStart }, status: { not: 'DELETED' } } }),
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { siteId, blocked: true } }),
    prisma.professional.count({ where: { siteId } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM' } }),
    prisma.professional.count({ where: { siteId, tier: 'PREMIUM_PLUS' } }),
    prisma.professional.count({ where: { siteId, tier: 'VIP' } }),
    prisma.report.count({ where: { listing: { siteId } } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
    prisma.listing.count({ where: { blockedReason: { not: null }, siteId } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.category.count({ where: { siteId } }),
    prisma.listing.findMany({
      where: { status: 'PENDING', siteId },
      orderBy: { publishedAt: 'asc' },
      take: 6,
      select: { id: true, title: true, price: true, city: true, publishedAt: true, user: { select: { name: true } } },
    }),
    prisma.listing.findMany({
      where: { siteId, publishedAt: { gte: weekStart }, status: { not: 'DELETED' } },
      select: { publishedAt: true },
    }),
  ])

  const freePros   = prosCount - premiumPros - plusPros - vipPros
  const payingPros = premiumPros + plusPros + vipPros

  const pendingListings = pendingListingsRaw.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price,
    city: l.city,
    publishedAt: l.publishedAt.toISOString(),
    userName: l.user.name,
  }))

  // ── Activité des 7 derniers jours, en nombre d'annonces par jour ──────
  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    return { key: d.toDateString(), label: d.toLocaleDateString('fr-FR', { weekday: 'short' }), count: 0 }
  })
  for (const l of recentActivityRaw) {
    const key = l.publishedAt.toDateString()
    const bucket = dayBuckets.find(b => b.key === key)
    if (bucket) bucket.count++
  }
  const maxDayCount = Math.max(1, ...dayBuckets.map(b => b.count))

  const statBand = [
    { label: 'en attente', value: pendingCount, href: '/admin/annonces', urgent: pendingCount > 0, icon: <Clock size={14} /> },
    { label: 'signalée' + (reportedListingsCount > 1 ? 's' : ''), value: reportedListingsCount, href: '/admin/signalements', urgent: reportedListingsCount > 0, icon: <AlertTriangle size={14} /> },
    { label: 'bloquée' + (firewallBlockedCount > 1 ? 's' : '') + ' (pare-feu)', value: firewallBlockedCount, href: '/admin/parefeu', urgent: firewallBlockedCount > 0, icon: <Shield size={14} /> },
    { label: 'utilisateurs', value: usersCount, href: '/admin/utilisateurs', urgent: false, icon: <Users size={14} />, title: `+${newUsersMonth} ce mois` },
    { label: 'annonces actives', value: activeCount, href: '/admin/annonces', urgent: false, icon: <CheckCircle size={14} />, title: `${soldCount} vendue${soldCount > 1 ? 's' : ''}` },
  ]

  const otherModules = [
    { href: '/admin/signalements', icon: <Flag size={16} />, label: 'Signalements', sub: `${reportedListingsCount} annonce${reportedListingsCount > 1 ? 's' : ''} · ${reportsCount} signalement${reportsCount > 1 ? 's' : ''}`, alert: reportedListingsCount > 0 },
    { href: '/admin/parefeu', icon: <Shield size={16} />, label: 'Pare-feu automatique', sub: `${firewallBlockedCount} bloquée${firewallBlockedCount > 1 ? 's' : ''}`, alert: firewallBlockedCount > 0 },
    { href: '/admin/utilisateurs', icon: <Users size={16} />, label: 'Utilisateurs', sub: `${usersCount} inscrits · ${blockedUsers} bloqué${blockedUsers > 1 ? 's' : ''}`, alert: false },
    { href: '/admin/statistiques', icon: <BarChart3 size={16} />, label: 'Statistiques détaillées', sub: 'Vue d\'ensemble complète', alert: false },
    { href: '/admin/blog', icon: <BookOpen size={16} />, label: 'Blog', sub: `${blogPublished}/${blogTotal} publiés`, alert: false },
    { href: '/admin/categories', icon: <Tags size={16} />, label: 'Catégories', sub: `${categoriesCount} au total`, alert: false },
    { href: '/admin/parametres', icon: <Settings2 size={16} />, label: 'Paramètres', sub: 'Accueil, bannière, maintenance', alert: false },
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* ── Header compact ─────────────────────────────────── */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-black text-navy tracking-tight">Bonjour, {adminName} 👋</h1>
          <p className="text-xs text-gray-400 capitalize">{dayLabel}</p>
        </div>

        {/* ── Bandeau de stats compact ────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-wrap divide-x divide-gray-50">
          {statBand.map(s => (
            <Link
              key={s.label}
              href={s.href}
              title={s.title}
              className="flex-1 min-w-[140px] px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50/80 transition-colors"
            >
              <span className={s.urgent ? 'text-amber-500' : 'text-gray-300'}>{s.icon}</span>
              <div className="min-w-0">
                <p className={`text-lg font-black leading-none ${s.urgent ? 'text-amber-600' : 'text-navy'}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 truncate">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── À modérer : liste directement actionnable ──────────── */}
        <PendingModerationPanel initialListings={pendingListings} />

        {/* ── Professionnels + activité, côte à côte ─────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link href="/admin/professionnels" className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors p-5 block">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <Star size={14} className="text-purple-500" /> Professionnels
              </p>
              <ChevronRight size={15} className="text-gray-300" />
            </div>
            <p className="text-2xl font-black text-navy leading-none mb-1">{prosCount}<span className="text-sm text-gray-400 font-medium"> au total</span></p>
            <p className="text-xs text-gray-400 mb-3">{payingPros} payant{payingPros > 1 ? 's' : ''} sur {prosCount}</p>
            <div className="space-y-1.5">
              {[
                { label: 'Gratuit', value: freePros, dot: 'bg-gray-300' },
                { label: 'Smart', value: premiumPros, dot: 'bg-indigo-400' },
                { label: 'Pro', value: plusPros, dot: 'bg-orange-primary' },
                { label: 'VIP', value: vipPros, dot: 'bg-navy' },
              ].map(t => (
                <div key={t.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-500"><span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />{t.label}</span>
                  <span className="font-bold text-navy tabular-nums">{t.value}</span>
                </div>
              ))}
            </div>
          </Link>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-black text-navy uppercase tracking-wider mb-3">Activité — 7 derniers jours</p>
            <div className="flex items-end justify-between gap-2 h-20 mb-2">
              {dayBuckets.map(b => (
                <div key={b.key} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-16">
                    <div
                      className={`w-full max-w-[22px] rounded-t ${b.count > 0 ? 'bg-orange-primary' : 'bg-gray-100'}`}
                      style={{ height: `${Math.max(6, (b.count / maxDayCount) * 100)}%` }}
                      title={`${b.count} annonce${b.count > 1 ? 's' : ''}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">{b.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{newListingsWeek} annonce{newListingsWeek > 1 ? 's' : ''} déposée{newListingsWeek > 1 ? 's' : ''} cette semaine</p>
          </div>
        </div>

        {/* ── Autres modules, en liste dense ──────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-black text-navy uppercase tracking-wider">Autres modules</p>
          </div>
          <div className="divide-y divide-gray-50">
            {otherModules.map(m => (
              <Link key={m.href} href={m.href} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50/80 transition-colors group">
                <span className={m.alert ? 'text-amber-500' : 'text-gray-400'}>{m.icon}</span>
                <span className="text-sm font-semibold text-navy w-48 shrink-0">{m.label}</span>
                <span className="text-xs text-gray-400 flex-1">{m.sub}</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Besoin d'aide ? — glossaire pour une utilisatrice non technique ── */}
        <details className="bg-white rounded-xl border border-gray-100 shadow-sm group">
          <summary className="px-5 py-3 flex items-center gap-2.5 cursor-pointer select-none list-none">
            <HelpCircle size={15} className="text-indigo-primary" />
            <p className="font-black text-navy text-xs uppercase tracking-wider flex-1">Besoin d&apos;aide ? Comprendre ce tableau de bord</p>
            <ChevronRight size={15} className="text-gray-300 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-5 pb-5 pt-1 grid sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-50">
            {[
              { term: 'Annonce en attente', def: 'Vient d\'être déposée par un utilisateur — elle n\'est pas encore visible sur le site tant qu\'elle n\'est pas validée.' },
              { term: 'Annonce signalée', def: 'Un utilisateur a cliqué sur "Signaler" sur cette annonce (contenu suspect, arnaque...). À examiner dans "Signalements".' },
              { term: 'Pare-feu', def: 'Un système automatique qui bloque instantanément les annonces au contenu clairement interdit (armes, drogues, faux documents...), avant même qu\'un humain les voie.' },
              { term: 'Palier Smart / Pro / VIP', def: 'Les 3 abonnements payants pour les professionnels de l\'annuaire, du moins cher (Smart) au plus complet (VIP, avec bannière et photos illimitées).' },
              { term: 'Pros payants', def: 'Pourcentage de professionnels de l\'annuaire qui payent un abonnement (Smart, Pro ou VIP), plutôt que d\'être en compte gratuit.' },
              { term: 'Mode maintenance', def: 'Dans "Paramètres" — masque temporairement le site aux visiteurs (utile pour une intervention technique).' },
            ].map(g => (
              <div key={g.term}>
                <p className="text-xs font-bold text-navy">{g.term}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{g.def}</p>
              </div>
            ))}
          </div>
        </details>

      </div>
    </div>
  )
}
