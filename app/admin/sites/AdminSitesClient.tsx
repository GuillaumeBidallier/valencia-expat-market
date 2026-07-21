'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Globe2, X } from 'lucide-react'

type Site = {
  id: string; domain: string; name: string; country: string
  primaryColor: string; secondaryColor: string; active: boolean; publiclyLive: boolean
  createdAt: string; updatedAt: string
}

type FormState = { domain: string; name: string; country: string; primaryColor: string; secondaryColor: string }
const EMPTY: FormState = { domain: '', name: '', country: '', primaryColor: '#F97316', secondaryColor: '#12122A' }

export default function AdminSitesClient({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  function openEdit(site: Site) {
    setEditingId(site.id)
    setForm({ domain: site.domain, name: site.name, country: site.country, primaryColor: site.primaryColor, secondaryColor: site.secondaryColor })
    setError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/sites/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, country: form.country, primaryColor: form.primaryColor, secondaryColor: form.secondaryColor }),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return }
        const updated = await res.json()
        setSites(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s))
      } else {
        const res = await fetch('/api/admin/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return }
        const created = await res.json()
        setSites(prev => [...prev, created])
      }
      setShowForm(false)
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(site: Site) {
    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !site.active }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Erreur lors de la mise à jour du statut')
        return
      }
      const updated = await res.json()
      setError(null)
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, ...updated } : s))
    } catch {
      setError('Erreur réseau lors de la mise à jour du statut')
    }
  }

  async function togglePubliclyLive(site: Site) {
    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publiclyLive: !site.publiclyLive }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Erreur lors de la mise à jour du statut public')
        return
      }
      const updated = await res.json()
      setError(null)
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, ...updated } : s))
    } catch {
      setError('Erreur réseau lors de la mise à jour du statut public')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3">
            <ArrowLeft size={14} /> Retour
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Sites &amp; Pays</h1>
          <p className="text-sm text-white/40 mt-0.5">{sites.length} site{sites.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={openCreate}
          className="mb-6 inline-flex items-center gap-2 bg-orange-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un pays
        </button>

        {error && !showForm && (
          <p className="mb-4 text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {sites.map(site => (
            <div key={site.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: site.primaryColor + '20' }}>
                  <Globe2 size={18} style={{ color: site.primaryColor }} />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{site.name}</p>
                  <p className="text-xs text-gray-400">{site.domain} · {site.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePubliclyLive(site)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${site.publiclyLive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                  title="Bascule si les formulaires publics (annonces, inscription pro) sont ouverts sur ce site"
                >
                  {site.publiclyLive ? 'Publié' : 'Pas encore public'}
                </button>
                <button
                  onClick={() => toggleActive(site)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${site.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {site.active ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => openEdit(site)} className="text-gray-400 hover:text-navy transition-colors">
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-navy">{editingId ? 'Modifier le site' : 'Nouveau site'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Domaine</label>
                  <input
                    value={form.domain}
                    onChange={e => setForm(f => ({ ...f, domain: e.target.value.toLowerCase() }))}
                    placeholder="1000clic.be"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nom</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="1000Click Belgique"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pays</label>
                <input
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="Belgique"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Couleur primaire</label>
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} className="w-full h-9 rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Couleur secondaire</label>
                  <input type="color" value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} className="w-full h-9 rounded-lg border border-gray-200" />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-orange-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer le site'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
