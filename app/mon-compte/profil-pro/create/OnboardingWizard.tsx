'use client'
import { useState, useRef } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, Zap, Upload, X } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'
import type { ProPlan } from '@/lib/stripe'

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1
  name: string
  category: string
  city: string
  zones: string[]
  // Step 2
  description: string
  phone: string
  whatsapp: string
  website: string
  phoneHidden: boolean
  // Step 3 — stored as File + local preview URL
  logoFile: File | null
  logoPreview: string | null
  bannerFile: File | null
  bannerPreview: string | null
  photoFiles: File[]
  photoPreviews: string[]
  // Step 4
  plan: ProPlan | null
}

const INITIAL: FormData = {
  name: '', category: 'immobilier', city: '', zones: [],
  description: '', phone: '', whatsapp: '', website: '', phoneHidden: false,
  logoFile: null, logoPreview: null,
  bannerFile: null, bannerPreview: null,
  photoFiles: [], photoPreviews: [],
  plan: null,
}

const STEPS = [
  { n: 1, title: 'Identité',      sub: 'Nom, catégorie et localisation' },
  { n: 2, title: 'Présentation',  sub: 'Description et coordonnées' },
  { n: 3, title: 'Visuels',       sub: 'Logo, bannière et photos' },
  { n: 4, title: 'Votre offre',   sub: 'Choisissez votre abonnement' },
]

const PLANS: { id: ProPlan; name: string; price: string; annual: string; color: string; badge: string; features: string[] }[] = [
  {
    id: 'premium_annual',
    name: 'Premium',
    price: '49,99 €/an',
    annual: 'Facturation annuelle · résiliable à tout moment',
    color: 'orange',
    badge: 'Populaire',
    features: ['Fiche professionnelle visible', 'Page dédiée sur /professionnels', 'Affichage dans les encarts pub', 'Badge "Sponsorisé"', 'Mise en avant prioritaire'],
  },
  {
    id: 'premium_plus_annual',
    name: 'Premium+',
    price: '99,99 €/an',
    annual: 'Facturation annuelle · résiliable à tout moment',
    color: 'indigo',
    badge: 'Meilleure visibilité',
    features: ['Fiche professionnelle visible', 'Page dédiée sur /professionnels', 'Affichage dans les encarts pub', 'Badge "Sponsorisé"', 'Mise en avant prioritaire', 'Badge "Recommandé"', 'Statistiques de clics'],
  },
]

