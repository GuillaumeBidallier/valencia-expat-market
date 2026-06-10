'use client'
import { useState, useMemo } from 'react'
import {
  ArrowLeft, Flag, Eye, XCircle, CheckCircle,
  ShieldOff, ShieldCheck, Trash2, AlertTriangle, Search,
} from 'lucide-react'
import Link from 'next/link'
import { categories } from '@/lib/categories'

interface ReportRow {
  reason: string
  createdAt: string
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
  reports: ReportRow[]
  reportCount: number
}

const REASON_COLORS: Record<string, string> = {
  'Contenu inapproprié': 'bg-purple-50 text-purple-600 border-purple-100',
  'Arnaque ou fraude':   'bg-red-50 text-red-600 border-red-100',
  'Annonce incorrecte':  'bg-amber-50 text-amber-600 border-amber-100',
  'Spam ou doublon':     'bg-gray-50 text-gray-500 border-gray-200',
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700',
  ACTIVE:   'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-600',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', ACTIVE: 'Publiée', REJECTED: 'Refusée',
}

export default function AdminSignalementsClient({ initialListings }: { initialListings: ListingRow[] }) {
  const [listings, setListings]   = useState<ListingRow[]>(initialListings)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [q, setQ]                 = useState('')

  const filtered = useMemo(() => {
    const lq = q.toLowerCase()
    return lq
      ? listings.filter(l => l.title.toLowerCase().includes(lq) || l.user.name.toLowerCase().includes(lq))
      : listings
  }, [listings, q])

  const totalReports     = listings.reduce((s, l) => s + l.reportCount, 0)
  const blockedAuthors   = new Set(listings.filter(l => l.user.blocked).map(l => l.user.id)).size
  const highPriority     = listings.filter(l => l.reportCount >= 3).length

  // Moderate listing status
  const moderate = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/annonces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    setLoadingId(null)
  }

  // Dismiss all reports for a listing
  const dismiss = async (id: string) => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/signalements/${id}`, { method: 'DELETE' })
    if (res.ok) setListings(prev => prev.filter(l => l.id !== id))
    setLoadingId(null)
  }

  // Block / unblock user
  const toggleBlock = async (userId: string, blocked: boolean) => {
    await fetch(`/api/admin/utilisateurs/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked }),
    })
    setListings(prev => prev.map(l =>
      l.user.id === userId ? { ...l, user: { ...l.user, blocked } } : l
    ))
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
              <h1 className="text-lg font-black tracking-tight">Signalements</h1>
              <p className="text-xs text-white/40">{listings.length} annonce{listings.length !== 1 ? 's' : ''} signalée{listings.length !== 1 ? 's' : ''} · {totalReports} signalement{totalReports !== 1 ? 's' : ''} total</p>
            </div>
          </div>
          {listings.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/20 rounded-xl px-3 py-2 text-sm text-red-300 font-semibold">
              <AlertTriangle size={14} />
              {listings.length} à traiter
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Annonces signalées',
              value: listings.length,
              icon: <Flag size={18} />,
              color: listings.length > 0 ? 'text-red-500' : 'text-gray-400',
              bg: listings.length > 0 ? 'bg-red-50' : 'bg-gray-50',
              sub: 'À traiter',
            },
            {
              label: 'Signalements totaux',
              value: totalReports,
              icon: <AlertTriangle size={18} />,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              sub: 'Tous motifs confondus',
            },
            {
              label: 'Haute priorité',
              value: highPriority,
              icon: <XCircle size={18} />,
              color: highPriority > 0 ? 'text-red-600' : 'text-gray-300',
              bg: highPriority > 0 ? 'bg-red-50' : 'bg-gray-50',
              sub: '≥ 3 signalements',
            },
            {
              label: 'Auteurs bloqués',
              value: blockedAuthors,
              icon: <ShieldOff size={18} />,
              color: blockedAuthors > 0 ? 'text-gray-600' : 'text-gray-300',
              bg: 'bg-gray-50',
              sub: 'Parmi les signalés',
            },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.bg}`}>
                <span className={k.color}>{k.icon}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-navy leading-none mb-1">{k.value}</p>
                <p className="text-sm text-gray-500 font-medium">{k.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Liste ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou auteur…"
                value={q}
                onChange={e => setQ(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">🛡</div>
              <p className="text-gray-400 text-sm font-medium">Aucun signalement en cours — tout est traité !</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[48px_1fr_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-50">
                <div />
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Annonce · Auteur · Motifs</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map(l => {
                  const cat          = categories.find(c => c.slug === l.categorySlug)
                  const thumb        = l.images[0]?.url
                  const isProcessing = loadingId === l.id
                  const isHigh       = l.reportCount >= 3
                  const reasonCounts = l.reports.reduce<Record<string, number>>((acc, r) => {
                    acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc
                  }, {})
                  const date = new Date(l.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })

                  return (
                    <div
                      key={l.id}
                      className={`flex gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors ${isProcessing ? 'opacity-50 pointer-events-none' : ''} ${isHigh ? 'border-l-2 border-red-300' : 'border-l-2 border-transparent'}`}
                    >
                      {/* Thumb */}
                      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-lg mt-0.5">
                        {thumb
                          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                          : <span>{cat?.icon ?? '📦'}</span>}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Title + badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-navy text-sm">{l.title}</p>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                            <Flag size={8} />
                            {l.reportCount} signalement{l.reportCount > 1 ? 's' : ''}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABEL[l.status] ?? l.status}
                          </span>
                        </div>

                        {/* Meta */}
                        <p className="text-xs text-gray-400">
                          {cat?.icon} {cat?.label} · {l.neighborhood}
                          {l.price != null ? ` · ${l.price.toLocaleString('fr-FR')} €` : ' · Don'}
                          <span className="text-gray-300 mx-1">·</span>
                          {date}
                        </p>

                        {/* Reasons */}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(reasonCounts).map(([reason, count]) => (
                            <span
                              key={reason}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${REASON_COLORS[reason] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}
                            >
                              {reason}{count > 1 ? ` ×${count}` : ''}
                            </span>
                          ))}
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${l.user.blocked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                            {l.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-xs font-semibold ${l.user.blocked ? 'text-red-500 line-through' : 'text-navy'}`}>{l.user.name}</span>
                          <span className="text-xs text-gray-400">{l.user.email}</span>
                          {l.user.blocked && (
                            <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-1.5 py-0.5 rounded-full">Bloqué</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {/* View */}
                        <a
                          href={`/annonces/${l.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                          title="Voir l'annonce"
                        >
                          <Eye size={14} />
                        </a>

                        {/* Retirer / Republier */}
                        {l.status !== 'REJECTED' ? (
                          <button
                            onClick={() => moderate(l.id, 'REJECTED')}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                            title="Retirer l'annonce"
                          >
                            <XCircle size={11} /> Retirer
                          </button>
                        ) : (
                          <button
                            onClick={() => moderate(l.id, 'ACTIVE')}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[11px] font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-40"
                            title="Republier l'annonce"
                          >
                            <CheckCircle size={11} /> Republier
                          </button>
                        )}

                        {/* Block/unblock */}
                        <button
                          onClick={() => toggleBlock(l.user.id, !l.user.blocked)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-xl text-[11px] font-semibold transition-colors ${
                            l.user.blocked
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                          title={l.user.blocked ? "Débloquer l'auteur" : "Bloquer l'auteur"}
                        >
                          {l.user.blocked
                            ? <><ShieldCheck size={11} /> Débloquer</>
                            : <><ShieldOff size={11} /> Bloquer</>}
                        </button>

                        {/* Dismiss */}
                        <button
                          onClick={() => dismiss(l.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl text-[11px] font-semibold hover:bg-gray-100 transition-colors disabled:opacity-40"
                          title="Clore les signalements"
                        >
                          <Trash2 size={11} /> Clore
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Legend ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Légende des actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Eye size={12} />, label: 'Voir', desc: "Ouvre l'annonce publique dans un nouvel onglet" },
              { icon: <XCircle size={12} />, label: 'Retirer', desc: "Passe l'annonce en statut REJECTED — plus visible" },
              { icon: <ShieldOff size={12} />, label: 'Bloquer', desc: "Empêche l'auteur de se connecter" },
              { icon: <Trash2 size={12} />, label: 'Clore', desc: "Supprime tous les signalements — annonce inchangée" },
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
