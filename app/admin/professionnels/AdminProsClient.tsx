'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, Star, ArrowLeft, X, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Professional } from '@prisma/client'
import { proCategories } from '@/lib/proCategories'

const TIER_LABELS: Record<string, string> = { FREE: 'Gratuit', PREMIUM: 'Premium', PREMIUM_PLUS: 'Premium+' }
const TIER_COLORS: Record<string, string> = {
  FREE:         'bg-gray-100 text-gray-500',
  PREMIUM:      'bg-indigo-100 text-indigo-700',
  PREMIUM_PLUS: 'bg-orange-100 text-orange-700',
}
const TIER_RING: Record<string, string> = {
  FREE:         'border-gray-100',
  PREMIUM:      'border-indigo-200',
  PREMIUM_PLUS: 'border-orange-200',
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-xl [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-orange-primary/30 [&_input]:bg-gray-50 [&_select]:w-full [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-xl [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm [&_select]:focus:outline-none [&_select]:bg-gray-50">
        {children}
      </div>
    </div>
  )
}

export default function AdminProsClient({ initialPros }: { initialPros: Professional[] }) {
  const [pros, setPros]       = useState<Professional[]>(initialPros)
  const [editing, setEditing] = useState<Partial<Professional> | null>(null)
  const [isNew, setIsNew]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const openNew  = () => { setEditing({ ...EMPTY }); setIsNew(true); setError('') }
  const openEdit = (p: Professional) => { setEditing({ ...p }); setIsNew(false); setError('') }
  const closeForm = () => { setEditing(null); setError('') }

  const save = async () => {
    if (!editing) return
    setSaving(true); setError('')
    try {
      const url    = isNew ? '/api/admin/professionnels' : `/api/admin/professionnels/${editing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res    = await fetch(url, {
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

  const tierCounts = {
    FREE:         pros.filter(p => p.tier === 'FREE').length,
    PREMIUM:      pros.filter(p => p.tier === 'PREMIUM').length,
    PREMIUM_PLUS: pros.filter(p => p.tier === 'PREMIUM_PLUS').length,
  }

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
              <h1 className="text-lg font-black tracking-tight">Professionnels</h1>
              <p className="text-xs text-white/40">{pros.length} professionnel{pros.length !== 1 ? 's' : ''} référencé{pros.length !== 1 ? 's' : ''}</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Tier KPIs ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {([
            { tier: 'FREE',         label: 'Gratuit',  color: 'text-gray-500',    bg: 'bg-white',        dot: 'bg-gray-300' },
            { tier: 'PREMIUM',      label: 'Premium',  color: 'text-indigo-primary', bg: 'bg-indigo-soft', dot: 'bg-indigo-400' },
            { tier: 'PREMIUM_PLUS', label: 'Premium+', color: 'text-orange-primary', bg: 'bg-orange-soft', dot: 'bg-orange-primary' },
          ] as const).map(t => (
            <div key={t.tier} className={`${t.bg} rounded-2xl border border-gray-100 shadow-sm p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.label}</span>
              </div>
              <p className={`text-3xl font-black ${t.color} leading-none`}>{tierCounts[t.tier]}</p>
            </div>
          ))}
        </div>

        {/* ── Slide-in form ───────────────────────────────────── */}
        {editing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-black text-navy">{isNew ? 'Nouveau professionnel' : `Modifier — ${editing.name}`}</h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
                {([
                  { key: 'verified',    label: 'Vérifié ✓',      color: 'accent-blue-600' },
                  { key: 'featured',    label: 'Featured ⭐',     color: 'accent-orange-500' },
                  { key: 'recommended', label: 'Recommandé 🏅',  color: 'accent-indigo-600' },
                ] as const).map(c => (
                  <label key={c.key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={(editing as Record<string, unknown>)[c.key] as boolean ?? false}
                      onChange={e => set(c.key as keyof Professional, e.target.checked)}
                      className={`w-4 h-4 rounded ${c.color}`}
                    />
                    {c.label}
                  </label>
                ))}
              </div>

              {/* Zones */}
              <div className="mt-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MapPin size={11} /> Zones géo-ciblées (Géo Pub)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_ZONES.map(z => {
                    const zones  = (editing as { zones?: string[] }).zones ?? []
                    const active = zones.includes(z)
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => set('zones' as keyof Professional, active ? zones.filter(x => x !== z) : [...zones, z])}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-orange-primary text-white border-orange-primary'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-orange-primary hover:text-orange-primary'
                        }`}
                      >
                        {z}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50 resize-none"
                />
              </div>

              {/* Photos */}
              <div className="mt-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Photos (URLs, une par ligne)</label>
                <textarea
                  value={(editing.photos as string[] ?? []).join('\n')}
                  onChange={e => set('photos', e.target.value.split('\n').filter(Boolean))}
                  rows={2}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 bg-gray-50 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 bg-orange-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : isNew ? 'Créer le professionnel' : 'Enregistrer les modifications'}
                </button>
                <button
                  onClick={closeForm}
                  className="px-6 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── List ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {pros.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-xl">⭐</div>
              <p className="text-gray-400 text-sm">Aucun professionnel — cliquez sur Ajouter.</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_100px_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Professionnel</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Catégorie · Ville</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hidden sm:block">Tier</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-right">Actions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {pros.map(p => {
                  const cat = proCategories.find(c => c.slug === p.category)
                  return (
                    <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors border-l-2 ${TIER_RING[p.tier]}`}>
                      {/* Logo / avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {p.logo
                          ? <img src={p.logo} alt="" className="w-full h-full object-cover" />
                          : <span className="text-lg">{cat?.icon ?? '🏢'}</span>}
                      </div>

                      {/* Name + badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <p className="font-bold text-navy text-sm">{p.name}</p>
                          {(p as { recommended?: boolean }).recommended && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">🏅 Recommandé</span>
                          )}
                          {p.verified && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle size={8} /> Vérifié
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{cat?.label ?? p.category} · {p.city}</p>
                      </div>

                      {/* Tier */}
                      <div className="hidden sm:block">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TIER_COLORS[p.tier]}`}>
                          {p.tier === 'PREMIUM_PLUS' ? <><Star size={9} className="inline mr-0.5" />Premium+</> : TIER_LABELS[p.tier]}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deletePro(p.id)}
                          className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
