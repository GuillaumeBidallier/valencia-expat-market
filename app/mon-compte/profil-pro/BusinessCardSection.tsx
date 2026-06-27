'use client'
import { useState, useRef, useTransition, useCallback } from 'react'
import QRCode from 'react-qr-code'
import {
  QrCode, CreditCard, Check, Loader2, Download, Copy, ExternalLink,
  Phone, MessageCircle, Mail, Globe, Pencil, X, Save, Palette,
  CheckCircle2, Star, Zap,
} from 'lucide-react'
import type { BusinessCard, Professional } from '@prisma/client'

type Plan = 'monthly'
interface Props {
  pro: Professional & { businessCard: BusinessCard | null }
  cardSuccessParam?: boolean
}

const COLORS = ['#4F46E5', '#E8571A', '#1A1F36', '#10B981', '#EC4899', '#F59E0B', '#6366F1', '#0EA5E9']

export default function BusinessCardSection({ pro, cardSuccessParam }: Props) {
  const [card, setCard]           = useState<BusinessCard | null>(pro.businessCard)
  const [editing, setEditing]     = useState(cardSuccessParam && pro.businessCard?.active)
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null)
  const [copied, setCopied]       = useState(false)
  const [saving, startSave]       = useTransition()
  const [saved, setSaved]         = useState(false)

  // Editable form fields
  const [headline,     setHeadline]     = useState(card?.headline ?? '')
  const [tagline,      setTagline]      = useState(card?.tagline ?? '')
  const [primaryColor, setPrimaryColor] = useState(card?.primaryColor ?? '#4F46E5')
  const [showEmail,    setShowEmail]    = useState(card?.showEmail ?? false)
  const [showPhone,    setShowPhone]    = useState(card?.showPhone ?? true)
  const [showWhatsapp, setShowWhatsapp] = useState(card?.showWhatsapp ?? true)
  const [showWebsite,  setShowWebsite]  = useState(card?.showWebsite ?? true)
  const [email,        setEmail]        = useState(card?.email ?? '')

  const qrRef = useRef<HTMLDivElement>(null)

  const baseUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://1000click.es'
  const cardUrl  = `${baseUrl}/carte/${pro.slug}`

  const startCheckout = async (plan: Plan) => {
    setLoadingPlan(plan)
    const res  = await fetch('/api/stripe/business-card', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert(error ?? 'Erreur'); setLoadingPlan(null) }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(cardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 512
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const img = document.createElement('img') as HTMLImageElement
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 32, 32, size - 64, size - 64)
      const a = document.createElement('a')
      a.download = `qr-carte-${pro.slug}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }, [pro.slug])

  const saveCard = () => {
    setSaved(false)
    startSave(async () => {
      const res = await fetch('/api/pro/business-card', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, tagline, primaryColor, showEmail, showPhone, showWhatsapp, showWebsite, email }),
      })
      if (res.ok) {
        const { businessCard: updated } = await res.json()
        setCard(updated)
        setSaved(true)
        setTimeout(() => { setSaved(false); setEditing(false) }, 1500)
      }
    })
  }

  /* ── No card yet — pricing ──────────────────────────────── */
  if (!card?.active) {
    const previewName     = pro.name ?? 'Votre Nom'
    const previewInitial  = previewName.charAt(0).toUpperCase()
    const previewCity     = pro.city ?? 'Valencia'
    const previewCategory = pro.category ?? 'Votre activité'

    return (
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
            <QrCode size={18} className="text-indigo-primary" />
          </div>
          <div>
            <p className="font-black text-navy text-sm">Carte de visite numérique</p>
            <p className="text-xs text-gray-400 mt-0.5">Partagez votre profil via un QR code — résiliable à tout moment</p>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">

            {/* ── Left: pricing ── */}
            <div className="flex-1 w-full lg:max-w-sm">
              <ul className="space-y-2.5 mb-7">
                {[
                  { text: 'Page carte de visite personnalisée', sub: 'Votre nom, accroche, coordonnées' },
                  { text: 'QR code téléchargeable en HD', sub: 'Imprimez-le sur vos supports physiques' },
                  { text: 'Lien court partageable', sub: 'WhatsApp, email, réseaux sociaux' },
                  { text: 'Bouton de contact intégré', sub: 'Appel, WhatsApp, email en 1 tap' },
                  { text: 'Couleurs et identité de marque', sub: 'Personnalisez à vos couleurs' },
                ].map(item => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy leading-snug">{item.text}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border-2 border-indigo-primary bg-gradient-to-br from-indigo-soft to-white p-5 flex flex-col gap-4">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="font-black text-navy text-4xl">3,99 €</p>
                    <p className="text-sm text-gray-500">/mois</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Sans engagement — résiliable en 1 clic</p>
                </div>
                <button
                  onClick={() => startCheckout('monthly')}
                  disabled={loadingPlan !== null}
                  className="flex items-center justify-center gap-2 bg-indigo-primary text-white py-3.5 rounded-xl font-black text-sm hover:bg-indigo-dark transition-all shadow-lg shadow-indigo-primary/25 disabled:opacity-50"
                >
                  {loadingPlan ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                  Activer ma carte de visite
                </button>
                <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <Star size={10} className="text-amber-400" />
                  Paiement sécurisé par Stripe
                </p>
              </div>
            </div>

            {/* ── Right: card preview ── */}
            <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end">
              {/* Outer frame — perspective tilt */}
              <div className="relative w-full max-w-[280px]" style={{ perspective: '1000px' }}>
                {/* Glow behind */}
                <div className="absolute inset-0 blur-3xl opacity-30 rounded-3xl" style={{ background: 'linear-gradient(135deg, #4F46E5, #E8571A)' }} />

                {/* The card */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{ transform: 'rotateY(-6deg) rotateX(4deg)', boxShadow: '0 32px 80px -12px rgba(79,70,229,0.35), 0 8px 24px -4px rgba(0,0,0,0.2)' }}
                >
                  {/* Header gradient */}
                  <div className="relative px-5 pt-7 pb-10" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 60%, #1A1F36 100%)' }}>
                    {/* Top decoration dots */}
                    <div className="absolute top-3 right-4 flex gap-1.5 opacity-30">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* 1000Click watermark */}
                    <div className="absolute top-3 left-5 flex items-center gap-1 opacity-50">
                      <div className="w-3 h-3 rounded-full border border-white/60 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>
                      <span className="text-[9px] text-white font-bold tracking-wide">1000Click</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg">
                      {previewInitial}
                    </div>

                    {/* Name + title */}
                    <h3 className="text-white font-black text-base leading-tight">{previewName}</h3>
                    <p className="text-white/70 text-xs mt-0.5 font-medium">{previewCategory}</p>
                    <p className="text-white/50 text-[10px] mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-white/40" />
                      {previewCity}, Espagne
                    </p>
                  </div>

                  {/* White body */}
                  <div className="bg-white px-5 py-4 -mt-5 rounded-t-2xl relative z-10">
                    {/* Contact rows */}
                    <div className="space-y-2 mb-4">
                      {[
                        { icon: <Phone size={11} className="text-gray-400" />, label: '+34 6XX XXX XXX', color: 'text-navy' },
                        { icon: <MessageCircle size={11} className="text-green-500" />, label: 'WhatsApp', color: 'text-green-600' },
                        { icon: <Globe size={11} className="text-indigo-primary" />, label: 'www.monsite.es', color: 'text-indigo-primary' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
                          {row.icon}
                          <span className={`text-[11px] font-semibold ${row.color}`}>{row.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* QR + CTA */}
                    <div className="flex items-center gap-3">
                      {/* Mini QR placeholder */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <QrCode size={22} className="text-gray-300" />
                      </div>
                      {/* CTA button */}
                      <div className="flex-1 bg-indigo-primary text-white rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-black shadow-sm shadow-indigo-primary/30">
                        <Phone size={11} />
                        Appeler
                      </div>
                    </div>

                    {/* Watermark bottom */}
                    <p className="text-center text-[9px] text-gray-300 mt-3 font-medium">
                      Carte propulsée par 1000Click.es
                    </p>
                  </div>
                </div>

                {/* "Aperçu" badge */}
                <div className="absolute -top-3 -right-3 bg-orange-primary text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg shadow-orange-primary/30 rotate-6">
                  Aperçu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  /* ── Active card — dashboard ────────────────────────────── */
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
            <QrCode size={18} className="text-indigo-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-navy text-sm">Carte de visite numérique</p>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
              <span className="text-[10px] font-bold bg-orange-soft text-orange-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap size={9} /> 3,99 €/mois
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {card.plan === 'monthly' && card.subscriptionCurrentPeriodEnd
                ? `Prochain renouvellement : ${new Date(card.subscriptionCurrentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Accès permanent'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-navy px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {editing ? <><X size={13} /> Fermer</> : <><Pencil size={13} /> Modifier</>}
        </button>
      </div>

      {/* QR code + link */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* QR */}
          <div className="flex flex-col items-center gap-3">
            <div
              ref={qrRef}
              className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm"
            >
              <QRCode
                value={cardUrl}
                size={160}
                fgColor={primaryColor}
                bgColor="#ffffff"
                style={{ display: 'block' }}
              />
            </div>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-primary hover:underline"
            >
              <Download size={12} /> Télécharger PNG
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lien de votre carte</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 font-mono truncate">
                {cardUrl}
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-primary px-3 py-2.5 rounded-xl hover:bg-indigo-dark transition-colors"
              >
                {copied ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
              </button>
            </div>
            <a
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-primary hover:underline"
            >
              <ExternalLink size={12} /> Voir la carte
            </a>

            {/* Contact preview */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {card.showPhone && pro.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                  <Phone size={12} className="text-gray-400" /> {pro.phone}
                </div>
              )}
              {card.showWhatsapp && pro.whatsapp && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                  <MessageCircle size={12} className="text-green-400" /> WhatsApp
                </div>
              )}
              {card.showEmail && card.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                  <Mail size={12} className="text-blue-400" /> {card.email}
                </div>
              )}
              {card.showWebsite && pro.website && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 truncate">
                  <Globe size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">{pro.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Editor ──────────────────────────────────────── */}
        {editing && (
          <div className="mt-6 border-t border-gray-100 pt-6 space-y-5">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Personnaliser la carte</p>

            {/* Headline */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Titre / Spécialité</label>
              <input
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="Expert en plomberie, Architecte HMONP..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Accroche</label>
              <input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="Intervention rapide à Valencia et environs..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
              />
            </div>

            {/* Color */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                <Palette size={13} /> Couleur principale
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${primaryColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border border-gray-200"
                  title="Couleur personnalisée"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">E-mail affiché sur la carte</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@monentreprise.es"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Informations visibles</p>
              {[
                { label: 'Téléphone',  key: 'showPhone',    val: showPhone,    set: setShowPhone,    icon: <Phone size={13} className="text-gray-400" /> },
                { label: 'WhatsApp',   key: 'showWhatsapp', val: showWhatsapp, set: setShowWhatsapp, icon: <MessageCircle size={13} className="text-green-400" /> },
                { label: 'E-mail',     key: 'showEmail',    val: showEmail,    set: setShowEmail,    icon: <Mail size={13} className="text-blue-400" /> },
                { label: 'Site web',   key: 'showWebsite',  val: showWebsite,  set: setShowWebsite,  icon: <Globe size={13} className="text-gray-400" /> },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-navy">
                    {item.icon}
                    {item.label}
                  </div>
                  <button
                    role="switch"
                    aria-checked={item.val}
                    onClick={() => item.set(v => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.val ? 'bg-indigo-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} /> Sauvegardé
                </span>
              )}
              <button
                onClick={saveCard}
                disabled={saving}
                className="flex items-center gap-1.5 bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Sauvegarde…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
