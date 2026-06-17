'use client'
import { useState } from 'react'
import {
  ArrowLeft, Shield, ShieldOff, CheckCircle, Trash2,
  AlertTriangle, Eye, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'

interface ListingRow {
  id: string
  title: string
  description: string
  categorySlug: string
  neighborhood: string
  price: number | null
  publishedAt: string
  status: string
  blockedReason: string
  images: { url: string }[]
  user: { id: string; name: string; email: string; blocked: boolean }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Armes à feu':             'bg-red-100 text-red-700',
  'Armes de combat':         'bg-red-50 text-red-600',
  'Stupéfiants':             'bg-purple-100 text-purple-700',
  'Prostitution':            'bg-pink-100 text-pink-700',
  'Faux documents':          'bg-amber-100 text-amber-700',
  'Explosifs':               'bg-orange-100 text-orange-700',
  'Médicaments illicites':   'bg-indigo-100 text-indigo-700',
  'Contenu adulte explicite':'bg-rose-100 text-rose-700',
  'Espèces protégées':       'bg-emerald-100 text-emerald-700',
  "Trafic d'organes":        'bg-gray-200 text-gray-700',
}

const CHART_COLORS = [
  'bg-red-500', 'bg-purple-500', 'bg-amber-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
]

export default function AdminParefeuClient({
  initialListings,
  blockedThisMonth,
  byCategory,
}: {
  initialListings: ListingRow[]
  blockedThisMonth: number
  byCategory: { category: string; count: number }[]
}) {
  const categories = useCategories()
  const [listings, setListings]     = useState<ListingRow[]>(initialListings)
  const [loadingId, setLoadingId]   = useState<string | null>(null)
  const [expanded, setExpanded]     = useState<string | null>(null)

  const total     = listings.length
  const maxCount  = byCategory[0]?.count ?? 1

  // Approve a false positive → restore to ACTIVE and clear blockedReason
  const approve = async (id: string) => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/parefeu/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    if (res.ok) setListings(prev => prev.filter(l => l.id !== id))
    setLoadingId(null)
  }

  // Delete permanently
  const deleteListing = async (id: string) => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/parefeu/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete' }),
    })
    if (res.ok) setListings(prev => prev.filter(l => l.id !== id))
    setLoadingId(null)
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ──────────────────────────────────────────── */}
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
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Shield size={18} className="text-orange-primary" />
                Pare-feu de contenu
              </h1>
              <p className="text-xs text-white/40">Annonces bloquées automatiquement · {total} en attente de traitement</p>
            </div>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 rounded-xl px-3 py-2 text-sm text-amber-300 font-semibold">
              <AlertTriangle size={14} />
              {total} à traiter
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI + catégories ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* KPI cards */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Shield size={16} className="text-red-500" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bloquées au total</span>
              </div>
              <p className="text-4xl font-black text-navy leading-none">{total}</p>
              <p className="text-xs text-gray-400 mt-1">annonces interceptées par le pare-feu</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                <Calendar size={14} className="text-amber-600" />
              </div>
              <p className="text-2xl font-black text-navy">{blockedThisMonth}</p>
              <p className="text-xs text-gray-400 mt-0.5">ce mois-ci</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
                <ShieldOff size={14} className="text-purple-600" />
              </div>
              <p className="text-2xl font-black text-navy">{byCategory.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">catégories actives</p>
            </div>
          </div>

          {/* Category chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Répartition par catégorie</p>
            {byCategory.length === 0 ? (
              <p className="text-gray-300 text-sm text-center py-6">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {byCategory.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[c.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.category}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CHART_COLORS[i % CHART_COLORS.length]}`}
                        style={{ width: `${Math.round((c.count / maxCount) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-navy tabular-nums w-6 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Explication ─────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-3">
          <Shield size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Comment fonctionne le pare-feu ?</strong> Chaque annonce soumise (même en mode publication automatique) est analysée automatiquement. Si du contenu interdit est détecté (armes, drogues, prostitution…), l&apos;annonce est bloquée avant publication et l&apos;utilisateur voit un message d&apos;erreur explicite. <br />
            Ici vous pouvez <strong>approuver</strong> un faux positif (l&apos;annonce sera publiée) ou <strong>supprimer</strong> définitivement une annonce malveillante.
          </div>
        </div>

        {/* ── Liste ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {listings.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Shield size={28} className="text-emerald-500" />
              </div>
              <p className="font-bold text-navy">Pare-feu au vert</p>
              <p className="text-gray-400 text-sm">Aucune annonce bloquée en attente de traitement.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[48px_1fr_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-50">
                <div />
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Annonce bloquée · Auteur · Motif</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
              </div>

              <div className="divide-y divide-gray-50">
                {listings.map(l => {
                  const cat          = categories.find(c => c.slug === l.categorySlug)
                  const thumb        = l.images[0]?.url
                  const isProcessing = loadingId === l.id
                  const isExpanded   = expanded === l.id
                  const date         = new Date(l.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })

                  return (
                    <div
                      key={l.id}
                      className={`border-l-2 border-red-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                        {/* Thumb */}
                        <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-lg mt-0.5">
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <span>{cat?.icon ?? '📦'}</span>}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-navy text-sm">{l.title}</p>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[l.blockedReason] ?? 'bg-gray-100 text-gray-600'}`}>
                              🚫 {l.blockedReason}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {cat?.icon} {cat?.label} · {l.neighborhood}
                            {l.price != null ? ` · ${l.price.toLocaleString('fr-FR')} €` : ''}
                            <span className="text-gray-300 mx-1">·</span>
                            {date}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 flex-shrink-0">
                              {l.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-navy">{l.user.name}</span>
                            <span className="text-xs text-gray-400">{l.user.email}</span>
                            {l.user.blocked && (
                              <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-1.5 py-0.5 rounded-full">Bloqué</span>
                            )}
                          </div>

                          {/* Expand description */}
                          <button
                            onClick={() => setExpanded(isExpanded ? null : l.id)}
                            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-navy transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            {isExpanded ? 'Masquer la description' : 'Voir la description'}
                          </button>

                          {isExpanded && (
                            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600 leading-relaxed border border-gray-100">
                              {l.description}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <a
                            href={`/annonces/${l.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                            title="Voir l'annonce"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => approve(l.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[11px] font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-40"
                            title="Faux positif — approuver et publier"
                          >
                            <CheckCircle size={11} /> Approuver
                          </button>
                          <button
                            onClick={() => deleteListing(l.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={11} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Legend ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Légende</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Eye size={12} />, label: 'Voir', desc: "Consulte l'annonce (statut REJECTED, invisible publiquement)" },
              { icon: <CheckCircle size={12} />, label: 'Approuver', desc: 'Faux positif — publie l\'annonce et supprime le blocage' },
              { icon: <Trash2 size={12} />, label: 'Supprimer', desc: 'Suppression définitive de l\'annonce (DELETED)' },
            ].map(item => (
              <div key={item.label} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-navy">{item.label}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
