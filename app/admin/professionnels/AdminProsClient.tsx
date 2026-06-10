'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, Star } from 'lucide-react'
import type { Professional } from '@prisma/client'
import { proCategories } from '@/lib/proCategories'

const TIER_LABELS = { FREE: 'Gratuit', PREMIUM: 'Premium', PREMIUM_PLUS: 'Premium+' }
const TIER_COLORS = {
  FREE: 'bg-gray-100 text-gray-600',
  PREMIUM: 'bg-indigo-100 text-indigo-700',
  PREMIUM_PLUS: 'bg-orange-100 text-orange-700',
}

const ALL_ZONES = [
  'Valencia', 'Alicante', 'Málaga', 'Barcelona', 'Madrid',
  'Murcia', 'Torrevieja', 'Benidorm', 'Marbella', 'Canarias',
]

const EMPTY: Partial<Professional> = {
  name: '', slug: '', category: 'immobilier', city: 'Valencia',
  description: '', phone: '', whatsapp: '', website: '', logo: '',
  photos: [], tier: 'FREE', verified: false, featured: false,
  recommended: false, zones: [],
}

export default function AdminProsClient({ initialPros }: { initialPros: Professional[] }) {
  const [pros, setPros] = useState<Professional[]>(initialPros)
  const [editing, setEditing] = useState<Partial<Professional> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); setError('') }
  const openEdit = (p: Professional) => { setEditing({ ...p }); setIsNew(false); setError('') }
  const closeForm = () => { setEditing(null); setError('') }

  const save = async () => {
    if (!editing) return
    setSaving(true); setError('')
    try {
      const url = isNew ? '/api/admin/professionnels' : `/api/admin/professionnels/${editing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!res.ok) { const d = await res.json(); setError(JSON.stringify(d.error)); return }
      const saved: Professional = await res.json()
      if (isNew) {
        setPros(p => [saved, ...p])
      } else {
        setPros(p => p.map(x => x.id === saved.id ? saved : x))
      }
      closeForm()
    } finally { setSaving(false) }
  }

  const deletePro = async (id: string) => {
    if (!confirm('Supprimer ce professionnel ?')) return
    await fetch(`/api/admin/professionnels/${id}`, { method: 'DELETE' })
    setPros(p => p.filter(x => x.id !== id))
  }

  const set = (k: keyof Professional, v: unknown) => setEditing(e => e ? { ...e, [k]: v } : e)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-navy">⭐ Admin — Professionnels</h1>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-orange-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {/* Formulaire */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-navy mb-4">{isNew ? 'Nouveau professionnel' : 'Modifier'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom *"><input value={editing.name ?? ''} onChange={e => set('name', e.target.value)} /></Field>
              <Field label="Slug *"><input value={editing.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="mon-nom-pro" /></Field>
              <Field label="Catégorie *">
                <select value={editing.category ?? ''} onChange={e => set('category', e.target.value)}>
                  {proCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Ville *"><input value={editing.city ?? ''} onChange={e => set('city', e.target.value)} /></Field>
              <Field label="Téléphone"><input value={editing.phone ?? ''} onChange={e => set('phone', e.target.value)} /></Field>
              <Field label="WhatsApp"><input value={editing.whatsapp ?? ''} onChange={e => set('whatsapp', e.target.value)} /></Field>
              <Field label="Site web"><input value={editing.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://..." /></Field>
              <Field label="Logo (URL)"><input value={editing.logo ?? ''} onChange={e => set('logo', e.target.value)} placeholder="https://..." /></Field>
              <Field label="Tier">
                <select value={editing.tier ?? 'FREE'} onChange={e => set('tier', e.target.value)}>
                  <option value="FREE">Gratuit</option>
                  <option value="PREMIUM">Premium (50€/an)</option>
                  <option value="PREMIUM_PLUS">Premium+ (100€/an)</option>
                </select>
              </Field>
              <div className="flex items-center gap-5 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={editing.verified ?? false} onChange={e => set('verified', e.target.checked)} className="w-4 h-4" />
                  Vérifié
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={editing.featured ?? false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer font-medium">
                  <input type="checkbox" checked={(editing as { recommended?: boolean }).recommended ?? false} onChange={e => set('recommended' as keyof Professional, e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                  Recommandé ⭐
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field label="Zones géo-ciblées (Géo Pub)">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ALL_ZONES.map(z => {
                      const zones = (editing as { zones?: string[] }).zones ?? []
                      const active = zones.includes(z)
                      return (
                        <button
                          key={z}
                          type="button"
                          onClick={() => set('zones' as keyof Professional, active ? zones.filter(x => x !== z) : [...zones, z])}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-orange-primary text-white border-orange-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-primary'}`}
                        >
                          {z}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    value={editing.description ?? ''}
                    onChange={e => set('description', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Photos (URLs, une par ligne)">
                  <textarea
                    value={(editing.photos as string[] ?? []).join('\n')}
                    onChange={e => set('photos', e.target.value.split('\n').filter(Boolean))}
                    rows={3}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
                  />
                </Field>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-orange-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                onClick={closeForm}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {pros.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Aucun professionnel — cliquez sur Ajouter.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">Ville</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pros.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {proCategories.find(c => c.slug === p.category)?.label ?? p.category}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.city}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[p.tier]}`}>
                        {p.tier === 'PREMIUM_PLUS' ? <><Star size={10} className="inline mr-0.5" />Premium+</> : TIER_LABELS[p.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1.5">
                        {p.verified && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckCircle size={9} /> Vérifié</span>}
                        {p.featured && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-navy transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => deletePro(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-orange-primary/30 [&_select]:w-full [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:focus:outline-none [&_select]:bg-white">
        {children}
      </div>
    </div>
  )
}
