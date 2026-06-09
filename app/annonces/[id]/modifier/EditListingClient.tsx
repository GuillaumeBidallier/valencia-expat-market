'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ImagePlus, X, ArrowLeft, Loader2 } from 'lucide-react'
import { categories, neighborhoods } from '@/lib/categories'

const MAX_IMAGES = 5
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

type ExistingImage = { id: string; url: string }

type Props = {
  listing: {
    id: string; title: string; description: string
    price: number | null; categorySlug: string
    neighborhood: string; phone: string
    images: ExistingImage[]
  }
}

export default function EditListingClient({ listing }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title:        listing.title,
    categorySlug: listing.categorySlug,
    price:        listing.price != null ? String(listing.price) : '',
    description:  listing.description,
    neighborhood: listing.neighborhood,
    phone:        listing.phone,
  })
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(listing.images)
  const [removedIds, setRemovedIds]         = useState<Set<string>>(new Set())
  const [newFiles, setNewFiles]             = useState<File[]>([])
  const [newPreviews, setNewPreviews]       = useState<string[]>([])
  const [errors, setErrors]                 = useState<Record<string, string>>({})
  const [uploadError, setUploadError]       = useState('')
  const [saving, setSaving]                 = useState(false)

  const totalImages = existingImages.filter(i => !removedIds.has(i.id)).length + newFiles.length

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return
    const arr = Array.from(fl)
    const valid = arr.filter(f => ALLOWED.includes(f.type) && f.size <= MAX_SIZE)
    if (valid.length < arr.length) setUploadError(`${arr.length - valid.length} fichier(s) ignoré(s) — JPG/PNG/WebP, max 5 Mo.`)
    else setUploadError('')
    const slots = MAX_IMAGES - totalImages
    const toAdd = valid.slice(0, slots)
    setNewFiles(p => [...p, ...toAdd])
    setNewPreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))])
  }

  const removeExisting = (id: string) => setRemovedIds(prev => new Set([...prev, id]))

  const removeNew = (i: number) => {
    URL.revokeObjectURL(newPreviews[i])
    setNewFiles(p => p.filter((_, j) => j !== i))
    setNewPreviews(p => p.filter((_, j) => j !== i))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Le titre est obligatoire'
    if (!form.categorySlug) e.categorySlug = 'Choisissez une catégorie'
    if (!form.neighborhood) e.neighborhood = 'Choisissez un quartier'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    try {
      // 1 — Update listing fields
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        form.title.trim(),
          description:  form.description.trim(),
          price:        form.price ? Number(form.price) : null,
          neighborhood: form.neighborhood,
        }),
      })

      // 2 — Delete removed images
      await Promise.all(
        [...removedIds].map(imageId =>
          fetch(`/api/listings/${listing.id}/images`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId }),
          })
        )
      )

      // 3 — Upload new images
      if (newFiles.length > 0) {
        const fd = new FormData()
        newFiles.forEach(f => fd.append('files', f))
        await fetch(`/api/listings/${listing.id}/images`, { method: 'POST', body: fd })
      }

      router.push(`/annonces/${listing.id}`)
      router.refresh()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href={`/annonces/${listing.id}`} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy leading-tight">Modifier l&apos;annonce</h1>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{listing.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Informations */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-navy">Informations</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Titre *</label>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="Ex : Canapé 3 places IKEA gris"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catégorie *</label>
            <select
              value={form.categorySlug}
              onChange={set('categorySlug')}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all ${errors.categorySlug ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
            </select>
            {errors.categorySlug && <p className="text-xs text-red-500 mt-1">{errors.categorySlug}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prix (€) — laisser vide pour un don</label>
            <input
              type="number"
              value={form.price}
              onChange={set('price')}
              placeholder="150"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={5}
              placeholder="État, dimensions, raisons de la vente..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all resize-none"
            />
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-bold text-navy">Photos</h2>
            <span className="text-xs text-gray-400">{totalImages}/{MAX_IMAGES}</span>
          </div>
          {uploadError && <p className="text-xs text-red-500 mb-3">{uploadError}</p>}

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {/* Existing images */}
            {existingImages.map(img => {
              const removed = removedIds.has(img.id)
              return (
                <div key={img.id} className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 transition-opacity ${removed ? 'opacity-30' : ''}`}>
                  <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  {!removed ? (
                    <button type="button" onClick={() => removeExisting(img.id)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                      <X size={10} className="text-white" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => setRemovedIds(prev => { const s = new Set(prev); s.delete(img.id); return s })} className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[10px] font-bold">
                      Restaurer
                    </button>
                  )}
                </div>
              )
            })}

            {/* New image previews */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-2 ring-orange-primary/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                  <X size={10} className="text-white" />
                </button>
                <span className="absolute bottom-1 left-1 text-[9px] bg-orange-primary text-white px-1.5 py-0.5 rounded font-bold">Nouveau</span>
              </div>
            ))}

            {/* Add button */}
            {totalImages < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-orange-primary hover:text-orange-primary text-gray-400 transition-colors"
              >
                <ImagePlus size={18} />
                <span className="text-[10px] font-semibold">Ajouter</span>
              </button>
            )}
          </div>
        </section>

        {/* Localisation */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-navy">Localisation &amp; contact</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quartier / Ville *</label>
            <select
              value={form.neighborhood}
              onChange={set('neighborhood')}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all ${errors.neighborhood ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">Choisir un quartier</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Téléphone / WhatsApp</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+34 6XX XXX XXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all"
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href={`/annonces/${listing.id}`}
            className="flex-1 text-center py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-2 flex-1 flex items-center justify-center gap-2 bg-orange-primary text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</> : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
