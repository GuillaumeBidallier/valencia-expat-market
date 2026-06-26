'use client'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Loader2, Check, Star, Zap } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'
import type { ProPlan } from '@/lib/stripe'

// ─── Plan definitions ────────────────────────────────────────────────────────

type PlanOption = {
  id: ProPlan
  tier: 'Premium' | 'Premium+'
  price: string
  period: string
  highlight: boolean
  features: string[]
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'premium_monthly',
    tier: 'Premium',
    price: '49 €',
    period: '/mois · sans engagement',
    highlight: false,
    features: [
      'Fiche professionnelle visible',
      'Affichage dans tous les encarts',
      'Badge "Sponsorisé"',
      'Mise en avant prioritaire',
    ],
  },
  {
    id: 'premium_annual',
    tier: 'Premium',
    price: '490 €',
    period: '/an · 2 mois offerts',
    highlight: false,
    features: [
      'Fiche professionnelle visible',
      'Affichage dans tous les encarts',
      'Badge "Sponsorisé"',
      'Mise en avant prioritaire',
    ],
  },
  {
    id: 'premium_plus_monthly',
    tier: 'Premium+',
    price: '99 €',
    period: '/mois · sans engagement',
    highlight: true,
    features: [
      'Tout ce qu\'inclut Premium',
      'Badge "Recommandé"',
      'Visibilité maximale',
      'Statistiques de clics (bientôt)',
    ],
  },
  {
    id: 'premium_plus_annual',
    tier: 'Premium+',
    price: '990 €',
    period: '/an · 2 mois offerts',
    highlight: true,
    features: [
      'Tout ce qu\'inclut Premium',
      'Badge "Recommandé"',
      'Visibilité maximale',
      'Statistiques de clics (bientôt)',
    ],
  },
]

// ─── Form state ───────────────────────────────────────────────────────────────

type FormData = {
  name: string
  category: string
  city: string
  description: string
  phone: string
  whatsapp: string
  website: string
  phoneHidden: boolean
  zones: string
  plan: ProPlan | ''
}

