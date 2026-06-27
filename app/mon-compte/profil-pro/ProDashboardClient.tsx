'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Camera, Pencil, Plus, Trash2, ExternalLink, Check, Loader2, X, Star, Zap, CreditCard, AlertCircle } from 'lucide-react'
import type { BusinessCard, Professional } from '@prisma/client'
import type { ProPlan } from '@/lib/stripe'
import ProStatsClient from './ProStatsClient'
import BusinessCardSection from './BusinessCardSection'

type Props = { pro: Professional & { businessCard: BusinessCard | null }; cardSuccess?: boolean }

const PLANS: { id: ProPlan; label: string; price: string; period: string; highlight?: boolean }[] = [
  { id: 'premium_annual',      label: 'Premium',  price: '49,99 €', period: '/an' },
  { id: 'premium_plus_annual', label: 'Premium+', price: '99,99 €', period: '/an', highlight: true },
]

function SubscriptionSection({ pro }: { pro: Professional }) {
  const [loading, setLoading] = useState<ProPlan | 'portal' | null>(null)

  const startCheckout = async (plan: ProPlan) => {
    setLoading(plan)
    const res = await fetch('/api/stripe/pro-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert(error ?? 'Erreur'); setLoading(null) }
  }

  const openPortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/pro-subscription/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert(error ?? 'Erreur'); setLoading(null) }
  }

  const isActive = pro.tier !== 'FREE' && pro.subscriptionStatus === 'active'
  const isPastDue = pro.subscriptionStatus === 'past_due'
  const renewDate = pro.subscriptionCurrentPeriodEnd
    ? new Date(pro.subscriptionCurrentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (isActive) {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-soft flex items-center justify-center">
            <Star size={18} className="text-orange-primary" />
          </div>
          <div>
            <p className="font-black text-navy text-sm">
              {pro.tier === 'PREMIUM_PLUS' ? 'Premium+' : 'Premium'} actif
            </p>
            <p className="text-xs text-gray-400">
              {pro.subscriptionPeriod === 'annual' ? 'Formule annuelle' : 'Formule mensuelle'}
              {renewDate ? ` · Renouvellement le ${renewDate}` : ''}
            </p>
          </div>
          <span className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Actif</span>
        </div>
        <button
          onClick={openPortal}
          disabled={loading === 'portal'}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 text-navy font-bold text-sm py-3 rounded-xl hover:border-orange-primary hover:text-orange-primary transition-colors disabled:opacity-50"
        >
          {loading === 'portal' ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
          Gérer mon abonnement
        </button>
      </section>
    )
  }

  if (isPastDue) {
    return (
      <section className="bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-navy text-sm">Paiement en échec</p>
            <p className="text-xs text-gray-500">Votre abonnement est suspendu. Mettez à jour votre moyen de paiement.</p>
          </div>
        </div>
        <button
          onClick={openPortal}
          disabled={loading === 'portal'}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading === 'portal' ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
          Mettre à jour le paiement
        </button>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={16} className="text-orange-primary" />
        <p className="font-black text-navy text-sm">Passer à Premium</p>
      </div>
      <p className="text-xs text-gray-400 mb-5">Apparaissez dans les encarts publicitaires et gagnez en visibilité.</p>
      <div className="grid grid-cols-2 gap-3">
        {PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => startCheckout(plan.id)}
            disabled={loading !== null}
            className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
              plan.highlight
                ? 'border-indigo-primary bg-indigo-soft hover:bg-indigo-50'
                : 'border-orange-primary bg-orange-soft hover:bg-orange-50'
            }`}
          >
            {loading === plan.id && (
              <Loader2 size={14} className="absolute top-3 right-3 animate-spin text-gray-400" />
            )}
            <span className={`text-xs font-black mb-1 ${plan.highlight ? 'text-indigo-primary' : 'text-orange-primary'}`}>
              {plan.label}
            </span>
            <span className="text-lg font-black text-navy leading-none">{plan.price}</span>
            <span className="text-[10px] text-gray-400 leading-tight mt-0.5">{plan.period}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function ProDashboardClient({ pro: initial, cardSuccess }: Props) {
  const t = useTranslations('ProDashboard')
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
  const [phoneHidden, setPhoneHidden] = useState(initial.phoneHidden)
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
      body: JSON.stringify({ ...form, zones, phoneHidden }),
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
          <h1 className="text-2xl font-black text-navy">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
        </div>
        <Link
          href={`/professionnels/${pro.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-orange-primary hover:underline"
        >
          {t('view')} <ExternalLink size={13} />
        </Link>
      </div>

      <div className="space-y-5">

        {/* Subscription */}
        <SubscriptionSection pro={pro} />

        {/* Stats — Premium+ only */}
        {pro.tier === 'PREMIUM_PLUS' && <ProStatsClient />}

        {/* Business card */}
        <BusinessCardSection pro={pro} cardSuccessParam={cardSuccess} />

        {/* Banner */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-navy to-slate-600 group">
            {pro.banner ? (
              <Image src={pro.banner} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                {t('no_banner')}
              </div>
            )}
            <button
              onClick={() => bannerRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group-hover:opacity-100 opacity-0"
              aria-label={t('change_banner')}
            >
              {uploading === 'banner' ? (
                <Loader2 size={28} className="text-white animate-spin" />
              ) : (
                <div className="flex items-center gap-2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <Camera size={16} /> {t('change_banner')}
                </div>
              )}
            </button>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'banner')} />

          {/* Logo avatar */}
          <div className="px-5 pb-5">
            <div className="relative -mt-10 w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 shrink-0 group inline-block">
              {pro.logo ? (
                <Image src={pro.logo} alt="" fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50">🏢</div>
              )}
              <button
                onClick={() => logoRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={t('change_logo')}
              >
                {uploading === 'logo' ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
              </button>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'logo')} />
            <p className="text-xs text-gray-400 mt-1.5">{t('logo_hint')}</p>
          </div>
        </section>

        {/* Info form */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
            <Pencil size={15} className="text-orange-primary" /> {t('section_info')}
          </h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-name">{t('f_name')}</label>
              <input
                id="pro-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-desc">{t('f_description')}</label>
              <textarea
                id="pro-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder={t('p_description')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-city">{t('f_city')}</label>
                <input
                  id="pro-city"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-phone">{t('f_phone')}</label>
                <input
                  id="pro-phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+34 6xx xxx xxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
                <button
                  type="button"
                  onClick={() => setPhoneHidden(v => !v)}
                  className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${phoneHidden ? 'bg-navy' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={phoneHidden}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${phoneHidden ? 'translate-x-4' : 'translate-x-1'}`} />
                  </span>
                  {t('f_phone_hidden')}
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-wa">{t('f_whatsapp')}</label>
                <input
                  id="pro-wa"
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+34 6xx xxx xxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pro-web">{t('f_website')}</label>
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
                {t('f_zones')} <span className="font-normal text-gray-400">({t('f_zones_hint')})</span>
              </label>
              <input
                id="pro-zones"
                value={form.zones}
                onChange={e => setForm(f => ({ ...f, zones: e.target.value }))}
                placeholder={t('p_zones')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary"
              />
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? t('saving') : saved ? t('saved') : t('save')}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">{t('saved_notice')}</span>}
            </div>
          </form>
        </section>

        {/* Photo gallery */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy flex items-center gap-2">
              <Camera size={15} className="text-orange-primary" /> {t('section_photos')}
            </h2>
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploading === 'photo' || pro.photos.length >= 8}
              className="inline-flex items-center gap-1.5 text-sm text-orange-primary border border-orange-primary/30 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading === 'photo' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {t('add_photo')}
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'photo')} />

          {pro.photos.length === 0 ? (
            <button
              onClick={() => photoRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-primary hover:text-orange-primary transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm">{t('add_photos_empty')}</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {pro.photos.map((url) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  <button
                    onClick={() => removePhoto(url)}
                    disabled={removingPhoto === url}
                    aria-label={t('remove_photo')}
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
                  aria-label={t('add_photo')}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">{t('photos_count', { count: pro.photos.length })}</p>
        </section>
      </div>
    </div>
  )
}
