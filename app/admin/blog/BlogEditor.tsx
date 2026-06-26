'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const CATEGORIES = ['guide', 'conseils', 'vie-pratique', 'actualites']
const LANGS = ['fr', 'en', 'es', 'de', 'nl']

type Post = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  author: string
  readTime: number
  lang: string
  published: boolean
}

type Props = {
  initial?: Partial<Post>
  isNew?: boolean
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export default function BlogEditor({ initial, isNew }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Post>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'guide',
    author: 'Équipe 1000Click',
    readTime: 5,
    lang: 'fr',
    published: false,
    ...initial,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  function set(k: keyof Post, v: string | number | boolean) {
    setForm(f => ({ ...f, [k]: v }))
    setSaved(false)
  }

  function handleTitleChange(v: string) {
    setForm(f => ({ ...f, title: v, slug: isNew ? slugify(v) : f.slug }))
  }

  async function save(pub?: boolean) {
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, ...(pub !== undefined ? { published: pub } : {}) }
      const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${initial?.id}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }
      const post = await res.json()
      setSaved(true)
      if (isNew) router.push(`/admin/blog/${post.id}/edit`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-colors'
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Édition' : 'Aperçu'}
          </button>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${form.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {form.published ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {saved && <span className="text-xs text-emerald-600 font-semibold">Sauvegardé ✓</span>}
          {!form.published && (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              Publier
            </button>
          )}
          {form.published && (
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold transition-colors disabled:opacity-50"
            >
              Dépublier
            </button>
          )}
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy hover:bg-navy/90 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: form fields */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className={labelCls}>Titre</label>
            <input value={form.title} onChange={e => handleTitleChange(e.target.value)} className={inputCls} placeholder="Titre de l'article" />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} className={inputCls} placeholder="mon-article-slug" />
          </div>
          <div>
            <label className={labelCls}>Résumé</label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} className={inputCls} placeholder="Courte description visible dans la liste…" />
          </div>

          {/* Content / Preview toggle */}
          <div>
            <label className={labelCls}>Contenu (Markdown)</label>
            {preview ? (
              <div className="prose prose-gray max-w-none border border-gray-200 rounded-xl p-5 min-h-[400px] bg-white
                prose-headings:font-black prose-headings:text-navy prose-p:text-gray-600
                prose-a:text-orange-primary prose-code:text-orange-primary prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '_Aucun contenu_'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                rows={22}
                className={`${inputCls} font-mono text-xs leading-relaxed`}
                placeholder="# Titre principal&#10;&#10;Commencez à écrire votre article en Markdown…"
              />
            )}
          </div>
        </div>

        {/* Right: meta */}
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Image de couverture (URL)</label>
            <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} className={inputCls} placeholder="https://…" />
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="cover preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-gray-200" />
            )}
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Auteur</label>
            <input value={form.author} onChange={e => set('author', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Temps de lecture (min)</label>
            <input type="number" min={1} max={60} value={form.readTime} onChange={e => set('readTime', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Langue</label>
            <select value={form.lang} onChange={e => set('lang', e.target.value)} className={inputCls}>
              {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
          {!isNew && (
            <div className="pt-2 border-t border-gray-100">
              <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-primary hover:underline font-medium">
                Voir l&apos;article public →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