const INITIAL: FormData = {
  name: '',
  category: '',
  city: '',
  description: '',
  phone: '',
  whatsapp: '',
  website: '',
  phoneHidden: false,
  zones: '',
  plan: '',
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: number }) {
  const labels = ['Activité', 'Coordonnées', 'Abonnement']
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {labels.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-orange-primary text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check size={14} /> : n}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${active ? 'text-orange-primary' : done ? 'text-emerald-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`w-10 h-0.5 mb-4 ${n < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Activité ────────────────────────────────────────────────────────

function Step1({
  form,
  setForm,
  onNext,
}: {
  form: FormData
  setForm: (f: FormData) => void
  onNext: () => void
}) {
  const [error, setError] = useState('')

  const validate = () => {
    if (form.name.trim().length < 2) { setError('Le nom doit faire au moins 2 caractères.'); return false }
    if (!form.category) { setError('Veuillez choisir une catégorie.'); return false }
    if (!form.city.trim()) { setError('Veuillez indiquer une ville.'); return false }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validate()) onNext()
  }

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-black text-navy text-base flex items-center gap-2">
          <Zap size={15} className="text-orange-primary" /> Votre activité
        </h2>

        {/* Nom */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-name">
            Nom de votre activité <span className="text-red-400">*</span>
          </label>
          <input
            id="wiz-name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex : Dupont Immobilier, Trans-Expat Valencia…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Catégorie <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {proCategories.map(cat => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setForm({ ...form, category: cat.slug })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                  form.category === cat.slug
                    ? 'border-orange-primary bg-orange-soft text-orange-primary'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-orange-primary/40'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="leading-tight text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-city">
            Ville principale <span className="text-red-400">*</span>
          </label>
          <input
            id="wiz-city"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
            placeholder="Valencia, Alicante, Benidorm…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Coordonnées ─────────────────────────────────────────────────────

function Step2({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormData
  setForm: (f: FormData) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-black text-navy text-base flex items-center gap-2">
          <Zap size={15} className="text-orange-primary" /> Vos coordonnées{' '}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </h2>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-desc">
            Description
          </label>
          <textarea
            id="wiz-desc"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4}
            maxLength={1000}
            placeholder="Présentez votre activité, vos spécialités, votre expérience…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
        </div>

        {/* Téléphone + toggle */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-phone">
            Téléphone
          </label>
          <input
            id="wiz-phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+34 6xx xxx xxx"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
          />
          <button
            type="button"
            onClick={() => setForm({ ...form, phoneHidden: !form.phoneHidden })}
            className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${form.phoneHidden ? 'bg-navy' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={form.phoneHidden}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.phoneHidden ? 'translate-x-4' : 'translate-x-1'}`} />
            </span>
            Masquer le téléphone (visible uniquement des utilisateurs connectés)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-wa">
              WhatsApp
            </label>
            <input
              id="wiz-wa"
              value={form.whatsapp}
              onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="+34 6xx xxx xxx"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
            />
          </div>

          {/* Site web */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-web">
              Site web
            </label>
            <input
              id="wiz-web"
              type="url"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              placeholder="https://monsite.es"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
            />
          </div>
        </div>

        {/* Zones */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="wiz-zones">
            Zones d&apos;intervention{' '}
            <span className="font-normal text-gray-400">(séparées par des virgules)</span>
          </label>
          <input
            id="wiz-zones"
            value={form.zones}
            onChange={e => setForm({ ...form, zones: e.target.value })}
            placeholder="Valencia, Alicante, Benidorm…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy font-semibold transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Choisir mon offre <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3 — Plan ────────────────────────────────────────────────────────────

function Step3({
  form,
  setForm,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: {
  form: FormData
  setForm: (f: FormData) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  submitError: string
}) {
  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-black text-navy text-base flex items-center gap-2 mb-5">
          <Star size={15} className="text-orange-primary" /> Choisissez votre abonnement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAN_OPTIONS.map(plan => {
            const selected = form.plan === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setForm({ ...form, plan: plan.id })}
                className={`relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? plan.highlight
                      ? 'border-indigo-primary bg-indigo-soft'
                      : 'border-orange-primary bg-orange-soft'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {selected && (
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-primary' : 'bg-orange-primary'}`}>
                    <Check size={11} className="text-white" />
                  </div>
                )}
                <span className={`text-xs font-black mb-1 ${plan.highlight ? 'text-indigo-primary' : 'text-orange-primary'}`}>
                  {plan.tier}
                </span>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-2xl font-black text-navy leading-none">{plan.price}</span>
                </div>
                <span className="text-[11px] text-gray-400 mb-4">{plan.period}</span>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check size={12} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-indigo-primary' : 'text-emerald-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <span>🔒</span> Paiement sécurisé par carte via Stripe — annulation possible à tout moment.
        </p>
      </section>

      {submitError && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{submitError}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy font-semibold transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!form.plan || submitting}
          className="flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Création en cours…</>
          ) : (
            <>Passer au paiement <ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Root wizard ──────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async () => {
    if (!form.plan) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const zones = form.zones
        .split(',')
        .map(z => z.trim())
        .filter(Boolean)
      const res = await fetch('/api/pro/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          city: form.city.trim(),
          description: form.description.trim() || null,
          phone: form.phone.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          website: form.website.trim() || null,
          phoneHidden: form.phoneHidden,
          zones,
          plan: form.plan,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(
          typeof data.error === 'string'
            ? data.error
            : 'Une erreur est survenue. Veuillez réessayer.'
        )
        setSubmitting(false)
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      setSubmitError('Une erreur réseau est survenue. Veuillez réessayer.')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <StepDots step={step} />
      {step === 1 && (
        <Step1
          form={form}
          setForm={setForm}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          form={form}
          setForm={setForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          form={form}
          setForm={setForm}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}
