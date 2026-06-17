'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

type CategoryRow = { id: string; slug: string; label: string; icon: string; order: number; listingCount: number }
type FormState = { slug: string; label: string; icon: string }
const EMPTY: FormState = { slug: '', label: '', icon: '' }

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
  const [editing, setEditing]       = useState<CategoryRow | null>(null)
  const [isNew, setIsNew]           = useState(false)
  const [form, setForm]             = useState<FormState>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const openNew  = () => { setEditing(null); setForm(EMPTY); setIsNew(true); setError('') }
  const openEdit = (c: CategoryRow) => { setEditing(c); setForm({ slug: c.slug, label: c.label, icon: c.icon }); setIsNew(false); setError('') }
  const closeForm = () => { setEditing(null); setIsNew(false); setError('') }

  const save = async () => {
    if (!form.label.trim() || !form.icon.trim() || (isNew && !form.slug.trim())) {
      setError('Tous les champs sont requis.')
      return
    }
    setSaving(true); setError('')
    try {
      if (isNew) {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: form.slug.trim().toLowerCase(), label: form.label.trim(), icon: form.icon.trim() }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setCategories(cs => [...cs, { ...data, listingCount: 0 }])
      } else if (editing) {
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, label: form.label.trim(), icon: form.icon.trim() }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setCategories(cs => cs.map(c => c.id === editing.id ? { ...c, label: data.label, icon: data.icon } : c))
      }
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: CategoryRow) => {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id }),
    })
    if (res.ok) {
      setCategories(cs => cs.filter(x => x.id !== c.id))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur')
    }
    setConfirmDeleteId(null)
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= categories.length) return
    const reordered = [...categories]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setCategories(reordered)
    await Promise.all(reordered.map((c, i) =>
      fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, order: i }),
      })
    ))
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight">Catégories d&apos;annonces</h1>
              <p className="text-xs text-white/40">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">

        {error && !editing && !isNew && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* ── Form (new or edit) ─────────────────────────────── */}
        {(editing || isNew) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-navy">{isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Icône (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🛋️"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Nom affiché</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Maison & Mobilier"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="meubles"
                  disabled={!isNew}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={closeForm} className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── List ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {categories.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
              <GripVertical size={14} className="text-gray-200 shrink-0" />
              <div className="flex flex-col shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors">
                  <ChevronDown size={13} />
                </button>
              </div>
              <span className="text-xl shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy truncate">{c.label}</p>
                <p className="text-xs text-gray-400">/{c.slug} · {c.listingCount} annonce{c.listingCount !== 1 ? 's' : ''}</p>
              </div>

              {confirmDeleteId === c.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">Supprimer ?</span>
                  <button onClick={() => remove(c)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">
                    Confirmer
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => c.listingCount > 0 ? setError(`Catégorie utilisée par ${c.listingCount} annonce(s), suppression impossible.`) : setConfirmDeleteId(c.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