// ─── Slug preview ─────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {STEPS.map(s => (
        <div key={s.n} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-orange-primary rounded-full transition-all duration-500"
            style={{ width: step >= s.n ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Step 1 — Identité ────────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: unknown) => void }) {
  const [zoneInput, setZoneInput] = useState('')
  const slug = slugify(data.name)

  const addZone = () => {
    const z = zoneInput.trim()
    if (z && !data.zones.includes(z)) onChange('zones', [...data.zones, z])
    setZoneInput('')
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Nom de votre activité <span className="text-orange-primary">*</span></label>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Ex : Marie Dupont — Avocate fiscaliste"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors"
          required
        />
        {slug && (
          <p className="text-xs text-gray-400 mt-1.5">
            <span className="text-gray-300">vendo.es/professionnels/</span>
            <span className="text-navy font-medium">{slug}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Catégorie <span className="text-orange-primary">*</span></label>
        <select
          value={data.category}
          onChange={e => onChange('category', e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors bg-white"
        >
          {proCategories.map(c => (
            <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Ville principale <span className="text-orange-primary">*</span></label>
        <input
          type="text"
          value={data.city}
          onChange={e => onChange('city', e.target.value)}
          placeholder="Valencia"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Zones d&apos;intervention <span className="text-xs font-normal text-gray-400">(optionnel)</span></label>
        <div className="flex gap-2">
          <input
            type="text"
            value={zoneInput}
            onChange={e => setZoneInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addZone() } }}
            placeholder="Ex : Alicante, Murcie…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors"
          />
          <button type="button" onClick={addZone} className="px-4 py-3 bg-orange-soft text-orange-primary rounded-xl text-sm font-bold hover:bg-orange-primary hover:text-white transition-colors">
            +
          </button>
        </div>
        {data.zones.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.zones.map(z => (
              <span key={z} className="inline-flex items-center gap-1 bg-orange-soft text-orange-primary text-xs font-bold px-3 py-1 rounded-full">
                {z}
                <button type="button" onClick={() => onChange('zones', data.zones.filter(x => x !== z))} className="hover:text-orange-dark">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 2 — Présentation ────────────────────────────────────────────────────

function Step2({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Description <span className="text-xs font-normal text-gray-400">(optionnel — max 1000 caractères)</span></label>
        <textarea
          value={data.description}
          onChange={e => onChange('description', e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Décrivez votre activité, vos services, votre expérience…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{data.description.length}/1000</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">Téléphone</label>
          <input type="tel" value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+34 612 345 678" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">WhatsApp</label>
          <input type="tel" value={data.whatsapp} onChange={e => onChange('whatsapp', e.target.value)} placeholder="+34 612 345 678" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-navy mb-1.5">Site web</label>
        <input type="url" value={data.website} onChange={e => onChange('website', e.target.value)} placeholder="https://votre-site.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary transition-colors" />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onChange('phoneHidden', !data.phoneHidden)}
          className={`w-10 h-6 rounded-full transition-colors relative ${data.phoneHidden ? 'bg-orange-primary' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.phoneHidden ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm text-navy">Masquer le numéro aux visiteurs non connectés</span>
      </label>
    </div>
  )
}

// ─── Step 3 — Visuels ────────────────────────────────────────────────────────

function Step3({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: unknown) => void }) {
  const logoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const pickFile = (file: File, type: 'logo' | 'banner') => {
    const preview = URL.createObjectURL(file)
    if (type === 'logo') { onChange('logoFile', file); onChange('logoPreview', preview) }
    else { onChange('bannerFile', file); onChange('bannerPreview', preview) }
  }

  const pickPhotos = (files: FileList) => {
    const newFiles = Array.from(files)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    onChange('photoFiles', [...data.photoFiles, ...newFiles])
    onChange('photoPreviews', [...data.photoPreviews, ...newPreviews])
  }

  const removePhoto = (i: number) => {
    onChange('photoFiles', data.photoFiles.filter((_, idx) => idx !== i))
    onChange('photoPreviews', data.photoPreviews.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <label className="block text-sm font-bold text-navy mb-2">Logo <span className="text-xs font-normal text-gray-400">(optionnel — JPG, PNG, WebP, max 5 Mo)</span></label>
        <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'logo')} />
        <button type="button" onClick={() => logoRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-orange-primary transition-colors group">
          {data.logoPreview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={data.logoPreview} alt="Logo" width={80} height={80} className="rounded-xl object-cover" />
            : <><Upload size={24} className="text-gray-300 group-hover:text-orange-primary transition-colors" /><span className="text-sm text-gray-400 group-hover:text-orange-primary transition-colors">Cliquez pour ajouter un logo</span></>
          }
        </button>
      </div>

      {/* Bannière */}
      <div>
        <label className="block text-sm font-bold text-navy mb-2">Bannière <span className="text-xs font-normal text-gray-400">(optionnel)</span></label>
        <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'banner')} />
        <button type="button" onClick={() => bannerRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-orange-primary transition-colors group">
          {data.bannerPreview
            // eslint-disable-next-line @next/next/no-img-element
            ? <div className="relative h-28"><img src={data.bannerPreview} alt="Bannière" className="w-full h-full object-cover" /></div>
            : <div className="h-28 flex flex-col items-center justify-center gap-2"><Upload size={24} className="text-gray-300 group-hover:text-orange-primary transition-colors" /><span className="text-sm text-gray-400 group-hover:text-orange-primary transition-colors">Cliquez pour ajouter une bannière</span></div>
          }
        </button>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-bold text-navy mb-2">Photos supplémentaires <span className="text-xs font-normal text-gray-400">(optionnel)</span></label>
        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => e.target.files && pickPhotos(e.target.files)} />
        <div className="grid grid-cols-3 gap-2">
          {data.photoPreviews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => photoRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-orange-primary transition-colors group">
            <Upload size={20} className="text-gray-300 group-hover:text-orange-primary transition-colors" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4 — Plan ────────────────────────────────────────────────────────────

function Step4({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center mb-6">Votre fiche sera visible immédiatement après paiement.</p>
      {PLANS.map(plan => {
        const isOrange = plan.color === 'orange'
        const isSelected = data.plan === plan.id
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange('plan', plan.id)}
            className={`w-full text-left border-2 rounded-2xl p-5 transition-all duration-200 ${
              isSelected
                ? isOrange ? 'border-orange-primary bg-orange-soft' : 'border-indigo-primary bg-indigo-soft'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-navy text-base">{plan.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOrange ? 'bg-orange-primary text-white' : 'bg-indigo-primary text-white'}`}>{plan.badge}</span>
                </div>
                <p className="text-2xl font-black text-navy">{plan.price}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{plan.annual}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                isSelected
                  ? isOrange ? 'border-orange-primary bg-orange-primary' : 'border-indigo-primary bg-indigo-primary'
                  : 'border-gray-300'
              }`}>
                {isSelected && <CheckCircle size={12} className="text-white" />}
              </div>
            </div>
            <ul className="space-y-1.5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOrange ? 'bg-orange-primary' : 'bg-indigo-primary'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onChange = (k: keyof FormData, v: unknown) => setData(d => ({ ...d, [k]: v }))

  const canNext = (): boolean => {
    if (step === 1) return data.name.trim().length >= 2 && data.city.trim().length >= 1
    if (step === 4) return data.plan !== null
    return true
  }

  const goNext = () => {
    if (!canNext()) return
    setDirection('forward')
    setStep(s => Math.min(s + 1, 4))
  }

  const goBack = () => {
    setDirection('back')
    setStep(s => Math.max(s - 1, 1))
  }

  const submit = async () => {
    if (!data.plan) return
    setSubmitting(true)
    setError('')
    try {
      // 1. Create pro record + get Stripe checkout URL
      const res = await fetch('/api/pro/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          city: data.city,
          zones: data.zones,
          description: data.description || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          website: data.website || null,
          phoneHidden: data.phoneHidden,
          plan: data.plan,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur'); setSubmitting(false); return }
      const { checkoutUrl } = json

      // 2. Upload images now that the pro record exists
      const uploadFile = async (file: File, type: 'logo' | 'banner' | 'photo'): Promise<boolean> => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', type)
        const res = await fetch('/api/pro/upload', { method: 'POST', body: fd })
        return res.ok
      }
      const uploadResults: boolean[] = []
      if (data.logoFile)   uploadResults.push(await uploadFile(data.logoFile, 'logo'))
      if (data.bannerFile) uploadResults.push(await uploadFile(data.bannerFile, 'banner'))
      for (const f of data.photoFiles) uploadResults.push(await uploadFile(f, 'photo'))

      if (uploadResults.some(ok => !ok)) {
        setError('Certaines images n\'ont pas pu être uploadées. Vous pourrez les ajouter depuis votre espace pro.')
        // Still redirect — images are optional
      }

      // 3. Redirect to Stripe
      window.location.href = checkoutUrl
    } catch {
      setError('Erreur inattendue, veuillez réessayer.')
      setSubmitting(false)
    }
  }

  const animClass = direction === 'forward' ? 'wizard-step-enter-right' : 'wizard-step-enter-left'

  return (
    <>
      <style>{`
        @keyframes wizardSlideRight { from { transform: translateX(48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes wizardSlideLeft  { from { transform: translateX(-48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .wizard-step-enter-right { animation: wizardSlideRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
        .wizard-step-enter-left  { animation: wizardSlideLeft  0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
      `}</style>

      <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-orange-primary rounded-full flex items-center justify-center">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="text-navy font-black text-base tracking-wider uppercase">1000Click Pro</span>
          </div>

          <ProgressBar step={step} />

          {/* Step header */}
          <div className="mb-6">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-1">
              Étape {step}/{STEPS.length}
            </p>
            <h1 className="text-xl font-black text-navy">{STEPS[step - 1].title}</h1>
            <p className="text-sm text-gray-400">{STEPS[step - 1].sub}</p>
          </div>

          {/* Step content — key forces re-mount → triggers animation */}
          <div key={step} className={animClass}>
            {step === 1 && <Step1 data={data} onChange={onChange} />}
            {step === 2 && <Step2 data={data} onChange={onChange} />}
            {step === 3 && <Step3 data={data} onChange={onChange} />}
            {step === 4 && <Step4 data={data} onChange={onChange} />}
          </div>

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-navy font-bold text-sm hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Retour
              </button>
            )}
            <button
              type="button"
              onClick={step < 4 ? goNext : submit}
              disabled={!canNext() || submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black text-sm py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-primary/25"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Création en cours…</>
              ) : step < 4 ? (
                <>Suivant <ChevronRight size={16} /></>
              ) : (
                <><Zap size={16} /> Payer et publier</>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">Paiement sécurisé via Stripe · Sans engagement</p>
        </div>
      </div>
    </>
  )
}
