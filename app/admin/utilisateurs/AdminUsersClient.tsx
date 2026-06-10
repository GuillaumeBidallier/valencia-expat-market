'use client'
import { useState, useMemo } from 'react'
import { Search, ShieldCheck, ShieldOff, ArrowLeft, Crown } from 'lucide-react'
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
  ADMIN:   'bg-red-100 text-red-700',
}

export default function AdminUsersClient({ initialUsers, currentAdminId }: { initialUsers: UserRow[]; currentAdminId: string }) {
  const [users, setUsers]   = useState<UserRow[]>(initialUsers)
  const [q, setQ]           = useState('')
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
    total:    users.length,
    premium:  users.filter(u => u.role === 'PREMIUM').length,
    admin:    users.filter(u => u.role === 'ADMIN').length,
    blocked:  users.filter(u => u.blocked).length,
  }), [users])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-navy transition-colors rounded-lg hover:bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-navy">👥 Utilisateurs</h1>
            <p className="text-sm text-gray-400">{stats.total} comptes enregistrés</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',   val: stats.total,   color: 'text-navy',       bg: 'bg-white' },
            { label: 'Premium', val: stats.premium, color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'Admins',  val: stats.admin,   color: 'text-red-600',    bg: 'bg-red-50' },
            { label: 'Bloqués', val: stats.blocked, color: 'text-gray-500',   bg: 'bg-gray-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 px-4 py-3`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Rôle</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Annonces</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Inscrit le</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => {
                    const isSelf = u.id === currentAdminId
                    const isLoading = loading === u.id
                    const date = new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

                    return (
                      <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.blocked ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-navy text-sm leading-tight">{u.name}</p>
                              {u.blocked && <span className="text-[10px] text-red-500 font-medium">Bloqué</span>}
                              <p className="text-xs text-gray-400 sm:hidden">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          {isSelf ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                              {ROLE_LABELS[u.role]}
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={e => patch(u.id, { role: e.target.value })}
                              disabled={isLoading}
                              className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-primary ${ROLE_COLORS[u.role]}`}
                            >
                              <option value="USER">Gratuit</option>
                              <option value="PREMIUM">Premium</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u._count.listings}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{date}</td>
                        <td className="px-4 py-3">
                          {!isSelf && (
                            <button
                              onClick={() => patch(u.id, { blocked: !u.blocked })}
                              disabled={isLoading}
                              title={u.blocked ? 'Débloquer' : 'Bloquer'}
                              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                u.blocked
                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-red-500 bg-red-50 hover:bg-red-100'
                              }`}
                            >
                              {u.blocked
                                ? <><ShieldCheck size={12} /> Débloquer</>
                                : <><ShieldOff size={12} /> Bloquer</>}
                            </button>
                          )}
                          {isSelf && (
                            <span className="flex items-center gap-1 text-[10px] text-orange-primary font-bold">
                              <Crown size={10} /> Vous
                            </span>
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
