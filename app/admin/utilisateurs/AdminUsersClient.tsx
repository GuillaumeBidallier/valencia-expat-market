'use client'
import { useState, useMemo } from 'react'
import { Search, ShieldCheck, ShieldOff, ArrowLeft, Crown, Users, UserCheck, Ban } from 'lucide-react'
import Link from 'next/link'

type UserRow = {
  id: string; name: string; email: string
  role: string; blocked: boolean; createdAt: string
  _count: { listings: number }
}

const ROLE_LABELS: Record<string, string> = { USER: 'Gratuit', PREMIUM: 'Premium', ADMIN: 'Admin' }
const ROLE_COLORS: Record<string, string> = {
  USER:    'bg-gray-100 text-gray-600',
  PREMIUM: 'bg-indigo-100 text-indigo-700',
  ADMIN:   'bg-orange-100 text-orange-700',
}

export default function AdminUsersClient({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: UserRow[]
  currentAdminId: string
}) {
  const [users, setUsers]     = useState<UserRow[]>(initialUsers)
  const [q, setQ]             = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const lq = q.toLowerCase()
    return lq ? users.filter(u => u.name.toLowerCase().includes(lq) || u.email.toLowerCase().includes(lq)) : users
  }, [users, q])

  const patch = async (id: string, data: Partial<UserRow>) => {
    setLoading(id)
    const res = await fetch(`/api/admin/utilisateurs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u))
    }
    setLoading(null)
  }

  const stats = useMemo(() => ({
    total:   users.length,
    premium: users.filter(u => u.role === 'PREMIUM').length,
    admin:   users.filter(u => u.role === 'ADMIN').length,
    blocked: users.filter(u => u.blocked).length,
  }), [users])

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
              <h1 className="text-lg font-black tracking-tight">Utilisateurs</h1>
              <p className="text-xs text-white/40">{stats.total} comptes enregistrés</p>
            </div>
          </div>
          {stats.blocked > 0 && (
            <div className="flex items-center gap-2 bg-red-500/20 rounded-xl px-3 py-2 text-sm text-red-300 font-medium">
              <Ban size={14} />
              {stats.blocked} bloqué{stats.blocked > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total inscrits',  value: stats.total,   icon: <Users size={16} />,      color: 'text-navy',          bg: 'bg-gray-50' },
            { label: 'Comptes Premium', value: stats.premium, icon: <UserCheck size={16} />,  color: 'text-indigo-primary', bg: 'bg-indigo-soft' },
            { label: 'Administrateurs', value: stats.admin,   icon: <Crown size={16} />,      color: 'text-orange-primary', bg: 'bg-orange-soft' },
            { label: 'Comptes bloqués', value: stats.blocked, icon: <Ban size={16} />,        color: stats.blocked > 0 ? 'text-red-500' : 'text-gray-300', bg: stats.blocked > 0 ? 'bg-red-50' : 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-navy leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + table ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Search bar */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email…"
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
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-xl">👤</div>
              <p className="text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Rôle</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden md:table-cell">Annonces</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Inscrit le</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => {
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
                            <div>
                              <p className="font-semibold text-navy text-sm leading-tight">{u.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {u.blocked && (
                                  <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded-full">Bloqué</span>
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

                        {/* Listings */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm font-bold text-navy">{u._count.listings}</span>
                          <span className="text-xs text-gray-400 ml-1">annonce{u._count.listings !== 1 ? 's' : ''}</span>
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
      </div>
    </div>
  )
}
