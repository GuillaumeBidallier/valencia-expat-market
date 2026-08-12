'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, Plus, Search, FileText, CheckCircle, Clock, Tag } from 'lucide-react'
import type { BlogPost } from '@prisma/client'

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT'

export default function AdminBlogClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()
  const [items, setItems] = useState(posts)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  async function togglePublish(post: BlogPost) {
    setToggling(post.id)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      })
      if (res.ok) {
        const updated = await res.json() as BlogPost
        setItems(prev => prev.map(p => p.id === post.id ? updated : p))
      }
    } finally {
      setToggling(null)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(p => p.id !== id))
        router.refresh()
      }
    } finally {
      setDeleting(null)
    }
  }

  const categories = useMemo(() => Array.from(new Set(items.map(p => p.category))), [items])

  const counts = useMemo(() => ({
    ALL: items.length,
    PUBLISHED: items.filter(p => p.published).length,
    DRAFT: items.filter(p => !p.published).length,
  }), [items])

  const filtered = useMemo(() => {
    const lq = query.toLowerCase()
    return items
      .filter(p => statusFilter === 'ALL' || (statusFilter === 'PUBLISHED' ? p.published : !p.published))
      .filter(p => !lq || p.title.toLowerCase().includes(lq) || p.category.toLowerCase().includes(lq) || p.author.toLowerCase().includes(lq))
  }, [items, query, statusFilter])

  const statCards: { key: StatusFilter; label: string; value: number; icon: React.ReactNode; iconBg: string; iconColor: string }[] = [
    { key: 'ALL', label: 'Total articles', value: counts.ALL, icon: <FileText size={17} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { key: 'PUBLISHED', label: 'Publiés', value: counts.PUBLISHED, icon: <CheckCircle size={17} />, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { key: 'DRAFT', label: 'Brouillons', value: counts.DRAFT, icon: <Clock size={17} />, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ]

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Blog</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez les articles du blog.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <Plus size={15} /> Nouvel article
        </Link>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(s => {
          const isActive = statusFilter === s.key
          return (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-indigo-soft">
            <Tag size={17} className="text-indigo-primary" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{categories.length}</p>
          <p className="text-xs text-gray-400 mt-1.5">Catégories utilisées</p>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par titre, catégorie, auteur…"
          className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary/40 bg-white"
        />
      </div>

      {/* ── List ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-lg font-black text-navy mb-1">{items.length === 0 ? 'Aucun article' : 'Aucun résultat'}</p>
          <p className="text-gray-400 text-sm mb-6">
            {items.length === 0 ? 'Créez votre premier article pour alimenter le blog.' : 'Essayez une autre recherche ou un autre filtre.'}
          </p>
          {items.length === 0 && (
            <Link href="/admin/blog/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-primary text-white text-sm font-bold">
              <Plus size={14} /> Créer un article
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          {filtered.map(post => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                {post.coverImage
                  ? <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  : <span className="text-lg">📰</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {post.published ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">{post.category}</span>
                  <span className="text-[10px] text-gray-300 shrink-0">{post.lang.toUpperCase()}</span>
                </div>
                <p className="font-bold text-navy text-sm truncate">{post.title}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  /blog/{post.slug} · {post.author} · {post.readTime} min de lecture
                  {post.publishedAt && <> · publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR')}</>}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  disabled={toggling === post.id}
                  title={post.published ? 'Dépublier' : 'Publier'}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                >
                  {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <Link href={`/admin/blog/${post.id}/edit`} title="Modifier" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => deletePost(post.id)}
                  disabled={deleting === post.id}
                  title="Supprimer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
