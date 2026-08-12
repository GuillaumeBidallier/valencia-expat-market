'use client'
import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, ChevronRight, Layers, FolderTree, FileText } from 'lucide-react'

type TreeRow = {
  id: string; slug: string; label: string; icon: string
  order: number; listingCount: number; children: TreeRow[]
}

type FormState = { label: string; icon: string; slug: string }
const EMPTY: FormState = { label: '', icon: '', slug: '' }

const TRANSLATION_LOCALES = [
  { code: 'en', name: 'Anglais' },
  { code: 'es', name: 'Espagnol' },
  { code: 'de', name: 'Allemand' },
  { code: 'nl', name: 'Néerlandais' },
  { code: 'uk', name: 'Ukrainien' },
  { code: 'ru', name: 'Russe' },
]

function slugify(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

function countDescendantListings(row: TreeRow): number {
  return row.listingCount + row.children.reduce((s, c) => s + countDescendantListings(c), 0)
}

function countAllNodes(row: TreeRow): number {
  return 1 + row.children.reduce((s, c) => s + countAllNodes(c), 0)
}

export default function AdminCategoriesClient({ initialTree }: { initialTree: TreeRow[] }) {
  const [tree, setTree] = useState<TreeRow[]>(initialTree)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Form state
  const [isNewRoot, setIsNewRoot] = useState(false)
  const [newSubParentId, setNewSubParentId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<{ id: string; parentId: string | null } | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})

  const isEditing = isNewRoot || newSubParentId !== null || editTarget !== null

  const closeForm = () => {
    setIsNewRoot(false); setNewSubParentId(null); setEditTarget(null)
    setError(''); setForm(EMPTY); setConfirmDeleteId(null); setTranslations({})
  }

  const openNewRoot = () => { closeForm(); setIsNewRoot(true) }

  const openNewSub = (parentId: string) => {
    closeForm(); setNewSubParentId(parentId); setForm(EMPTY)
    setExpanded(s => new Set([...s, parentId]))
  }

  const openEdit = (row: TreeRow, parentId: string | null) => {
    closeForm(); setEditTarget({ id: row.id, parentId })
    setForm({ label: row.label, icon: row.icon, slug: row.slug })
    // Load existing translations in background
    fetch(`/api/categories/${row.id}`)
      .then(r => r.json())
      .then((data: Record<string, string>) => setTranslations(data))
      .catch(() => {})
  }

  // Find parent row in tree (recursive)
  function findInTree(rows: TreeRow[], id: string): TreeRow | null {
    for (const r of rows) {
      if (r.id === id) return r
      const found = findInTree(r.children, id)
      if (found) return found
    }
    return null
  }

  // Update a node in the tree (recursive)
  function updateInTree(rows: TreeRow[], id: string, patch: Partial<TreeRow>): TreeRow[] {
    return rows.map(r => r.id === id
      ? { ...r, ...patch }
      : { ...r, children: updateInTree(r.children, id, patch) }
    )
  }

  // Append child to a parent node
  function appendChildInTree(rows: TreeRow[], parentId: string, child: TreeRow): TreeRow[] {
    return rows.map(r => r.id === parentId
      ? { ...r, children: [...r.children, child] }
      : { ...r, children: appendChildInTree(r.children, parentId, child) }
    )
  }

  // Remove node from tree
  function removeFromTree(rows: TreeRow[], id: string): TreeRow[] {
    return rows.filter(r => r.id !== id).map(r => ({ ...r, children: removeFromTree(r.children, id) }))
  }

  const save = async () => {
    const isRoot = isNewRoot
    const isSub = newSubParentId !== null
    const isEdit = editTarget !== null

    if (!form.label.trim()) { setError('Nom requis.'); return }
    if (isRoot && !form.icon.trim()) { setError('Icône requise pour une catégorie racine.'); return }

    const autoSlug = (isRoot || isEdit) ? form.slug.trim() : slugify(form.label.trim())
    if ((isRoot || isSub) && !autoSlug) { setError('Slug invalide.'); return }

    setSaving(true); setError('')
    try {
      if (isRoot) {
        const res = await fetch('/api/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: autoSlug.toLowerCase(), label: form.label.trim(), icon: form.icon.trim(), parentId: null }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => [...t, { ...data, listingCount: 0, children: [] }])

      } else if (isSub) {
        const res = await fetch('/api/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: autoSlug, label: form.label.trim(), icon: '', parentId: newSubParentId }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => appendChildInTree(t, newSubParentId!, { ...data, listingCount: 0, children: [] }))

      } else if (isEdit) {
        const translationPayload = Object.entries(translations)
          .filter(([, label]) => label.trim())
          .map(([locale, label]) => ({ locale, label: label.trim() }))
        const res = await fetch('/api/categories', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editTarget!.id, label: form.label.trim(), icon: form.icon.trim(), translations: translationPayload }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); return }
        setTree(t => updateInTree(t, editTarget!.id, { label: data.label, icon: data.icon }))
      }
      closeForm()
    } finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    const res = await fetch('/api/categories', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) { setTree(t => removeFromTree(t, id)) }
    else { const d = await res.json(); setError(d.error ?? 'Erreur') }
    setConfirmDeleteId(null)
  }

  const moveRoot = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= tree.length) return
    const reordered = [...tree];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setTree(reordered)
    await Promise.all(reordered.map((c, i) =>
      fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, order: i }) })
    ))
  }

  const toggle = (id: string) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  // Recursive row renderer
  const renderRows = (rows: TreeRow[], depth: number, parentId: string | null): React.ReactNode =>
    rows.map((row, i) => (
      <div key={row.id}>
        <div
          className={`flex items-center gap-3 pr-5 py-3 border-t border-gray-100 ${
            depth === 0 ? 'px-5 bg-white' : depth === 1 ? 'bg-gray-50/70' : 'bg-gray-100/70'
          }`}
          style={{ paddingLeft: `${20 + depth * 32}px` }}
        >
          {/* Reorder (root only) */}
          {depth === 0 && (
            <div className="flex flex-col shrink-0">
              <button onClick={() => moveRoot(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-navy disabled:opacity-20"><ChevronUp size={13} /></button>
              <button onClick={() => moveRoot(i, 1)} disabled={i === tree.length - 1} className="text-gray-300 hover:text-navy disabled:opacity-20"><ChevronDown size={13} /></button>
            </div>
          )}

          {/* Expand toggle */}
          <button onClick={() => toggle(row.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-navy shrink-0">
            {row.children.length > 0
              ? <ChevronRight size={13} className={expanded.has(row.id) ? 'rotate-90 transition-transform' : 'transition-transform'} />
              : <span className="w-3" />}
          </button>

          {depth === 0 && <span className="text-xl shrink-0">{row.icon}</span>}

          <div className="flex-1 min-w-0">
            <p className={`truncate ${depth === 0 ? 'text-sm font-bold text-navy' : 'text-sm font-semibold text-gray-700'}`}>{row.label}</p>
            <p className="text-xs text-gray-400">/{row.slug} · {row.listingCount} ann. · {row.children.length} sous-cat.</p>
          </div>

          {/* Actions */}
          {confirmDeleteId === row.id ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">Supprimer ?</span>
              <button onClick={() => remove(row.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600">Confirmer</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200">Annuler</button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => openNewSub(row.id)}
                className="flex items-center gap-1 text-xs font-semibold text-orange-primary border border-orange-primary/30 bg-orange-soft px-2 py-1 rounded-lg hover:bg-orange-primary/10">
                <Plus size={11} /> Sous-cat.
              </button>
              <button onClick={() => openEdit(row, parentId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-primary hover:bg-orange-soft">
                <Pencil size={13} />
              </button>
              <button
                onClick={() => {
                  const total = countDescendantListings(row)
                  if (total > 0) setError(`Catégorie utilisée par ${total} annonce(s).`)
                  else setConfirmDeleteId(row.id)
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Recursive children */}
        {expanded.has(row.id) && renderRows(row.children, depth + 1, row.id)}
      </div>
    ))

  const newSubParentLabel = newSubParentId ? findInTree(tree, newSubParentId)?.label : null
  const isSubForm = newSubParentId !== null

  const totalNodes    = useMemo(() => tree.reduce((s, r) => s + countAllNodes(r), 0), [tree])
  const subCount      = totalNodes - tree.length
  const listingsTotal = useMemo(() => tree.reduce((s, r) => s + countDescendantListings(r), 0), [tree])

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Catégories d&apos;annonces</h1>
          <p className="text-sm text-gray-400 mt-0.5">Organisez l&apos;arborescence des catégories du site.</p>
        </div>
        <button onClick={openNewRoot}
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-navy/5">
            <Layers size={17} className="text-navy" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{tree.length}</p>
          <p className="text-xs text-gray-400 mt-1.5">Catégories racines</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-indigo-soft">
            <FolderTree size={17} className="text-indigo-primary" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{subCount}</p>
          <p className="text-xs text-gray-400 mt-1.5">Sous-catégories</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-orange-soft">
            <FileText size={17} className="text-orange-primary" />
          </div>
          <p className="text-xl font-black text-navy leading-none">{listingsTotal}</p>
          <p className="text-xs text-gray-400 mt-1.5">Annonces classées</p>
        </div>
      </div>

      <div className="space-y-4">
        {error && !isEditing && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {isEditing && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-navy">
                {isNewRoot ? 'Nouvelle catégorie racine'
                  : newSubParentId ? `Sous-catégorie de « ${newSubParentLabel} »`
                  : 'Modifier'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {isSubForm ? (
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

            {/* Translation section — edit mode only */}
            {editTarget && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Traductions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRANSLATION_LOCALES.map(({ code, name }) => (
                    <div key={code}>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">{name}</label>
                      <input
                        value={translations[code] ?? ''}
                        onChange={e => setTranslations(t => ({ ...t, [code]: e.target.value }))}
                        placeholder={form.label || '…'}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving}
                className="bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={closeForm} className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {tree.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">Aucune catégorie. Cliquez sur « Ajouter » pour commencer.</div>
          ) : renderRows(tree, 0, null)}
        </div>
      </div>
    </div>
  )
}
