'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CheckCircle, XCircle, Eye, ToggleLeft, ToggleRight,
  Clock, Flag, ShieldOff, ShieldCheck, Search, Tag, Package,
  Timer, Layers, ChevronLeft, ChevronRight, X, Loader2,
} from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import type { CategoryTree } from '@/types'

function flattenCategories(nodes: CategoryTree[]): CategoryTree[] {
  return nodes.flatMap(n => [n, ...flattenCategories(n.children)])
}

interface ListingRow {
  id: string
  title: string
  categorySlug: string
  neighborhood: string
  price: number | null
  publishedAt: string
  status: string
  images: { url: string }[]
  user: { id: string; name: string; email: string; blocked: boolean }
}

interface ReportedListing extends ListingRow {
  reports: { reason: string; createdAt: string }[]
  _count: { reports: number }
}

const TABS = ['PENDING', 'ACTIVE', 'SOLD', 'EXPIRED', 'REJECTED', 'REPORTED'] as const
type Tab = typeof TABS[number]

const TAB_LABEL: Record<Tab, string> = {
  PENDING: 'En attente', ACTIVE: 'Publiées', SOLD: 'Vendues',
  EXPIRED: 'Expirées', REJECTED: 'Refusées', REPORTED: 'Signalées',
}

const TAB_ICON: Record<Tab, React.ReactNode> = {
  PENDING: <Clock size={13} />, ACTIVE: <CheckCircle size={13} />, SOLD: <Package size={13} />,
  EXPIRED: <Timer size={13} />, REJECTED: <XCircle size={13} />, REPORTED: <Flag size={13} />,
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700',
  ACTIVE:   'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-600',
  SOLD:     'bg-indigo-soft text-indigo-primary',
  EXPIRED:  'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', ACTIVE: 'Publiée', REJECTED: 'Refusée', SOLD: 'Vendue', EXPIRED: 'Expirée',
}

type Counts = Record<'TOTAL' | Tab, number>

