'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Camera, Pencil, Plus, Trash2, ExternalLink, Check, Loader2, X,
  Star, Zap, CreditCard, AlertCircle, LayoutDashboard, BarChart2,
  QrCode, Settings, Image as ImageIcon, Phone, Globe, MessageCircle,
  MapPin, Shield, CheckCircle2,
} from 'lucide-react'
import type { BusinessCard, Professional } from '@prisma/client'
import type { ProPlan } from '@/lib/stripe'
import ProStatsClient from './ProStatsClient'
import BusinessCardSection from './BusinessCardSection'
import { BUSINESS_CARD_ENABLED } from '@/lib/feature-flags'

type Tab = 'apercu' | 'fiche' | 'medias' | 'statistiques' | 'carte' | 'abonnement'
type Props = { pro: Professional & { businessCard: BusinessCard | null }; cardSuccess?: boolean }

const PLANS: { id: ProPlan; label: string; price: string; period: string; highlight?: boolean }[] = [
  { id: 'premium_annual',      label: 'Premium',  price: '49,99 €', period: '/an' },
  { id: 'premium_plus_annual', label: 'Premium+', price: '99,99 €', period: '/an', highlight: true },
]

/* ── Subscription section ──────────────────────────────── */
function SubscriptionSection({ pro }: { pro: Professional }) {
  const [loading, setLoading] = useState<ProPlan | 'portal' | null>(null)

  const startCheckout = async (plan: ProPlan) => {
    setLoading(plan)
    const res = await fetch('/api/stripe/pro-subscription', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  const isActive  = pro.tier !== 'FREE' && pro.subscriptionStatus === 'active'
  const isPastDue = pro.subscriptionStatus === 'past_due'
  const renewDate = pro.subscriptionCurrentPeriodEnd
    ? new Date(pro.subscriptionCurrentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (isActive) return (
    <div className="bg-gradient-to-br from-navy to-slate-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Star size={22} className="text-orange-primary" />
          </div>
          <div>
            <p className="font-black text-lg">{pro.tier === 'PREMIUM_PLUS' ? 'Premium+' : 'Premium'}</p>
            <p className="text-white/60 text-sm">
              {pro.subscriptionPeriod === 'annual' ? 'Formule annuelle' : 'Formule mensuelle'}
            </p>
          </div>
        </div>
        <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Actif</span>
      </div>
      {renewDate && (
        <p className="text-sm text-white/50 mb-5">Renouvellement le <span className="text-white font-semibold">{renewDate}</span></p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Visibilité renforcée', desc: 'Apparaissez en tête des résultats' },
          { label: 'Encarts publicitaires', desc: 'Vos annonces promues' },
          pro.tier === 'PREMIUM_PLUS'
            ? { label: 'Statistiques avancées', desc: 'Clics, vues, conversions' }
            : { label: 'Zones ciblées', desc: 'Ciblez vos secteurs géographiques' },
        ].map(item => (
          <div key={item.label} className="bg-white/8 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <p className="text-xs font-bold text-white">{item.label}</p>
            </div>
            <p className="text-[11px] text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>
      <button
        onClick={openPortal}
        disabled={loading === 'portal'}
        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 border border-white/10"
      >
        {loading === 'portal' ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
        Gérer mon abonnement
      </button>
    </div>
  )

  if (isPastDue) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-navy text-sm">Paiement en échec</p>
          <p className="text-xs text-gray-500 mt-0.5">Votre abonnement est suspendu. Mettez à jour votre moyen de paiement.</p>
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
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-orange-50 border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <Zap size={18} className="text-orange-primary" />
        </div>
        <div>
          <p className="font-black text-navy text-sm">Passez à Premium</p>
          <p className="text-xs text-gray-500">Multipliez votre visibilité auprès des expatriés</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => startCheckout(plan.id)}
            disabled={loading !== null}
            className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 hover:shadow-md ${
              plan.highlight ? 'border-indigo-primary bg-white' : 'border-orange-primary bg-white'
            }`}
          >
            {loading === plan.id && <Loader2 size={14} className="absolute top-3 right-3 animate-spin text-gray-400" />}
            <span className={`text-xs font-black mb-1 ${plan.highlight ? 'text-indigo-primary' : 'text-orange-primary'}`}>{plan.label}</span>
            <span className="text-2xl font-black text-navy leading-none">{plan.price}</span>
            <span className="text-[11px] text-gray-400 mt-1">{plan.period}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProDashboardClient({ pro: initial, cardSuccess }: Props) {
  const t = useTranslations('ProDashboard')
  const [pro, setPro]       = useState(initial)
  const [tab, setTab]       = useState<Tab>('apercu')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [form, setForm]     = useState({
    name:        initial.name,
    description: initial.description ?? '',
    phone:       initial.phone ?? '',
    whatsapp:    initial.whatsapp ?? '',
    website:     initial.website ?? '',
    city:        initial.city,
    zones:       initial.zones.join(', '),
  })
  const [phoneHidden,   setPhoneHidden]   = useState(initial.phoneHidden)
  const [uploading,     setUploading]     = useState<'logo' | 'banner' | 'photo' | null>(null)
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null)

  const logoRef  = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const TABS: { key: Tab; label: string; icon: React.ElementType; premiumOnly?: boolean }[] = [
    { key: 'apercu',       label: 'Aperçu',        icon: LayoutDashboard },
    { key: 'fiche',        label: 'Ma fiche',       icon: Pencil },
    { key: 'medias',       label: 'Médias',         icon: ImageIcon },
    { key: 'statistiques', label: 'Statistiques',   icon: BarChart2,  premiumOnly: true },
    ...(BUSINESS_CARD_ENABLED ? [{ key: 'carte' as Tab, label: 'Carte QR', icon: QrCode }] : []),
    { key: 'abonnement',   label: 'Abonnement',     icon: CreditCard },
  ]

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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, zones, phoneHidden }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tierLabel = pro.tier === 'PREMIUM_PLUS' ? 'Premium+' : pro.tier === 'PREMIUM' ? 'Premium' : 'Gratuit'
  const tierColor = pro.tier === 'PREMIUM_PLUS'
    ? 'bg-indigo-primary text-white'
    : pro.tier === 'PREMIUM'
      ? 'bg-orange-primary text-white'
      : 'bg-gray-100 text-gray-500'

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative bg-navy overflow-hidden">
        {/* Banner bg */}
        {pro.banner && (
          <Image src={pro.banner} alt="" fill className="object-cover opacity-20" sizes="100vw" />
        )}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 pb-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/20 overflow-hidden bg-white/10 shrink-0 shadow-xl">
              {pro.logo
                ? <Image src={pro.logo} alt="" fill className="object-cover" sizes="96px" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">🏢</div>}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">{pro.name}</h1>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ${tierColor}`}>{tierLabel}</span>
                {pro.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    <Shield size={10} /> Vérifié
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm">
                <span className="flex items-center gap-1"><MapPin size={12} />{pro.city}</span>
                <span>{pro.category}</span>
                {pro.website && (
                  <span className="flex items-center gap-1"><Globe size={12} />{pro.website.replace(/^https?:\/\//, '')}</span>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/professionnels/${pro.slug}`}
              target="_blank"
              className="shrink-0 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <ExternalLink size={13} /> Voir ma fiche
            </Link>
          </div>

          {/* ── Tab bar ──────────────────────────────────────── */}
          <div className="flex items-end gap-1 overflow-x-auto scrollbar-none">
            {TABS.map(({ key, label, icon: Icon, premiumOnly }) => {
              if (premiumOnly && pro.tier !== 'PREMIUM_PLUS') return null
              const active = tab === key
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                    active
                      ? 'bg-white text-navy border-transparent'
                      : 'text-white/60 hover:text-white border-transparent hover:bg-white/8'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

        {/* ════ APERÇU ════════════════════════════════════════ */}
        {tab === 'apercu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — KPIs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Photos',   value: pro.photos.length,              color: 'text-indigo-primary', bg: 'bg-indigo-soft'  },
                  { label: 'Zones',    value: pro.zones.length,               color: 'text-orange-primary', bg: 'bg-orange-soft'  },
                  { label: 'Statut',   value: pro.verified ? 'Vérifié' : 'En attente', color: pro.verified ? 'text-emerald-600' : 'text-amber-600', bg: pro.verified ? 'bg-emerald-50' : 'bg-amber-50' },
                  { label: 'Carte QR', value: pro.businessCard?.active ? 'Active' : 'Inactive', color: pro.businessCard?.active ? 'text-emerald-600' : 'text-gray-400', bg: pro.businessCard?.active ? 'bg-emerald-50' : 'bg-gray-50' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className={`text-2xl font-black ${s.color} leading-none mb-1`}>{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact info preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="font-black text-navy text-sm">Informations de contact</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { icon: <Phone size={15} className="text-gray-400" />, label: 'Téléphone', value: pro.phone || '—' },
                    { icon: <MessageCircle size={15} className="text-green-400" />, label: 'WhatsApp', value: pro.whatsapp || '—' },
                    { icon: <Globe size={15} className="text-blue-400" />, label: 'Site web', value: pro.website || '—' },
                    { icon: <MapPin size={15} className="text-orange-primary" />, label: 'Ville', value: pro.city },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm text-navy font-semibold truncate">{item.value}</p>
                      </div>
                      <button
                        onClick={() => setTab('fiche')}
                        className="text-gray-300 hover:text-orange-primary transition-colors shrink-0"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones */}
              {pro.zones.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="font-black text-navy text-sm mb-3">Zones d&apos;intervention</p>
                  <div className="flex flex-wrap gap-2">
                    {pro.zones.map(z => (
                      <span key={z} className="text-xs font-semibold bg-indigo-soft text-indigo-primary px-3 py-1.5 rounded-full">
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — quick actions + subscription */}
            <div className="space-y-5">
              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="font-black text-navy text-sm">Actions rapides</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: 'Modifier ma fiche', tab: 'fiche' as Tab,   icon: <Pencil size={14} className="text-orange-primary" /> },
                    { label: 'Gérer mes médias',  tab: 'medias' as Tab,  icon: <Camera size={14} className="text-indigo-primary" /> },
                    ...(BUSINESS_CARD_ENABLED ? [{ label: 'Ma carte de visite', tab: 'carte' as Tab, icon: <QrCode size={14} className="text-purple-500" /> }] : []),
                    { label: 'Mon abonnement',    tab: 'abonnement' as Tab, icon: <Star size={14} className="text-orange-primary" /> },
                  ].map(a => (
                    <button
                      key={a.label}
                      onClick={() => setTab(a.tab)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{a.icon}</div>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscription mini card */}
              <SubscriptionSection pro={pro} />
            </div>
          </div>
        )}

        {/* ════ MA FICHE ══════════════════════════════════════ */}
        {tab === 'fiche' && (
          <div className="max-w-5xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center">
                  <Pencil size={16} className="text-orange-primary" />
                </div>
                <div>
                  <p className="font-black text-navy text-sm">Informations de la fiche</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ces informations sont visibles publiquement sur votre profil.</p>
                </div>
              </div>
              <form onSubmit={save} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-name">{t('f_name')}</label>
                  <input
                    id="pro-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-desc">{t('f_description')}</label>
                  <textarea
                    id="pro-desc"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={5}
                    placeholder={t('p_description')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-city">{t('f_city')}</label>
                    <input
                      id="pro-city"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-web">{t('f_website')}</label>
                    <input
                      id="pro-web"
                      type="url"
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://monsite.es"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-phone">{t('f_phone')}</label>
                    <input
                      id="pro-phone"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+34 6xx xxx xxx"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoneHidden(v => !v)}
                      className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${phoneHidden ? 'bg-navy' : 'bg-gray-200'}`}
                        role="switch" aria-checked={phoneHidden}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${phoneHidden ? 'translate-x-4' : 'translate-x-1'}`} />
                      </span>
                      {t('f_phone_hidden')}
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-wa">{t('f_whatsapp')}</label>
                    <input
                      id="pro-wa"
                      value={form.whatsapp}
                      onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+34 6xx xxx xxx"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="pro-zones">
                    {t('f_zones')} <span className="normal-case font-normal text-gray-400">— séparées par des virgules</span>
                  </label>
                  <input
                    id="pro-zones"
                    value={form.zones}
                    onChange={e => setForm(f => ({ ...f, zones: e.target.value }))}
                    placeholder="Valencia, Barcelone, Alicante..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center gap-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {saving ? t('saving') : t('save')}
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 size={15} /> {t('saved_notice')}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ MÉDIAS ════════════════════════════════════════ */}
        {tab === 'medias' && (
          <div className="space-y-6 max-w-4xl">

            {/* Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center">
                  <ImageIcon size={16} className="text-indigo-primary" />
                </div>
                <div>
                  <p className="font-black text-navy text-sm">Bannière</p>
                  <p className="text-xs text-gray-400 mt-0.5">Image d&apos;en-tête de votre fiche. Format 16:9 recommandé.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group cursor-pointer" onClick={() => bannerRef.current?.click()}>
                  {pro.banner
                    ? <Image src={pro.banner} alt="" fill className="object-cover" sizes="800px" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Camera size={28} />
                        <p className="text-sm font-medium">{t('no_banner')}</p>
                      </div>}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {uploading === 'banner'
                      ? <Loader2 size={28} className="text-white animate-spin" />
                      : <div className="flex items-center gap-2 bg-black/60 text-white px-5 py-2.5 rounded-full text-sm font-bold">
                          <Camera size={16} /> {t('change_banner')}
                        </div>}
                  </div>
                </div>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'banner')} />
              </div>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center">
                  <Camera size={16} className="text-orange-primary" />
                </div>
                <div>
                  <p className="font-black text-navy text-sm">Logo / Photo de profil</p>
                  <p className="text-xs text-gray-400 mt-0.5">Format carré recommandé, au moins 200×200 px.</p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-5">
                <div
                  className="relative w-24 h-24 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 shrink-0 group cursor-pointer shadow-sm"
                  onClick={() => logoRef.current?.click()}
                >
                  {pro.logo
                    ? <Image src={pro.logo} alt="" fill className="object-cover" sizes="96px" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🏢</div>}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {uploading === 'logo' ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => logoRef.current?.click()}
                    disabled={uploading === 'logo'}
                    className="flex items-center gap-2 bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
                  >
                    {uploading === 'logo' ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    {t('change_logo')}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">{t('logo_hint')}</p>
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'logo')} />
              </div>
            </div>

            {/* Photo gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <ImageIcon size={16} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="font-black text-navy text-sm">Galerie photos</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pro.photos.length}/8 photos · Mettez en valeur vos réalisations.</p>
                  </div>
                </div>
                <button
                  onClick={() => photoRef.current?.click()}
                  disabled={uploading === 'photo' || pro.photos.length >= 8}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-primary border border-indigo-primary/30 bg-indigo-soft hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {uploading === 'photo' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  {t('add_photo')}
                </button>
              </div>
              <div className="p-6">
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'photo')} />
                {pro.photos.length === 0 ? (
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-indigo-primary hover:text-indigo-primary transition-colors"
                  >
                    <Plus size={28} />
                    <span className="text-sm font-medium">{t('add_photos_empty')}</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {pro.photos.map(url => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group shadow-sm">
                        <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                        <button
                          onClick={() => removePhoto(url)}
                          disabled={removingPhoto === url}
                          className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {removingPhoto === url ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    ))}
                    {pro.photos.length < 8 && (
                      <button
                        onClick={() => photoRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-indigo-primary hover:text-indigo-primary transition-colors"
                      >
                        <Plus size={22} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ STATISTIQUES ══════════════════════════════════ */}
        {tab === 'statistiques' && pro.tier === 'PREMIUM_PLUS' && (
          <ProStatsClient />
        )}

        {/* ════ CARTE DE VISITE ═══════════════════════════════ */}
        {tab === 'carte' && BUSINESS_CARD_ENABLED && (
          <div>
            <BusinessCardSection pro={pro} cardSuccessParam={cardSuccess} />
          </div>
        )}

        {/* ════ ABONNEMENT ════════════════════════════════════ */}
        {tab === 'abonnement' && (
          <div className="max-w-2xl">
            <SubscriptionSection pro={pro} />
          </div>
        )}
      </div>
    </div>
  )
}
