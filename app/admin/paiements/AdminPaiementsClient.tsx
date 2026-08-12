'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Sparkles, Star, Crown, TrendingUp, CheckCircle, ExternalLink, Pencil } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'

interface PaymentRow {
  id: string
  name: string
  slug: string
  logo: string | null
  category: string
  city: string
  verified: boolean
  tier: string
  subscriptionStatus: string | null
  subscriptionPeriod: string | null
  subscriptionCurrentPeriodEnd: string | null
  giftTierExpiresAt: string | null
  stripeSubscriptionId: string | null
}

const TIER_LABELS: Record<string, string> = { PREMIUM: 'Smart', PREMIUM_PLUS: 'Pro', VIP: 'VIP' }
const TIER_COLORS: Record<string, string> = {
  PREMIUM:      'bg-indigo-100 text-indigo-700',
  PREMIUM_PLUS: 'bg-orange-100 text-orange-700',
  VIP:          'bg-navy/10 text-navy',
}
const TIER_RING: Record<string, string> = {
  PREMIUM:      'border-indigo-200',
  PREMIUM_PLUS: 'border-orange-200',
  VIP:          'border-navy/30',
}

type TierFilter = 'ALL' | 'PREMIUM' | 'PREMIUM_PLUS' | 'VIP'

export default function AdminPaiementsClient({
  initialPros, counts, arr,
}: {
  initialPros: PaymentRow[]
  counts: { PREMIUM: number; PREMIUM_PLUS: number; VIP: number; TOTAL_PAYING: number }
  arr: number
}) {
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL')

  const filtered = useMemo(() => {
    const lq = query.toLowerCase()
    return initialPros
      .filter(p => tierFilter === 'ALL' || p.tier === tierFilter)
      .filter(p => !lq || p.name.toLowerCase().includes(lq) || p.city.toLowerCase().includes(lq))
  }, [initialPros, query, tierFilter])

  const statCards: { key: TierFilter; label: string; value: number | string; icon: React.ReactNode; iconBg: string; iconColor: string }[] = [
    { key: 'ALL', label: 'Abonnements payants', value: counts.TOTAL_PAYING, icon: <CheckCircle size={17} />, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { key: 'PREMIUM', label: 'Smart', value: counts.PREMIUM, icon: <Sparkles size={17} />, iconBg: 'bg-indigo-soft', iconColor: 'text-indigo-primary' },
    { key: 'PREMIUM_PLUS', label: 'Pro', value: counts.PREMIUM_PLUS, icon: <Star size={17} />, iconBg: 'bg-orange-soft', iconColor: 'text-orange-primary' },
    { key: 'VIP', label: 'VIP', value: counts.VIP, icon: <Crown size={17} />, iconBg: 'bg-navy/5', iconColor: 'text-navy' },
  ]

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-navy tracking-tight">Paiements</h1>
        <p className="text-sm text-gray-400 mt-0.5">Abonnements et revenus des professionnels.</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(s => {
          const isActive = tierFilter === s.key
          return (
            <button
              key={s.key}
              onClick={() => setTierFilter(s.key)}
              className={`text-left bg-white rounded-xl border shadow-sm p-4 transition-colors ${
                isActive ? 'border-orange-primary ring-1 ring-orange-primary/30' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${s.iconBg}`}>
                <span className={s.iconColor}>{s.icon}</span>
              </div>
              <p className="text-xl font-black text-navy leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1.5">{s.label}</p>
            </button>
          )
        })}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-emerald-50">
            <TrendingUp size={17} className="text-emerald-600" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{arr.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-gray-400 mt-1.5">Revenu annuel estimé (ARR)</p>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom, ville…"
          className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 bg-white"
        />
      </div>

      {/* ── List ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-xl">💳</div>
            <p className="text-gray-400 text-sm">
              {initialPros.length === 0 ? 'Aucun abonnement payant pour le moment.' : 'Aucun résultat pour ces filtres.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_1fr_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-50">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Professionnel</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Tier</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Statut abonnement</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(p => {
                const cat = proCategories.find(c => c.slug === p.category)
                return (
                  <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors border-l-2 ${TIER_RING[p.tier]}`}>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {p.logo
                        ? <img src={p.logo} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg">{cat?.icon ?? '🏢'}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-navy text-sm">{p.name}</p>
                        {p.verified && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle size={8} /> Vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{cat?.label ?? p.category} · {p.city}</p>
                    </div>

                    <div className="hidden sm:block">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TIER_COLORS[p.tier]}`}>
                        {TIER_LABELS[p.tier] ?? p.tier}
                      </span>
                    </div>

                    <div className="hidden sm:block text-xs text-gray-500">
                      {p.stripeSubscriptionId
                        ? <>
                            <span className="font-semibold text-navy">{p.subscriptionStatus ?? 'actif'}</span>
                            {p.subscriptionPeriod && <> · {p.subscriptionPeriod}</>}
                            {p.subscriptionCurrentPeriodEnd && <> · renouvelle le {new Date(p.subscriptionCurrentPeriodEnd).toLocaleDateString('fr-FR')}</>}
                          </>
                        : p.giftTierExpiresAt
                          ? <span className="text-indigo-500 font-medium">⏳ Offert · expire le {new Date(p.giftTierExpiresAt).toLocaleDateString('fr-FR')}</span>
                          : <span className="text-gray-400">Palier offert manuellement</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/professionnels/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-navy flex items-center justify-center transition-colors"
                        title="Voir la fiche publique"
                      >
                        <ExternalLink size={13} />
                      </a>
                      <Link
                        href="/admin/professionnels"
                        className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center transition-colors"
                        title="Gérer dans Professionnels"
                      >
                        <Pencil size={13} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
