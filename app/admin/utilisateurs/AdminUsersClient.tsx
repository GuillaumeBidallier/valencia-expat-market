'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, ShieldCheck, ShieldOff, Crown, Users, UserCheck, Ban, Star,
  ChevronLeft, ChevronRight, X, Loader2, MessageSquare, Heart, FileText,
} from 'lucide-react'

type UserRow = {
  id: string; name: string; email: string
  role: string; blocked: boolean; createdAt: string
  _count: { listings: number; favorites: number; sentMessages: number }
  professional: { id: string; verified: boolean; tier: string } | null
}

type Counts = { TOTAL: number; USER: number; PREMIUM: number; ADMIN: number; BLOCKED: number; PROS: number }

const ROLE_LABELS: Record<string, string> = { USER: 'Gratuit', PREMIUM: 'Premium', ADMIN: 'Admin' }
const ROLE_COLORS: Record<string, string> = {
  USER:    'bg-gray-100 text-gray-600',
  PREMIUM: 'bg-indigo-100 text-indigo-700',
  ADMIN:   'bg-orange-100 text-orange-700',
}

type FilterKey = 'ALL' | 'USER' | 'PREMIUM' | 'ADMIN' | 'BLOCKED' | 'PROS'

export default function AdminUsersClient({
  initialUsers,
  initialTotal,
  currentAdminId,
  counts: initialCounts,
}: {
  initialUsers: UserRow[]
  initialTotal: number
  currentAdminId: string
  counts: Counts
}) {
  const [users, setUsers]     = useState<UserRow[]>(initialUsers)
  const [counts, setCounts]   = useState<Counts>(initialCounts)
  const [query, setQuery]     = useState('')
  const [filter, setFilter]   = useState<FilterKey>('ALL')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(Math.max(1, Math.ceil(initialTotal / 20)))
  const [total, setTotal]     = useState(initialTotal)
  const [loading, setLoading] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const filterRef = useRef(filter)
  useEffect(() => { filterRef.current = filter }, [filter])

  const refreshCounts = useCallback(async () => {
    const res = await fetch('/api/admin/utilisateurs/counts')
    if (res.ok) setCounts(await res.json())
  }, [])

  const buildParams = (f: FilterKey, q: string, p: number) => {
    const params = new URLSearchParams({ page: String(p) })
    if (q) params.set('q', q)
    if (f === 'USER' || f === 'PREMIUM' || f === 'ADMIN') params.set('role', f)
    if (f === 'BLOCKED') params.set('blocked', 'true')
    if (f === 'PROS') params.set('pro', 'true')
    return params
  }

  const loadUsers = useCallback(async (f: FilterKey, q: string, p: number) => {
    setListLoading(true)
    const res = await fetch(`/api/admin/utilisateurs?${buildParams(f, q, p).toString()}`)
    const data = await res.json()
    setUsers(data.users)
    setTotal(data.total)
    setPages(data.pages)
    setListLoading(false)
  }, [])

  const switchFilter = (f: FilterKey) => {
    setFilter(f)
    setPage(1)
    loadUsers(f, query, 1)
  }

  // Debounced search — state updates happen inside the timeout callback, not the
  // effect body, so this doesn't trigger a synchronous cascading render.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      loadUsers(filterRef.current, query, 1)
    }, 300)
    return () => clearTimeout(t)
  }, [query, loadUsers])

  const goToPage = (p: number) => {
    setPage(p)
    loadUsers(filter, query, p)
  }

  const patch = async (id: string, data: Partial<{ role: string; blocked: boolean }>) => {
    setLoading(id)
    const res = await fetch(`/api/admin/utilisateurs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u))
      refreshCounts()
    }
    setLoading(null)
  }

  const statCards: { key: FilterKey; label: string; value: number; icon: React.ReactNode; iconBg: string; iconColor: string }[] = [
    { key: 'ALL', label: 'Total inscrits', value: counts.TOTAL, icon: <Users size={17} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { key: 'USER', label: 'Comptes gratuits', value: counts.USER, icon: <UserCheck size={17} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { key: 'PREMIUM', label: 'Comptes Premium', value: counts.PREMIUM, icon: <Crown size={17} />, iconBg: 'bg-indigo-soft', iconColor: 'text-indigo-primary' },
    { key: 'ADMIN', label: 'Administrateurs', value: counts.ADMIN, icon: <ShieldCheck size={17} />, iconBg: 'bg-orange-soft', iconColor: 'text-orange-primary' },
    { key: 'PROS', label: 'Profils professionnels', value: counts.PROS, icon: <Star size={17} />, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { key: 'BLOCKED', label: 'Comptes bloqués', value: counts.BLOCKED, icon: <Ban size={17} />, iconBg: counts.BLOCKED > 0 ? 'bg-red-50' : 'bg-gray-100', iconColor: counts.BLOCKED > 0 ? 'text-red-500' : 'text-gray-400' },
  ]

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-navy tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gérez les comptes inscrits sur la plateforme.</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(s => {
          const isActive = filter === s.key
          return (
            <button
              key={s.key}
              onClick={() => switchFilter(s.key)}
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
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 bg-white"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
        {listLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <Loader2 size={20} className="animate-spin text-orange-primary" />
          </div>
        )}

        {users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-xl">👤</div>
            <p className="text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Rôle</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden md:table-cell">Activité</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Inscrit le</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => {
                  const isSelf    = u.id === currentAdminId
                  const isLoading = loading === u.id
                  const date      = new Date(u.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                  const initials  = u.name.charAt(0).toUpperCase()
                  const avatarBg  = u.blocked ? 'bg-red-100 text-red-500' : u.role === 'PREMIUM' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'

                  return (
                    <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${u.blocked ? 'opacity-60' : ''} ${isLoading ? 'opacity-50' : ''}`}>
                      {/* Avatar + name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarBg}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy text-sm leading-tight truncate">{u.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {u.blocked && (
                                <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded-full">Bloqué</span>
                              )}
                              {u.professional && (
                                <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-full">
                                  <Star size={9} /> Pro{u.professional.verified ? ' vérifié' : ''}
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] text-orange-primary font-semibold">Vous</span>
                              )}
                              <p className="text-xs text-gray-400 sm:hidden">{u.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-gray-400 hidden sm:table-cell text-xs">{u.email}</td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        {isSelf ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                            {ROLE_LABELS[u.role]}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={e => patch(u.id, { role: e.target.value })}
                            disabled={isLoading}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-primary/30 ${ROLE_COLORS[u.role]}`}
                          >
                            <option value="USER">Gratuit</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                      </td>

                      {/* Activity detail */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1" title="Annonces déposées">
                            <FileText size={12} className="text-gray-300" /> {u._count.listings}
                          </span>
                          <span className="flex items-center gap-1" title="Favoris enregistrés">
                            <Heart size={12} className="text-gray-300" /> {u._count.favorites}
                          </span>
                          <span className="flex items-center gap-1" title="Messages envoyés">
                            <MessageSquare size={12} className="text-gray-300" /> {u._count.sentMessages}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">{date}</td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        {!isSelf ? (
                          <button
                            onClick={() => patch(u.id, { blocked: !u.blocked })}
                            disabled={isLoading}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 ${
                              u.blocked
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100'
                                : 'text-red-500 bg-red-50 hover:bg-red-100 border border-red-100'
                            }`}
                          >
                            {u.blocked
                              ? <><ShieldCheck size={12} /> Débloquer</>
                              : <><ShieldOff size={12} /> Bloquer</>}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-orange-primary font-bold px-2">
                            <Crown size={10} /> Vous
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{total} utilisateur{total > 1 ? 's' : ''} au total</p>
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
