'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Eye, ToggleLeft, ToggleRight, Clock, Flag, ShieldOff, ShieldCheck } from 'lucide-react'
import { categories } from '@/lib/categories'

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE:   { label: 'Publiée',    color: 'bg-green-100 text-green-700'  },
  REJECTED: { label: 'Refusée',   color: 'bg-red-100 text-red-600'      },
}

export default function AdminAnnoncesClient({
  initialListings,
  autoPublish: initialAutoPublish,
}: {
  initialListings: ListingRow[]
  autoPublish: boolean
}) {
  const [listings, setListings]           = useState<ListingRow[]>(initialListings)
  const [reportedListings, setReported]   = useState<ReportedListing[]>([])
  const [reportedLoaded, setReportedLoaded] = useState(false)
  const [autoPublish, setAutoPublish]     = useState(initialAutoPublish)
  const [tab, setTab]                     = useState<'PENDING' | 'ACTIVE' | 'REJECTED' | 'REPORTED'>('PENDING')
  const [togglingAuto, setTogglingAuto]   = useState(false)
  const [loadingId, setLoadingId]         = useState<string | null>(null)

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

  const loadTab = async (status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REPORTED') => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black text-navy">📋 Admin — Annonces</h1>

          {/* Toggle publication automatique */}
          <button
            onClick={toggleAutoPublish}
            disabled={togglingAuto}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
              autoPublish
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
            } disabled:opacity-50`}
          >
            {autoPublish
              ? <><ToggleRight size={20} className="text-green-600" /> Publication automatique ON</>
              : <><ToggleLeft size={20} className="text-orange-500" /> Publication automatique OFF</>
            }
          </button>
        </div>

        {/* Explication du mode actif */}
        <div className={`rounded-xl border px-4 py-3 mb-6 text-sm ${
          autoPublish
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-orange-50 border-orange-200 text-orange-700'
        }`}>
          {autoPublish
            ? '✅ Les nouvelles annonces sont publiées immédiatement après soumission.'
            : '⏳ Les nouvelles annonces passent en attente de validation. Vous devez les approuver ou les refuser ici.'
          }
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {(['PENDING', 'ACTIVE', 'REJECTED', 'REPORTED'] as const).map(s => (
            <button
              key={s}
              onClick={() => loadTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === s
                  ? s === 'PENDING'  ? 'bg-yellow-100 text-yellow-700'
                  : s === 'ACTIVE'   ? 'bg-green-100 text-green-700'
                  : s === 'REPORTED' ? 'bg-red-100 text-red-600'
                  : 'bg-gray-200 text-gray-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'PENDING'  && <><Clock size={13} className="inline mr-1" />En attente</>}
              {s === 'ACTIVE'   && <><CheckCircle size={13} className="inline mr-1" />Publiées</>}
              {s === 'REJECTED' && <><XCircle size={13} className="inline mr-1" />Refusées</>}
              {s === 'REPORTED' && <><Flag size={13} className="inline mr-1" />Signalements</>}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {tab === 'REPORTED' ? (
            reportedListings.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-gray-400 text-sm">Aucun signalement en cours.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reportedListings.map(l => {
                  const cat = categories.find(c => c.slug === l.categorySlug)
                  const thumb = l.images[0]?.url
                  const isProcessing = loadingId === l.id
                  const reasonCounts = l.reports.reduce<Record<string, number>>((acc, r) => {
                    acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc
                  }, {})

                  return (
                    <div key={l.id} className={`p-4 hover:bg-gray-50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-2xl">
                          {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <span>{cat?.icon ?? '📦'}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-navy text-sm truncate">{l.title}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                              <Flag size={9} /> {l._count.reports} signalement{l._count.reports > 1 ? 's' : ''}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[l.status]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                              {STATUS_LABELS[l.status]?.label ?? l.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{cat?.icon} {cat?.label} · {l.neighborhood}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Object.entries(reasonCounts).map(([reason, count]) => (
                              <span key={reason} className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                                {reason}{count > 1 ? ` ×${count}` : ''}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Par <span className={`font-medium ${l.user.blocked ? 'text-red-500 line-through' : 'text-navy'}`}>{l.user.name}</span>
                            {l.user.blocked && <span className="ml-1 text-[10px] bg-red-100 text-red-500 px-1.5 rounded">Bloqué</span>}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <a href={`/annonces/${l.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-navy transition-colors" title="Voir"><Eye size={15} /></a>
                          <button
                            onClick={() => moderate(l.id, 'REJECTED')}
                            disabled={isProcessing || l.status === 'REJECTED'}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                          >
                            <XCircle size={12} /> Retirer
                          </button>
                          <button
                            onClick={() => toggleBlock(l.user.id, !l.user.blocked)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-[11px] font-semibold transition-colors ${
                              l.user.blocked
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {l.user.blocked ? <><ShieldCheck size={12} /> Débloquer</> : <><ShieldOff size={12} /> Bloquer</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : listings.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-3xl mb-2">
                {tab === 'PENDING' ? '🎉' : tab === 'ACTIVE' ? '📋' : '🗑️'}
              </p>
              <p className="text-gray-400 text-sm">
                {tab === 'PENDING' ? 'Aucune annonce en attente — tout est traité !' : `Aucune annonce ${STATUS_LABELS[tab]?.label.toLowerCase()}.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {listings.map(l => {
                const cat = categories.find(c => c.slug === l.categorySlug)
                const thumb = l.images[0]?.url
                const isProcessing = loadingId === l.id

                return (
                  <div key={l.id} className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-2xl">
                      {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <span>{cat?.icon ?? '📦'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <p className="font-semibold text-navy text-sm truncate">{l.title}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[l.status]?.color}`}>
                          {STATUS_LABELS[l.status]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {cat?.icon} {cat?.label} · {l.neighborhood}
                        {l.price != null && ` · ${l.price.toLocaleString('fr-FR')} €`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Par <span className="font-medium text-navy">{l.user.name}</span>
                        <span className="text-gray-300 mx-1">·</span>
                        {new Date(l.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`/annonces/${l.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-navy transition-colors" title="Voir l'annonce"><Eye size={16} /></a>
                      {tab === 'PENDING' && (
                        <>
                          <button onClick={() => moderate(l.id, 'ACTIVE')} disabled={isProcessing} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
                            <CheckCircle size={13} /> Approuver
                          </button>
                          <button onClick={() => moderate(l.id, 'REJECTED')} disabled={isProcessing} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                            <XCircle size={13} /> Refuser
                          </button>
                        </>
                      )}
                      {tab === 'REJECTED' && (
                        <button onClick={() => moderate(l.id, 'ACTIVE')} disabled={isProcessing} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
                          <CheckCircle size={13} /> Republier
                        </button>
                      )}
                      {tab === 'ACTIVE' && (
                        <button onClick={() => moderate(l.id, 'REJECTED')} disabled={isProcessing} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                          <XCircle size={13} /> Dépublier
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
