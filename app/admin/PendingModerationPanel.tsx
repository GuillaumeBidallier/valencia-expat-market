'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Loader2 } from 'lucide-react'

type PendingListing = {
  id: string
  title: string
  price: number | null
  city: string
  publishedAt: string
  userName: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "à l'instant"
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hier'
  return `il y a ${days}j`
}

export default function PendingModerationPanel({ initialListings }: { initialListings: PendingListing[] }) {
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  async function handleAction(id: string, status: 'ACTIVE' | 'REJECTED') {
    setBusyId(id)
    setErrorId(null)
    try {
      const res = await fetch(`/api/admin/annonces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setListings(prev => prev.filter(l => l.id !== id))
      router.refresh()
    } catch {
      setErrorId(id)
    } finally {
      setBusyId(null)
    }
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <Check size={17} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-navy">Aucune annonce en attente ✓</p>
          <p className="text-xs text-gray-400 mt-0.5">Tout ce qui a été déposé a déjà été traité.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <p className="text-xs font-black text-navy uppercase tracking-wider">À modérer ({listings.length})</p>
        <Link href="/admin/annonces" className="text-xs font-bold text-orange-primary hover:underline">
          Voir tout →
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {listings.map(l => (
          <div key={l.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-0">
              <Link href={`/annonces/${l.id}`} target="_blank" className="text-sm font-bold text-navy hover:text-orange-primary truncate block">
                {l.title}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">
                {l.userName} · {l.city} {l.price != null && `· ${l.price} €`} · {timeAgo(l.publishedAt)}
              </p>
            </div>
            {errorId === l.id && <span className="text-xs text-red-500 shrink-0">Erreur, réessayez</span>}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleAction(l.id, 'REJECTED')}
                disabled={busyId === l.id}
                className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-40"
                title="Refuser"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => handleAction(l.id, 'ACTIVE')}
                disabled={busyId === l.id}
                className="h-7 px-3 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {busyId === l.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Valider
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
