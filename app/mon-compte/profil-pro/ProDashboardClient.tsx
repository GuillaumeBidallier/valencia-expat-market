'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Pencil, Plus, Trash2, ExternalLink, Check, Loader2, X } from 'lucide-react'
import type { Professional } from '@prisma/client'

type Props = { pro: Professional }

export default function ProDashboardClient({ pro: initial }: Props) {
  const [pro, setPro] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: initial.name,
    description: initial.description ?? '',
    phone: initial.phone ?? '',
    whatsapp: initial.whatsapp ?? '',
    website: initial.website ?? '',
    city: initial.city,
    zones: initial.zones.join(', '),
  })
  const [uploading, setUploading] = useState<'logo' | 'banner' | 'photo' | null>(null)
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File, type: 'logo' | 'banner' | 'photo') => {
    setUploading(type)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/pro/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setPro(p => ({
        ...p,
        ...(type === 'logo' ? { logo: url } : type === 'banner' ? { banner: url } : { photos: [...p.photos, url] }),
      }))
    }
    setUploading(null)
  }

  const removePhoto = async (url: string) => {
    setRemovingPhoto(url)
    const photos = pro.photos.filter(p => p !== url)
    await fetch('/api/pro/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos }),
    })
    setPro(p => ({ ...p, photos }))
    setRemovingPhoto(null)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const zones = form.zones.split(',').map(z => z.trim()).filter(Boolean)
    await fetch('/api/pro/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, zones }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-navy">Ma vitrine</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez l'apparence de votre profil professionnel</p>
        </div>
        <Link
          href={`/professionnels/${pro.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-orange-primary hover:underline"
        >
          Voir ma vitrine <ExternalLink size={13} />
        </Link>
      </div>

      <div className="space-y-5">

        {/* Banner */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-navy to-slate-600 group">
            {pro.banner ? (
              <Image src={pro.banner} alt="Bannière" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                Aucune bannière — cliquer pour en ajouter une
              </div>
            )}
            <button
              onClick={() => bannerRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group-hover:opacity-100 opacity-0"
              aria-label="Changer la bannière"
            >
              {uploading === 'banner' ? (
                <Loader2 size={28} className="text-white animate-spin" />
              ) : (
                <div className="flex items-center gap-2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <Camera size={16} /> Changer la bannière
                </div>
              )}
            </button>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'banner')} />

          {/* Logo avatar */}
          <div className="px-5 pb-5">
            <div className="relative -mt-10 w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 shrink-0 group inline-block">
              {pro.logo ? (
                <Image src={pro.logo} alt="Logo" fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50">🏢</div>
              )}
              <button
                onClick={() => logoRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Changer le logo"
              >
                {uploading === 'logo' ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
              </button>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'logo')} />
            <p className="text-xs text-gray-400 mt-1.5">Cliquez sur le logo pour le modifier. Format recommandé : carré, min. 200×200 px.</p>
          </div>
        </section>

        {/* Info form */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
            <Pencil size={15} className="text-orange-primary" /> Informations
          </h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-name">Nom de l'entreprise</label>
              <input
                id="pro-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-desc">Description</label>
              <textarea
                id="pro-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Présentez votre activité, vos services, votre expérience..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-city">Ville principale</label>
                <input
                  id="pro-city"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-phone">Téléphone</label>
                <input
                  id="pro-phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+34 6xx xxx xxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-wa">WhatsApp</label>
                <input
                  id="pro-wa"
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+34 6xx xxx xxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-web">Site web</label>
                <input
                  id="pro-web"
                  type="url"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://monsite.es"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-zones">
                Zones d'intervention <span className="font-normal text-gray-400">(séparées par des virgules)</span>
              </label>
              <input
                id="pro-zones"
                value={form.zones}
                onChange={e => setForm(f => ({ ...f, zones: e.target.value }))}
                placeholder="Valencia, Alicante, Murcia"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
              />
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Check size={15} />}
                {saving ? 'Enregistrement…' : saved ? 'Sauvegardé !' : 'Enregistrer'}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">✓ Modifications enregistrées</span>}
            </div>
          </form>
        </section>

        {/* Photo gallery */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy flex items-center gap-2">
              <Camera size={15} className="text-orange-primary" /> Photos
            </h2>
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploading === 'photo' || pro.photos.length >= 8}
              className="inline-flex items-center gap-1.5 text-sm text-orange-primary border border-orange-primary/30 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading === 'photo' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Ajouter
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'photo')} />

          {pro.photos.length === 0 ? (
            <button
              onClick={() => photoRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-primary hover:text-orange-primary transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm">Ajouter des photos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {pro.photos.map((url) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  <button
                    onClick={() => removePhoto(url)}
                    disabled={removingPhoto === url}
                    aria-label="Supprimer cette photo"
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {removingPhoto === url ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                  </button>
                </div>
              ))}
              {pro.photos.length < 8 && (
                <button
                  onClick={() => photoRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-orange-primary hover:text-orange-primary transition-colors"
                  aria-label="Ajouter une photo"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">{pro.photos.length}/8 photos · Max 5 Mo par photo</p>
        </section>
      </div>
    </div>
  )
}
