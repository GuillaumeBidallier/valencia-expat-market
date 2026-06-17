'use client'
import { useState } from 'react'
import {
  CheckCircle, XCircle, Eye, ToggleLeft, ToggleRight,
  Clock, Flag, ShieldOff, ShieldCheck, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'

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

const TABS = ['PENDING', 'ACTIVE', 'REJECTED', 'REPORTED'] as const
type Tab = typeof TABS[number]

const TAB_CONFIG: Record<Tab, { label: string; icon: React.ReactNode; activeClass: string }> = {
  PENDING:  { label: 'En attente',   icon: <Clock size={13} />,       activeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACTIVE:   { label: 'Publiées',     icon: <CheckCircle size={13} />, activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Refusées',     icon: <XCircle size={13} />,     activeClass: 'bg-gray-100 text-gray-600 border-gray-200' },
  REPORTED: { label: 'Signalements', icon: <Flag size={13} />,        activeClass: 'bg-red-50 text-red-600 border-red-200' },
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700',
  ACTIVE:   'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-600',
}

export default function AdminAnnoncesClient({
  initialListings,
  autoPublish: initialAutoPublish,
}: {
  initialListings: ListingRow[]
  autoPublish: boolean
}) {
  const categories = useCategories()
  const [listings, setListings]             = useState<ListingRow[]>(initialListings)
  const [reportedListings, setReported]     = useState<ReportedListing[]>([])
  const [reportedLoaded, setReportedLoaded] = useState(false)
  const [autoPublish, setAutoPublish]       = useState(initialAutoPublish)
  const [tab, setTab]                       = useState<Tab>('PENDING')
  const [togglingAuto, setTogglingAuto]     = useState(false)
  const [loadingId, setLoadingId]           = useState<string | null>(null)

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

  const loadTab = async (status: Tab) => {
    setTab(status)
    if (status === 'REPORTED') {
      if (!reportedLoaded) {
        const res = await fetch('/api/admin/signalements')
        const data = await res.json()
        setReported(data)
        setReportedLoaded(true)
      }
      return
    }
    const res = await fetch(`/api/admin/annonces?status=${status}`)
    const data = await res.json()
    setListings(data)
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

  const moderate = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/annonces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setListings(prev => prev.filter(l => l.id !== id))
      setReported(prev => prev.filter(l => l.id !== id))
    }
    setLoadingId(null)
  }

  const activeList = tab === 'REPORTED' ? reportedListings : listings
  const cfg        = TAB_CONFIG[tab]

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
              <h1 className="text-lg font-black tracking-tight">Modération annonces</h1>
              <p className="text-xs text-white/40">{activeList.length} annonce{activeList.length !== 1 ? 's' : ''} · onglet actif</p>
            </div>
          </div>

          {/* Toggle auto-publish */}
          <button
            onClick={toggleAutoPublish}
            disabled={togglingAuto}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              autoPublish
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            {autoPublish
              ? <><ToggleRight size={18} /> Auto-publication ON</>
              : <><ToggleLeft size={18} /> Auto-publication OFF</>
            }
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Mode banner ─────────────────────────────────────── */}
        <div className={`rounded-2xl border px-5 py-3.5 mb-6 flex items-center gap-3 text-sm font-medium ${
          autoPublish
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${autoPublish ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {autoPublish
            ? 'Les nouvelles annonces sont publiées immédiatement après soumission.'
            : 'Les nouvelles annonces passent en attente de validation avant publication.'}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(s => {
            const c = TAB_CONFIG[s]
            const isActive = tab === s
            return (
              <button
                key={s}
                onClick={() => loadTab(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  isActive ? c.activeClass : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {c.icon}
                {c.label}
              </button>
            )
          })}
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {activeList.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
                {tab === 'PENDING' ? '🎉' : tab === 'ACTIVE' ? '📋' : tab === 'REPORTED' ? '🛡' : '🗑'}
              </div>
              <p className="text-gray-400 text-sm">
                {tab === 'PENDING' ? 'Aucune annonce en attente — tout est traité !' : `Aucune annonce dans cet onglet.`}
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
                      const cat           = categories.find(c => c.slug === l.categorySlug)
                      const thumb         = l.images[0]?.url
                      const isProcessing  = loadingId === l.id
                      const reasonCounts  = l.reports.reduce<Record<string, number>>((acc, r) => {
                        acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc
                      }, {})

                      return (
                        <div key={l.id} className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-50/50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                          {/* Thumb */}
                          <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-xl">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <span>{cat?.icon ?? '📦'}</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-bold text-navy text-sm truncate">{l.title}</p>
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                <Flag size={9} />{l._count.reports} signalement{l._count.reports > 1 ? 's' : ''}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {l.status}
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

                          {/* Actions */}
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
                      const cat          = categories.find(c => c.slug === l.categorySlug)
                      const thumb        = l.images[0]?.url
                      const isProcessing = loadingId === l.id
                      const date         = new Date(l.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })

                      return (
                        <div key={l.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                          {/* Thumb */}
                          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-lg">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <span>{cat?.icon ?? '📦'}</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <p className="font-bold text-navy text-sm truncate">{l.title}</p>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {l.status === 'PENDING' ? 'En attente' : l.status === 'ACTIVE' ? 'Publiée' : 'Refusée'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {cat?.icon} {cat?.label} · {l.neighborhood}
                              {l.price != null && ` · ${l.price.toLocaleString('fr-FR')} €`}
                            </p>
                            <p className="text-xs text-gray-300 mt-0.5">
                              <span className="text-gray-500 font-medium">{l.user.name}</span> · {date}
                            </p>
                          </div>

                          {/* Actions */}
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
                              <button
                                onClick={() => moderate(l.id, 'REJECTED')}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={12} /> Dépublier
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
      </div>
    </div>
  )
}
