'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, Plus } from 'lucide-react'
import type { BlogPost } from '@prisma/client'

export default function AdminBlogClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()
  const [items, setItems] = useState(posts)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-navy">Blog</h1>
        <Link href="/admin/blog/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-primary hover:bg-orange-600 text-white text-sm font-bold transition-colors">
          <Plus size={14} /> Nouvel article
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-lg font-black text-navy mb-1">Aucun article</p>
          <p className="text-gray-400 text-sm mb-6">Créez votre premier article pour alimenter le blog.</p>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-primary text-white text-sm font-bold">
            <Plus size={14} /> Créer un article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {items.map(post => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {post.published ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">{post.category}</span>
                  <span className="text-[10px] text-gray-300 shrink-0">{post.lang.toUpperCase()}</span>
                </div>
                <p className="font-bold text-navy text-sm truncate">{post.title}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">/blog/{post.slug}</p>
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
