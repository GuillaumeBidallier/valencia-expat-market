'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'

type SubRow = { id: string; slug: string; label: string; icon: string; order: number; listingCount: number }
type CatRow = SubRow & { children: SubRow[] }
type FormState = { slug: string; label: string; icon: string }
const EMPTY: FormState = { slug: '', label: '', icon: '' }

function slugify(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

type EditTarget = { type: 'root' | 'sub'; id: string; parentId?: string }

export default function AdminCategoriesClient({ initialTree }: { initialTree: CatRow[] }) {
  const [tree,           setTree]           = useState<CatRow[]>(initialTree)
  const [expanded,       setExpanded]       = useState<Set<string>>(new Set())
  const [editTarget,     setEditTarget]     = useState<EditTarget | null>(null)
  const [newSubParentId, setNewSubParentId] = useState<string | null>(null)  // root id for adding sub
  const [isNewRoot,      setIsNewRoot]      = useState(false)
  const [form,           setForm]           = useState<FormState>(EMPTY)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const closeForm = () => {
    setEditTarget(null)
    setNewSubParentId(null)
    setIsNewRoot(false)
    setError('')
    setConfirmDeleteId(null)
  }

  const openNewRoot = () => {
    closeForm()
    setIsNewRoot(true)
    setForm(EMPTY)
  }

  const openNewSub = (parentId: string) => {
    closeForm()
    setNewSubParentId(parentId)
    setForm(EMPTY)
    setExpanded(s => new Set([...s, parentId]))
  }

  const openEdit = (target: EditTarget, current: SubRow) => {
    closeForm()
    setEditTarget(target)
    setForm({ slug: current.slug, label: current.label, icon: current.icon })
  }

  const save = async () => {
    if (!form.label.trim()) { setError('Nom requis.'); return }
    if (isNewRoot && !form.icon.trim()) { setError('Icône requise pour une catégorie racine.'); return }
    const slug = newSubParentId ? slugify(form.label.trim()) : form.slug.trim()
    if ((isNewRoot || newSubParentId) && !slug) { setError('Slug invalide.'); return }
    setSaving(true); setError('')
    try {
      if (isNewRoot) {
        // Create root category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: form.slug.trim().toLowerCase(), label: form.label.trim(), icon: form.icon.trim(), parentId: null }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => [...t, { ...data, listingCount: 0, children: [] }])
      } else if (newSubParentId) {
        // Create subcategory — slug auto-generated, no icon
        if (!tree.find(r => r.id === newSubParentId)) return
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, label: form.label.trim(), icon: '', parentId: newSubParentId }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => t.map(r => r.id === newSubParentId
          ? { ...r, children: [...r.children, { ...data, listingCount: 0 }] }
          : r
        ))
      } else if (editTarget) {
        // Edit existing
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editTarget.id, label: form.label.trim(), icon: form.icon.trim() }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        if (editTarget.type === 'root') {
          setTree(t => t.map(r => r.id === editTarget.id ? { ...r, label: data.label, icon: data.icon } : r))
        } else {
          setTree(t => t.map(r => ({
            ...r,
            children: r.children.map(s => s.id === editTarget.id ? { ...s, label: data.label, icon: data.icon } : s),
          })))
        }
      }
      closeForm()
    } finally { setSaving(false) }
  }

  const remove = async (id: string, type: 'root' | 'sub', parentId?: string) => {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      if (type === 'root') {
        setTree(t => t.filter(r => r.id !== id))
      } else {
        setTree(t => t.map(r => r.id === parentId
          ? { ...r, children: r.children.filter(s => s.id !== id) }
          : r
        ))
      }
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur')
    }
    setConfirmDeleteId(null)
  }

  const moveRoot = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= tree.length) return
    const reordered = [...tree];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setTree(reordered)
    await Promise.all(reordered.map((c, i) =>
      fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, order: i }),
      })
    ))
  }

  const isEditing = isNewRoot || newSubParentId !== null || editTarget !== null

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight">Catégories d&apos;annonces</h1>
              <p className="text-xs text-white/40">{tree.length} catégorie{tree.length !== 1 ? 's' : ''} racine{tree.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openNewRoot}
            className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {error && !isEditing && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Inline form (new root, new sub, or edit) */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-navy">
                {isNewRoot ? 'Nouvelle catégorie' : newSubParentId ? `Sous-catégorie de « ${tree.find(r => r.id === newSubParentId)?.label} »` : 'Modifier'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            {newSubParentId ? (
              /* Subcategory form: label only, slug auto-generated */
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Nom affiché</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Voitures"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50" />
                </div>
                {form.label.trim() && (
                  <p className="text-xs text-gray-400">Slug généré : <span className="font-mono text-navy">/{slugify(form.label.trim())}</span></p>
                )}
              </div>
            ) : (
              /* Root category form: icon + label + slug */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Icône (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🛋️"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Nom affiché</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Maison & Mobilier"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="meubles"
                    disabled={!!editTarget}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving}
                className="bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={closeForm} className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Tree list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {tree.map((cat, i) => (
            <div key={cat.id}>
              {/* Root row */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                {/* Reorder */}
                <div className="flex flex-col shrink-0">
                  <button onClick={() => moveRoot(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                  <button onClick={() => moveRoot(i, 1)} disabled={i === tree.length - 1} className="text-gray-300 hover:text-navy disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                >
                  {cat.children.length > 0
                    ? <ChevronRight size={13} className={expanded.has(cat.id) ? 'rotate-90 transition-transform' : 'transition-transform'} />
                    : <span className="w-3" />
                  }
                </button>

                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate">{cat.label}</p>
                  <p className="text-xs text-gray-400">/{cat.slug} · {cat.listingCount} annonce{cat.listingCount !== 1 ? 's' : ''} · {cat.children.length} sous-catégorie{cat.children.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Actions */}
                {confirmDeleteId === cat.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">Supprimer avec ses sous-catégories ?</span>
                    <button onClick={() => remove(cat.id, 'root')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">Confirmer</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annuler</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openNewSub(cat.id)}
                      title="Ajouter une sous-catégorie"
                      className="flex items-center gap-1 text-xs font-semibold text-orange-primary border border-orange-primary/30 bg-orange-soft px-2 py-1 rounded-lg hover:bg-orange-primary/10 transition-colors"
                    >
                      <Plus size={11} /> Sous-catégorie
                    </button>
                    <button onClick={() => openEdit({ type: 'root', id: cat.id }, cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        const childListingCount = cat.children.reduce((sum, s) => sum + s.listingCount, 0)
                        if (cat.listingCount > 0 || childListingCount > 0) {
                          const total = cat.listingCount + childListingCount
                          setError(`Catégorie ou ses sous-catégories utilisées par ${total} annonce(s), suppression impossible.`)
                        } else {
                          setConfirmDeleteId(cat.id)
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Children rows (shown when expanded) */}
              {expanded.has(cat.id) && cat.children.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 pl-14 pr-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
                  <span className="text-base shrink-0">{sub.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{sub.label}</p>
                    <p className="text-xs text-gray-400">/{sub.slug} · {sub.listingCount} annonce{sub.listingCount !== 1 ? 's' : ''}</p>
                  </div>
                  {confirmDeleteId === sub.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">Supprimer ?</span>
                      <button onClick={() => remove(sub.id, 'sub', cat.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">Confirmer</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit({ type: 'sub', id: sub.id, parentId: cat.id }, sub)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => sub.listingCount > 0
                          ? setError(`Sous-catégorie utilisée par ${sub.listingCount} annonce(s), suppression impossible.`)
                          : setConfirmDeleteId(sub.id)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {tree.length === 0 && (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              Aucune catégorie. Cliquez sur « Ajouter » pour commencer.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
