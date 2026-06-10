'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImagePlus, X, Lock, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useListings } from '@/context/ListingsContext'
import { categories } from '@/lib/categories'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CityAutocomplete, { type CitySelection } from '@/components/listings/CityAutocomplete'
import { FREE_MAX_PHOTOS, UPGRADED_MAX_PHOTOS } from '@/lib/stripe'

const ADMIN_MAX = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default function DeposerAnnoncePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user } = useAuth()
  const { addListing } = useListings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin   = user?.role === 'ADMIN'
  const isPremium = user?.role === 'PREMIUM' || isAdmin

  const [hasUpgrade, setHasUpgrade]     = useState(false)
  const [verifying, setVerifying]       = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const MAX_IMAGES = isAdmin ? ADMIN_MAX : isPremium ? UPGRADED_MAX_PHOTOS : hasUpgrade ? UPGRADED_MAX_PHOTOS : FREE_MAX_PHOTOS

  const [form, setForm] = useState({
    title: '',
    categorySlug: '',
    price: '',
    description: '',
    phone: '',
  })
  const [location, setLocation] = useState<CitySelection | null>(null)
  const [files, setFiles]       = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [errors, setErrors]     = useState<Record<string, string>>({})

  // Check for existing active upgrade on mount
  useEffect(() => {
    if (!isAuthenticated || isPremium) return
    fetch('/api/stripe/photo-upgrade')
      .then(r => r.json())
      .then(d => { if (d.hasUpgrade) setHasUpgrade(true) })
      .catch(() => {})
  }, [isAuthenticated, isPremium])

  // Handle Stripe redirect with upgrade_session param
  const upgradeSession = searchParams.get('upgrade_session')
  useEffect(() => {
    if (!upgradeSession || hasUpgrade) return
    setVerifying(true)
    fetch('/api/stripe/photo-upgrade/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeSessionId: upgradeSession }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) setHasUpgrade(true) })
      .finally(() => setVerifying(false))
  }, [upgradeSession, hasUpgrade])

  useEffect(() => {
    if (!isAuthenticated) router.replace('/connexion')
  }, [isAuthenticated, router])

  useEffect(() => {
    return () => previews.forEach(URL.revokeObjectURL)
  }, [previews])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const incoming = Array.from(selected)
    const valid = incoming.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE)
    const rejected = incoming.length - valid.length
    if (rejected > 0) setUploadError(`${rejected} fichier(s) ignoré(s) — JPG/PNG/WebP, max 5 Mo.`)
    else setUploadError('')
    const slots = MAX_IMAGES - files.length
    const toAdd = valid.slice(0, slots)
    setFiles(prev => [...prev, ...toAdd])
    setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setFiles(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  const handleBuyUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/photo-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setUpgradeLoading(false)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim())    e.title        = 'Le titre est obligatoire'
    if (!form.categorySlug)    e.categorySlug = 'Choisissez une catégorie'
    if (!location)             e.neighborhood = 'Saisissez et sélectionnez un quartier ou une ville'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !location) return
    setLoading(true)
    try {
      const { id, pendingReview } = await addListing({
        title:        form.title,
        categorySlug: form.categorySlug,
        price:        form.price ? Number(form.price) : null,
        description:  form.description,
        neighborhood: location.name,
        lat:          location.lat,
        lng:          location.lng,
        phone:        form.phone || undefined,
      })

      if (files.length > 0) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        const res = await fetch(`/api/listings/${id}/images`, { method: 'POST', body: fd })
        if (!res.ok) console.error('Upload images failed', await res.text())
      }

      // Consume the upgrade token after successful submission
      if (hasUpgrade) {
        await fetch('/api/stripe/photo-upgrade/consume', { method: 'POST' })
      }

      router.push(pendingReview ? '/annonce-en-attente' : `/annonces/${id}`)
    } catch (err) {
      console.error('Erreur lors de la publication', err)
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  const showUpgradeCTA = !isPremium && !hasUpgrade && files.length >= FREE_MAX_PHOTOS
  const photosLabel = isAdmin
    ? `Jusqu'à ${ADMIN_MAX} photos · JPG, PNG ou WebP · max 5 Mo chacune.`
    : isPremium
    ? `Jusqu'à ${UPGRADED_MAX_PHOTOS} photos incluses · JPG, PNG ou WebP · max 5 Mo chacune.`
    : hasUpgrade
    ? `6 photos débloquées (3 incluses + 3 achetées) · JPG, PNG ou WebP · max 5 Mo chacune.`
    : `3 photos incluses gratuitement · JPG, PNG ou WebP · max 5 Mo chacune.`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2">Déposer une annonce</h1>
      <p className="text-sm text-gray-400 mb-8">Remplissez les informations ci-dessous pour publier votre annonce.</p>

      {verifying && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Loader2 size={16} className="text-blue-500 animate-spin shrink-0" />
          <p className="text-sm text-blue-700">Vérification du paiement…</p>
        </div>
      )}

      {hasUpgrade && !verifying && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">3 photos supplémentaires débloquées ✓ — vous pouvez ajouter jusqu&apos;à 6 photos.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-navy">Informations de l&apos;annonce</h2>
          <Input id="title" label="Titre *" placeholder="Ex : Canapé 3 places IKEA gris" value={form.title} onChange={set('title')} error={errors.title} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Catégorie *</label>
            <select value={form.categorySlug} onChange={set('categorySlug')} className={`border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition ${errors.categorySlug ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Choisir une catégorie</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
            </select>
            {errors.categorySlug && <p className="text-xs text-red-500">{errors.categorySlug}</p>}
          </div>

          <Input id="price" label="Prix en euros (laisser vide pour un don)" type="number" placeholder="Ex : 150" value={form.price} onChange={set('price')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={5}
              placeholder="Décrivez l'état, les dimensions, les raisons de la vente..."
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition resize-none"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-semibold text-navy">Photos</h2>
            <span className="text-xs text-gray-400">{files.length}/{MAX_IMAGES}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">{photosLabel}</p>

          {uploadError && <p className="text-xs text-red-500 mb-3">{uploadError}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          <div className="grid grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-orange-primary transition-colors text-gray-400 hover:text-orange-primary"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>

          {/* CTA paiement unique — 3 photos supplémentaires */}
          {showUpgradeCTA && (
            <div className="mt-4 flex items-start gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-4 py-4">
              <Lock size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-700">Limite de 3 photos atteinte</p>
                <p className="text-xs text-indigo-500 mt-0.5 mb-3">
                  Ajoutez 3 photos supplémentaires pour cette annonce — paiement unique, sans abonnement.
                </p>
                <button
                  type="button"
                  onClick={handleBuyUpgrade}
                  disabled={upgradeLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {upgradeLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  3 photos supplémentaires — 1,99€
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Localisation + contact */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-navy">Localisation &amp; contact</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy">Quartier / Ville *</label>
            <CityAutocomplete
              value={location?.name ?? ''}
              onChange={sel => {
                setLocation(sel)
                if (sel) setErrors(e => ({ ...e, neighborhood: '' }))
              }}
              error={errors.neighborhood}
              placeholder="Ex : Ruzafa, Benimaclet, Paterna…"
            />
            {location && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                ✓ {location.name} — position enregistrée
              </p>
            )}
          </div>

          <Input id="phone" label="Numéro de téléphone / WhatsApp" type="tel" placeholder="+34 6XX XXX XXX" value={form.phone} onChange={set('phone')} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Publication en cours...' : "Publier l'annonce"}
        </Button>
      </form>
    </div>
  )
}
