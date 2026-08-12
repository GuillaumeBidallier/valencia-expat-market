'use client'
import { useMemo, useState } from 'react'
import {
  Shield, ShieldOff, CheckCircle, Trash2,
  AlertTriangle, Eye, Calendar, ChevronDown, ChevronUp, Search, X,
} from 'lucide-react'
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

// Kept in sync with the rule categories defined in lib/content-firewall.ts
const CATEGORY_RULES_COUNT = 10

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
  const [query, setQuery]           = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const total     = listings.length
  const maxCount  = byCategory[0]?.count ?? 1

  const filtered = useMemo(() => {
    const lq = query.toLowerCase()
    return listings
      .filter(l => !categoryFilter || l.blockedReason === categoryFilter)
      .filter(l => !lq || l.title.toLowerCase().includes(lq) || l.user.name.toLowerCase().includes(lq) || l.user.email.toLowerCase().includes(lq))
  }, [listings, query, categoryFilter])

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
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-orange-primary" />
            Pare-feu de contenu
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Annonces bloquées automatiquement · {total} en attente de traitement.</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-xl px-3 py-2 text-sm font-semibold">
            <AlertTriangle size={14} />
            {total} à traiter
          </div>
        )}
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`text-left bg-white rounded-xl border shadow-sm p-4 transition-colors ${
            categoryFilter === null ? 'border-orange-primary ring-1 ring-orange-primary/30' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-red-50">
            <Shield size={17} className="text-red-500" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{total}</p>
          <p className="text-xs text-gray-400 mt-1.5">Bloquées au total</p>
        </button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-amber-50">
            <Calendar size={17} className="text-amber-600" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{blockedThisMonth}</p>
          <p className="text-xs text-gray-400 mt-1.5">Ce mois-ci</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-purple-50">
            <ShieldOff size={17} className="text-purple-600" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{byCategory.length}</p>
          <p className="text-xs text-gray-400 mt-1.5">Catégories actives</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-navy/5">
            <ShieldOff size={17} className="text-navy" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{CATEGORY_RULES_COUNT}</p>
          <p className="text-xs text-gray-400 mt-1.5">Règles surveillées</p>
        </div>
      </div>

      {/* ── Répartition par catégorie ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Répartition par catégorie</p>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter(null)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
            >
              <X size={11} /> Effacer le filtre
            </button>
          )}
        </div>
        {byCategory.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-6">Aucune donnée</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((c, i) => (
              <button
                key={c.category}
                onClick={() => setCategoryFilter(f => f === c.category ? null : c.category)}
                className={`w-full flex items-center gap-3 rounded-lg -mx-2 px-2 py-1 transition-colors ${
                  categoryFilter === c.category ? 'bg-gray-50' : 'hover:bg-gray-50/60'
                }`}
              >
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
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Explication ─────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex gap-3">
        <Shield size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Comment fonctionne le pare-feu ?</strong> Chaque annonce soumise (même en mode publication automatique) est analysée automatiquement. Si du contenu interdit est détecté (armes, drogues, prostitution…), l&apos;annonce est bloquée avant publication et l&apos;utilisateur voit un message d&apos;erreur explicite. <br />
          Ici vous pouvez <strong>approuver</strong> un faux positif (l&apos;annonce sera publiée) ou <strong>supprimer</strong> définitivement une annonce malveillante.
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par titre ou auteur…"
          className="w-full pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 bg-white"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Liste ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            {listings.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Shield size={28} className="text-emerald-500" />
                </div>
                <p className="font-bold text-navy">Pare-feu au vert</p>
                <p className="text-gray-400 text-sm">Aucune annonce bloquée en attente de traitement.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">🔍</div>
                <p className="font-bold text-navy">Aucun résultat</p>
                <p className="text-gray-400 text-sm">Essayez une autre recherche ou un autre filtre.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[48px_1fr_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-50">
              <div />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Annonce bloquée · Auteur · Motif</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map(l => {
                const cat          = categories.find(c => c.slug === l.categorySlug)
                  ?? categories.flatMap(r => r.children).find(c => c.slug === l.categorySlug)
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
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
  )
}
