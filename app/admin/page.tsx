import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getAdminSiteId } from '@/lib/site'
import {
  ClipboardList, Users, Star, BarChart3, Flag, Shield,
  AlertTriangle, Clock, CheckCircle, TrendingUp, ChevronRight, BookOpen, Tags, Settings2,
  HelpCircle, Sparkles, ArrowRight,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const adminName  = (session.user as { name?: string }).name ?? 'Admin'
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const dayLabel   = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const siteId     = await getAdminSiteId()

  const [
    pendingCount, activeCount, soldCount, newListingsWeek,
    usersCount, newUsersMonth, blockedUsers,
    prosCount, premiumPros, plusPros, vipPros,
    reportsCount, reportedListingsCount, firewallBlockedCount,
    blogTotal, blogPublished, categoriesCount,
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
  ])

  const freePros   = prosCount - premiumPros - plusPros - vipPros
  const payingPros = premiumPros + plusPros + vipPros

  // ── "À faire aujourd'hui" — plain-language, direct-link action items ──────
  const todoItems = [
    pendingCount > 0 && {
      icon: <Clock size={16} />,
      text: `${pendingCount} annonce${pendingCount > 1 ? 's' : ''} en attente de validation`,
      hint: 'Elles ne sont pas encore visibles par les visiteurs',
      href: '/admin/annonces',
      cta: 'Valider',
      color: 'text-amber-600', bg: 'bg-amber-50',
    },
    reportedListingsCount > 0 && {
      icon: <AlertTriangle size={16} />,
      text: `${reportedListingsCount} annonce${reportedListingsCount > 1 ? 's' : ''} signalée${reportedListingsCount > 1 ? 's' : ''} par des utilisateurs`,
      hint: 'À examiner pour décider de les garder ou de les retirer',
      href: '/admin/signalements',
      cta: 'Examiner',
      color: 'text-red-500', bg: 'bg-red-50',
    },
    firewallBlockedCount > 0 && {
      icon: <Shield size={16} />,
      text: `${firewallBlockedCount} annonce${firewallBlockedCount > 1 ? 's' : ''} bloquée${firewallBlockedCount > 1 ? 's' : ''} automatiquement`,
      hint: 'Contenu suspect détecté (armes, faux documents...) — à vérifier',
      href: '/admin/parefeu',
      cta: 'Vérifier',
      color: 'text-purple-600', bg: 'bg-purple-50',
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string; hint: string; href: string; cta: string; color: string; bg: string }[]

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Panneau d&apos;administration · {dayLabel}</p>
          <h1 className="text-2xl font-black tracking-tight">Bonjour, {adminName} 👋</h1>
          <p className="text-sm text-white/40 mt-0.5">Voici l&apos;état de 1000Click en {monthLabel}.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── À faire aujourd'hui ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
            <Sparkles size={16} className="text-orange-primary" />
            <p className="font-black text-navy text-sm">À faire aujourd&apos;hui</p>
          </div>
          {todoItems.length === 0 ? (
            <div className="px-6 py-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle size={17} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Tout est à jour ✓</p>
                <p className="text-xs text-gray-400 mt-0.5">Rien ne nécessite votre attention pour le moment.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todoItems.map(item => (
                <Link
                  key={item.text}
                  href={item.href}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <span className={item.color}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.cta} <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Hero KPIs ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              href: '/admin/annonces',
              label: 'Annonces en attente',
              value: pendingCount,
              icon: <Clock size={18} />,
              color: pendingCount > 0 ? 'text-amber-600' : 'text-gray-400',
              bg: pendingCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
              sub: pendingCount > 0 ? 'À modérer' : 'Tout traité',
              urgent: pendingCount > 0,
            },
            {
              href: '/admin/signalements',
              label: 'Annonces signalées',
              value: reportedListingsCount,
              icon: <AlertTriangle size={18} />,
              color: reportedListingsCount > 0 ? 'text-red-500' : 'text-gray-400',
              bg: reportedListingsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
              sub: reportedListingsCount > 0 ? `${reportsCount} signalement${reportsCount > 1 ? 's' : ''}` : 'Aucun actif',
              urgent: reportedListingsCount > 0,
            },
            {
              href: '/admin/utilisateurs',
              label: 'Utilisateurs inscrits',
              value: usersCount,
              icon: <Users size={18} />,
              color: 'text-indigo-primary',
              bg: 'bg-indigo-soft',
              sub: `+${newUsersMonth} ce mois`,
              urgent: false,
            },
            {
              href: '/admin/annonces',
              label: 'Annonces actives',
              value: activeCount,
              icon: <CheckCircle size={18} />,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              sub: `${soldCount} vendues · ${newListingsWeek} cette semaine`,
              urgent: false,
            },
          ].map(k => (
            <Link
              key={k.label}
              href={k.href}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md p-5 flex flex-col gap-3 transition-all ${k.urgent ? 'border-amber-200' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.bg}`}>
                  <span className={k.color}>{k.icon}</span>
                </div>
                {k.urgent && <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 animate-pulse" />}
              </div>
              <div>
                <p className="text-3xl font-black text-navy leading-none mb-1">{k.value}</p>
                <p className="text-sm text-gray-500 font-medium">{k.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Navigation modules ─────────────────────────────── */}
        {([
          {
            group: 'Contenu du site',
            groupDesc: 'Ce que les visiteurs voient et publient',
            modules: [
              {
                href: '/admin/annonces',
                icon: <ClipboardList size={22} />,
                label: 'Modération annonces',
                desc: 'Valider ou refuser les annonces déposées par les utilisateurs',
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
                href: '/admin/signalements',
                icon: <Flag size={22} />,
                label: 'Signalements',
                desc: 'Annonces qu\'un utilisateur a jugées problématiques',
                color: reportedListingsCount > 0 ? 'text-red-500' : 'text-gray-400',
                bg: reportedListingsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
                badge: reportedListingsCount > 0 ? reportedListingsCount : null,
                badgeColor: 'bg-red-500',
                items: [
                  { label: 'Annonces signalées', value: reportedListingsCount, dot: reportedListingsCount > 0 ? 'bg-red-400' : 'bg-gray-200' },
                  { label: 'Total signalements', value: reportsCount, dot: 'bg-amber-400' },
                ],
              },
              {
                href: '/admin/parefeu',
                icon: <Shield size={22} />,
                label: 'Pare-feu automatique',
                desc: 'Contenu suspect bloqué automatiquement avant publication',
                color: firewallBlockedCount > 0 ? 'text-amber-600' : 'text-gray-400',
                bg: firewallBlockedCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
                badge: firewallBlockedCount > 0 ? firewallBlockedCount : null,
                badgeColor: 'bg-amber-500',
                items: [
                  { label: 'Bloquées automatiquement', value: firewallBlockedCount, dot: firewallBlockedCount > 0 ? 'bg-amber-400' : 'bg-gray-200' },
                ],
              },
            ],
          },
          {
            group: 'Communauté',
            groupDesc: 'Les personnes inscrites sur le site',
            modules: [
              {
                href: '/admin/utilisateurs',
                icon: <Users size={22} />,
                label: 'Utilisateurs',
                desc: 'Comptes particuliers inscrits sur la plateforme',
                color: 'text-indigo-primary',
                bg: 'bg-indigo-soft',
                badge: blockedUsers > 0 ? blockedUsers : null,
                badgeColor: 'bg-red-400',
                items: [
                  { label: 'Total', value: usersCount, dot: 'bg-indigo-400' },
                  { label: 'Nouveaux ce mois', value: newUsersMonth, dot: 'bg-emerald-400' },
                  { label: 'Bloqués', value: blockedUsers, dot: 'bg-red-400' },
                ],
              },
              {
                href: '/admin/professionnels',
                icon: <Star size={22} />,
                label: 'Professionnels',
                desc: 'Fiches de l\'annuaire pro et leurs abonnements',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'Gratuit', value: freePros, dot: 'bg-gray-300' },
                  { label: 'Smart', value: premiumPros, dot: 'bg-indigo-400' },
                  { label: 'Pro', value: plusPros, dot: 'bg-orange-primary' },
                  { label: 'VIP', value: vipPros, dot: 'bg-navy' },
                ],
              },
            ],
          },
          {
            group: 'Réglages & contenu éditorial',
            groupDesc: 'Configuration du site et pages annexes',
            modules: [
              {
                href: '/admin/statistiques',
                icon: <BarChart3 size={22} />,
                label: 'Statistiques',
                desc: 'Vue d\'ensemble détaillée de l\'activité du site',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'Nouveaux/mois', value: newUsersMonth, dot: 'bg-emerald-400' },
                  { label: 'Pros payants', value: payingPros, dot: 'bg-blue-400' },
                  { label: 'Annonces/semaine', value: newListingsWeek, dot: 'bg-indigo-400' },
                ],
              },
              {
                href: '/admin/blog',
                icon: <BookOpen size={22} />,
                label: 'Blog',
                desc: 'Articles publiés sur le blog du site',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'Total articles', value: blogTotal, dot: 'bg-pink-400' },
                  { label: 'Publiés', value: blogPublished, dot: 'bg-emerald-400' },
                  { label: 'Brouillons', value: blogTotal - blogPublished, dot: 'bg-gray-300' },
                ],
              },
              {
                href: '/admin/categories',
                icon: <Tags size={22} />,
                label: 'Catégories',
                desc: 'Rubriques dans lesquelles les annonces sont classées',
                color: 'text-teal-600',
                bg: 'bg-teal-50',
                badge: null,
                badgeColor: '',
                items: [
                  { label: 'Total', value: categoriesCount, dot: 'bg-teal-400' },
                ],
              },
              {
                href: '/admin/parametres',
                icon: <Settings2 size={22} />,
                label: 'Paramètres',
                desc: 'Images d\'accueil, bannière, mode maintenance...',
                color: 'text-slate-600',
                bg: 'bg-slate-50',
                badge: null,
                badgeColor: '',
                items: [],
              },
            ],
          },
        ] as const).map(section => (
          <div key={section.group}>
            <div className="mb-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{section.group}</p>
              <p className="text-xs text-gray-400 mt-0.5">{section.groupDesc}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.modules.map(m => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
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
                    <p className="font-black text-navy text-sm group-hover:text-orange-primary transition-colors">{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3 leading-relaxed">{m.desc}</p>
                    {m.items.length > 0 && (
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
                    )}
                  </div>
                  <div className={`h-1 ${m.bg}`} />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* ── Quick stats strip ──────────────────────────────── */}
        <div className="bg-navy rounded-2xl px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Pros payants', value: `${prosCount > 0 ? Math.round((payingPros / prosCount) * 100) : 0}%`, sub: `${payingPros} sur ${prosCount}`, icon: <TrendingUp size={14} /> },
            { label: 'Pros référencés', value: prosCount, sub: `${plusPros + vipPros} Pro/VIP`, icon: <Star size={14} /> },
            { label: 'Nouvelles inscriptions', value: newUsersMonth, sub: 'ce mois', icon: <Users size={14} /> },
            { label: 'Annonces en ligne', value: activeCount, sub: `${newListingsWeek} cette semaine`, icon: <CheckCircle size={14} /> },
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

        {/* ── Besoin d'aide ? — glossaire pour une utilisatrice non technique ── */}
        <details className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
          <summary className="px-6 py-4 flex items-center gap-2.5 cursor-pointer select-none list-none">
            <HelpCircle size={16} className="text-indigo-primary" />
            <p className="font-black text-navy text-sm flex-1">Besoin d&apos;aide ? Comprendre ce tableau de bord</p>
            <ChevronRight size={16} className="text-gray-300 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-6 pb-6 pt-1 grid sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-50">
            {[
              { term: 'Annonce en attente', def: 'Vient d\'être déposée par un utilisateur — elle n\'est pas encore visible sur le site tant qu\'elle n\'est pas validée dans "Modération annonces".' },
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