export default function AdminAnnoncesClient({
  initialListings,
  initialTotal,
  autoPublish: initialAutoPublish,
  counts: initialCounts,
}: {
  initialListings: ListingRow[]
  initialTotal: number
  autoPublish: boolean
  counts: Counts
}) {
  const categories = useCategories()
  const flatCategories = flattenCategories(categories)

  const [listings, setListings]             = useState<ListingRow[]>(initialListings)
  const [reportedListings, setReported]     = useState<ReportedListing[]>([])
  const [reportedLoaded, setReportedLoaded] = useState(false)
  const [autoPublish, setAutoPublish]       = useState(initialAutoPublish)
  const [tab, setTab]                       = useState<Tab>('PENDING')
  const [togglingAuto, setTogglingAuto]     = useState(false)
  const [loadingId, setLoadingId]           = useState<string | null>(null)
  const [counts, setCounts]                 = useState<Counts>(initialCounts)

  const [query, setQuery]     = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(Math.max(1, Math.ceil(initialTotal / 20)))
  const [total, setTotal]     = useState(initialTotal)
  const [listLoading, setListLoading] = useState(false)
  const tabRef = useRef(tab)
  useEffect(() => { tabRef.current = tab }, [tab])

  const toggleAutoPublish = async () => {
    setTogglingAuto(true)
    const next = !autoPublish
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoPublish: next }),
    })
    setAutoPublish(next)
    setTogglingAuto(false)
  }

  const refreshCounts = useCallback(async () => {
    const res = await fetch('/api/admin/annonces/counts')
    if (res.ok) setCounts(await res.json())
  }, [])

  const loadListings = useCallback(async (status: Tab, q: string, cat: string, p: number) => {
    if (status === 'REPORTED') return
    setListLoading(true)
    const params = new URLSearchParams({ status, page: String(p) })
    if (q) params.set('q', q)
    if (cat) params.set('cat', cat)
    const res = await fetch(`/api/admin/annonces?${params.toString()}`)
    const data = await res.json()
    setListings(data.listings)
    setTotal(data.total)
    setPages(data.pages)
    setListLoading(false)
  }, [])

  const loadReported = useCallback(async () => {
    setListLoading(true)
    const res = await fetch('/api/admin/signalements')
    const data = await res.json()
    setReported(data)
    setReportedLoaded(true)
    setListLoading(false)
  }, [])

  const switchTab = (status: Tab) => {
    setTab(status)
    setPage(1)
    if (status === 'REPORTED') {
      if (!reportedLoaded) loadReported()
      return
    }
    loadListings(status, query, catFilter, 1)
  }

  // Debounced re-fetch when search / category filter change (state updates live in the
  // timeout callback, not the effect body, so this doesn't trigger cascading synchronous renders).
  useEffect(() => {
    const t = setTimeout(() => {
      if (tabRef.current === 'REPORTED') return
      setPage(1)
      loadListings(tabRef.current, query, catFilter, 1)
    }, 300)
    return () => clearTimeout(t)
  }, [query, catFilter, loadListings])

  const goToPage = (p: number) => {
    setPage(p)
    loadListings(tab, query, catFilter, p)
  }

  const toggleBlock = async (userId: string, blocked: boolean) => {
    await fetch(`/api/admin/utilisateurs/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked }),
    })
    if (tab === 'REPORTED') {
      setReported(prev => prev.map(l => l.user.id === userId ? { ...l, user: { ...l.user, blocked } } : l))
    } else {
      setListings(prev => prev.map(l => l.user.id === userId ? { ...l, user: { ...l.user, blocked } } : l))
    }
  }

  const moderate = async (id: string, status: 'ACTIVE' | 'REJECTED' | 'SOLD' | 'PENDING') => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/annonces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setListings(prev => prev.filter(l => l.id !== id))
      setReported(prev => prev.filter(l => l.id !== id))
      refreshCounts()
    }
    setLoadingId(null)
  }

  const activeList = tab === 'REPORTED' ? reportedListings : listings
  const statCards: { key: 'TOTAL' | Tab; label: string; icon: React.ReactNode; iconBg: string; iconColor: string }[] = [
    { key: 'TOTAL', label: 'Total', icon: <Layers size={17} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { key: 'PENDING', label: 'En attente', icon: <Clock size={17} />, iconBg: 'bg-orange-soft', iconColor: 'text-orange-primary' },
    { key: 'ACTIVE', label: 'Publiées', icon: <CheckCircle size={17} />, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { key: 'SOLD', label: 'Vendues', icon: <Package size={17} />, iconBg: 'bg-indigo-soft', iconColor: 'text-indigo-primary' },
    { key: 'EXPIRED', label: 'Expirées', icon: <Timer size={17} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { key: 'REJECTED', label: 'Refusées', icon: <XCircle size={17} />, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    { key: 'REPORTED', label: 'Signalées', icon: <Flag size={17} />, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  ]

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Annonces</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez toutes les annonces déposées sur la plateforme.</p>
        </div>
        <button
          onClick={toggleAutoPublish}
          disabled={togglingAuto}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 shadow-sm ${
            autoPublish
              ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          {autoPublish
            ? <><ToggleRight size={18} /> Auto-publication activée</>
            : <><ToggleLeft size={18} /> Auto-publication désactivée</>}
        </button>
      </div>

      {/* ── Mode banner ─────────────────────────────────────── */}
      <div className={`rounded-xl border px-5 py-3 flex items-center gap-3 text-sm font-medium ${
        autoPublish ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
      }`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${autoPublish ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {autoPublish
          ? 'Les nouvelles annonces sont publiées immédiatement après soumission.'
          : 'Les nouvelles annonces passent en attente de validation avant publication.'}
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map(s => {
          const clickable = s.key !== 'TOTAL'
          const isActive = clickable && tab === s.key
          return (
            <button
              key={s.key}
              onClick={() => clickable && switchTab(s.key as Tab)}
              disabled={!clickable}
              className={`text-left bg-white rounded-xl border shadow-sm p-4 transition-colors ${
                isActive ? 'border-orange-primary ring-1 ring-orange-primary/30' : 'border-gray-100 hover:border-gray-200'
              } ${!clickable ? 'cursor-default' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${s.iconBg}`}>
                <span className={s.iconColor}>{s.icon}</span>
              </div>
              <p className="text-xl font-black text-navy leading-none">{counts[s.key]}</p>
              <p className="text-xs text-gray-400 mt-1.5">{s.label}</p>
            </button>
          )
        })}
      </div>

      {/* ── Filters: tabs + search + category ──────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(s => (
          <button
            key={s}
            onClick={() => switchTab(s)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              tab === s ? 'border-orange-primary bg-orange-soft text-orange-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            {TAB_ICON[s]} {TAB_LABEL[s]}
            <span className={`text-[10px] font-bold rounded-full px-1.5 ${tab === s ? 'bg-orange-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              {counts[s]}
            </span>
          </button>
        ))}

        {tab !== 'REPORTED' && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un titre…"
                className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 w-48"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 bg-white cursor-pointer max-w-[180px]"
              >
                <option value="">Toutes catégories</option>
                {flatCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
        {listLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <Loader2 size={20} className="animate-spin text-orange-primary" />
          </div>
        )}

        {activeList.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
              {tab === 'PENDING' ? '🎉' : tab === 'ACTIVE' ? '📋' : tab === 'REPORTED' ? '🛡' : tab === 'SOLD' ? '📦' : tab === 'EXPIRED' ? '⏱' : '🗑'}
            </div>
            <p className="text-gray-400 text-sm">
              {tab === 'PENDING' ? 'Aucune annonce en attente — tout est traité !' : 'Aucune annonce dans cet onglet.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-[56px_1fr_auto] sm:grid-cols-[56px_1fr_160px_auto] items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Annonce</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Auteur</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
            </div>

            <div className="divide-y divide-gray-50">
              {tab === 'REPORTED'
                ? (reportedListings as ReportedListing[]).map(l => {
                    const cat           = flatCategories.find(c => c.slug === l.categorySlug)
                    const thumb         = l.images[0]?.url
                    const isProcessing  = loadingId === l.id
                    const reasonCounts  = l.reports.reduce<Record<string, number>>((acc, r) => {
                      acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc
                    }, {})

                    return (
                      <div key={l.id} className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-50/50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-xl">
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <span>{cat?.icon ?? '📦'}</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-navy text-sm truncate">{l.title}</p>
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                              <Flag size={9} />{l._count.reports} signalement{l._count.reports > 1 ? 's' : ''}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-500'}`}>
                              {STATUS_LABEL[l.status] ?? l.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1.5">{cat?.icon} {cat?.label} · {l.neighborhood}</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(reasonCounts).map(([reason, count]) => (
                              <span key={reason} className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full">
                                {reason}{count > 1 ? ` ×${count}` : ''}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5">
                            Par <span className={`font-semibold ${l.user.blocked ? 'text-red-500 line-through' : 'text-navy'}`}>{l.user.name}</span>
                            {l.user.blocked && <span className="ml-1.5 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Bloqué</span>}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <a
                            href={`/annonces/${l.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => moderate(l.id, 'REJECTED')}
                            disabled={isProcessing || l.status === 'REJECTED'}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[11px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                          >
                            <XCircle size={11} /> Retirer
                          </button>
                          <button
                            onClick={() => toggleBlock(l.user.id, !l.user.blocked)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-[11px] font-semibold transition-colors ${
                              l.user.blocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {l.user.blocked
                              ? <><ShieldCheck size={11} /> Débloquer</>
                              : <><ShieldOff size={11} /> Bloquer</>}
                          </button>
                        </div>
                      </div>
                    )
                  })
                : listings.map(l => {
                    const cat          = flatCategories.find(c => c.slug === l.categorySlug)
                    const thumb        = l.images[0]?.url
                    const isProcessing = loadingId === l.id
                    const date         = new Date(l.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })

                    return (
                      <div key={l.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                        <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-lg">
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <span>{cat?.icon ?? '📦'}</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="font-bold text-navy text-sm truncate">{l.title}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-500'}`}>
                              {STATUS_LABEL[l.status] ?? l.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {cat?.icon} {cat?.label ?? l.categorySlug} · {l.neighborhood}
                            {l.price != null && ` · ${l.price.toLocaleString('fr-FR')} €`}
                          </p>
                          <p className="text-xs text-gray-300 mt-0.5">
                            <span className="text-gray-500 font-medium">{l.user.name}</span> · {date}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`/annonces/${l.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                            title="Voir l'annonce"
                          >
                            <Eye size={14} />
                          </a>
                          {tab === 'PENDING' && (
                            <>
                              <button
                                onClick={() => moderate(l.id, 'ACTIVE')}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle size={12} /> Approuver
                              </button>
                              <button
                                onClick={() => moderate(l.id, 'REJECTED')}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={12} /> Refuser
                              </button>
                            </>
                          )}
                          {tab === 'REJECTED' && (
                            <button
                              onClick={() => moderate(l.id, 'ACTIVE')}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={12} /> Republier
                            </button>
                          )}
                          {tab === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => moderate(l.id, 'SOLD')}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-soft text-indigo-primary border border-indigo-100 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                              >
                                <Package size={12} /> Marquer vendue
                              </button>
                              <button
                                onClick={() => moderate(l.id, 'REJECTED')}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={12} /> Dépublier
                              </button>
                            </>
                          )}
                          {(tab === 'SOLD' || tab === 'EXPIRED') && (
                            <button
                              onClick={() => moderate(l.id, 'ACTIVE')}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={12} /> Réactiver
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      {tab !== 'REPORTED' && pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{total} annonce{total > 1 ? 's' : ''} au total</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-500 px-2 font-medium">Page {page} / {pages}</span>
            <button
              onClick={() => goToPage(Math.min(pages, page + 1))}
              disabled={page >= pages}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
