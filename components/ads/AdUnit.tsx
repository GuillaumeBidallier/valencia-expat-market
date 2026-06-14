'use client'
import { useState, useEffect, useRef } from 'react'

/* ─── Types ───────────────────────────────────────────────── */
interface ProAd {
  id: string
  name: string
  category: string
  city: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  logo: string | null
  slug: string
  tier: string
}

type AdSize = 'banner' | 'rectangle' | 'inline' | 'skyscraper'
const COUNTS: Record<AdSize, number> = { skyscraper: 4, inline: 2, banner: 1, rectangle: 1 }

/* ─── Fallback mock (affiché pendant le chargement) ──────── */
const MOCK = [
  { id: 'm1', emoji: '🏠', title: 'Immo Valencia Francophone',  desc: 'Location & vente pour expatriés.', url: 'immovalencia.es',    color: '#1A5FA0', cta: 'Voir les biens'  },
  { id: 'm2', emoji: '🚚', title: 'Trans-Expat Déménagements',   desc: 'France ↔ Espagne. Devis en 24h.',  url: 'transexpat.com',     color: '#E8571A', cta: 'Devis gratuit'   },
  { id: 'm3', emoji: '📚', title: 'École Française Valencia',    desc: 'Homologuée AEFE. Inscriptions.', url: 'ecolevfr.es',        color: '#0D7C3A', cta: 'En savoir plus'  },
  { id: 'm4', emoji: '🩺', title: 'AssurExpat — Santé',         desc: 'Mutuelle expatriés. Assistance 24h.', url: 'assurexpat.com', color: '#7C3AED', cta: 'Mon devis'       },
]

/* ─── AdSense slot ───────────────────────────────────────── */
function AdSenseSlot({ slot, style }: { slot: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current || !ref.current) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      pushed.current = true
    } catch { /* ignore */ }
  }, [])

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

/* ─── Destination d'un pro (partagé par tous les formats) ── */
function proHref(pro: ProAd) {
  return pro.website
    ?? (pro.whatsapp ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}` : `/professionnels/${pro.slug}`)
}
function proTarget(pro: ProAd) {
  return pro.website || pro.whatsapp ? '_blank' : '_self'
}
function trackClick(id: string) {
  fetch(`/api/ads/click?id=${id}`, { method: 'POST' }).catch(() => {})
}

/* ─── Carte pro réelle ───────────────────────────────────── */
function ProCard({ pro, compact = false }: { pro: ProAd; compact?: boolean }) {
  const catIcon: Record<string, string> = {
    immobilier: '🏠', juridique: '⚖️', comptabilite: '📊', demenagement: '🚚',
    assurance: '🛡️', sante: '🏥', automobiles: '🚗', services: '🔧', education: '📚', autres: '💼',
  }
  const icon = catIcon[pro.category] ?? '💼'

  return (
    <a
      href={proHref(pro)}
      target={proTarget(pro)}
      rel="noopener noreferrer"
      onClick={() => trackClick(pro.id)}
      className="flex flex-col bg-white border border-orange-primary/20 rounded-xl overflow-hidden hover:shadow-md transition-all group"
    >
      {/* Visual */}
      <div className="h-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden">
        {pro.logo
          ? <img src={pro.logo} alt={pro.name} className="w-full h-full object-cover" loading="lazy" />
          : <span className="text-4xl">{icon}</span>
        }
        <span className={`absolute top-1.5 right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${
          (pro as ProAd & { recommended?: boolean }).recommended
            ? 'bg-indigo-600/90'
            : 'bg-orange-primary/90'
        }`}>
          {(pro as ProAd & { recommended?: boolean }).recommended ? 'Recommandé' : 'Sponsorisé'}
        </span>
      </div>
      {/* Content */}
      <div className="p-2.5">
        <p className="font-bold text-navy text-xs leading-tight line-clamp-1 group-hover:text-orange-primary transition-colors">{pro.name}</p>
        <p className="text-[10px] text-gray-400 mb-1">{pro.city}</p>
        {!compact && pro.description && (
          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{pro.description}</p>
        )}
        <div className="flex gap-1 flex-wrap">
          {pro.whatsapp && <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>}
          {pro.phone    && <span className="text-[9px] bg-blue-50  text-blue-600  px-1.5 py-0.5 rounded font-medium">Tél</span>}
          {pro.website  && <span className="text-[9px] bg-gray-50  text-gray-500  px-1.5 py-0.5 rounded font-medium">Site web</span>}
        </div>
      </div>
    </a>
  )
}

/* ─── Carte mock (skeleton visuel) ───────────────────────── */
function MockCard({ m, compact = false }: { m: typeof MOCK[0]; compact?: boolean }) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden opacity-70">
      <div className="h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: m.color + '15', borderBottom: `2px solid ${m.color}30` }}>
        {m.emoji}
      </div>
      <div className="p-2.5">
        <p className="font-bold text-navy text-xs leading-tight line-clamp-1">{m.title}</p>
        <p className="text-[10px] text-green-700 mb-1">{m.url}</p>
        {!compact && <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{m.desc}</p>}
        <button className="w-full text-white text-[10px] font-semibold px-2 py-1.5 rounded" style={{ backgroundColor: m.color }}>
          {m.cta}
        </button>
      </div>
    </div>
  )
}

/* ─── Composant principal ────────────────────────────────── */
interface AdUnitProps {
  size?: AdSize
  seed?: number
  category?: string
  neighborhood?: string
  className?: string
}

export default function AdUnit({ size = 'inline', seed = 0, category, neighborhood, className = '' }: AdUnitProps) {
  const [pros, setPros]     = useState<ProAd[]>([])
  const [loaded, setLoaded] = useState(false)
  const count = COUNTS[size]
  const hasAdSense = Boolean(process.env.NEXT_PUBLIC_ADSENSE_ID)

  useEffect(() => {
    const params = new URLSearchParams({ count: String(count) })
    if (category)     params.set('category', category)
    if (neighborhood) params.set('neighborhood', neighborhood)
    fetch(`/api/ads?${params}`)
      .then(r => r.json())
      .then((data: ProAd[]) => { setPros(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [category, neighborhood, count])

  /* ── SKYSCRAPER ── */
  if (size === 'skyscraper') {
    const items = loaded && pros.length > 0 ? pros : null
    return (
      <div className={`w-52 flex flex-col gap-2 ${className}`}>
        <p className="text-[11px] text-gray-400 text-center uppercase tracking-wide font-medium">
          {loaded && pros.length > 0 ? 'Professionnels' : 'Annonces'}
        </p>

        {loaded && pros.length === 0 && hasAdSense ? (
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SKYSCRAPER ?? ''} style={{ minWidth: 160, minHeight: 600 }} />
        ) : items ? (
          items.slice(0, 4).map(p => <ProCard key={p.id} pro={p} />)
        ) : (
          MOCK.slice(seed % 4, seed % 4 + 4).map((m, i) => <MockCard key={i} m={MOCK[(seed + i) % MOCK.length]} />)
        )}

        <p className="text-[10px] text-gray-300 text-center">
          {loaded && pros.length > 0 ? 'Pub directe' : hasAdSense ? 'Google Ads' : 'Pub'}
        </p>
      </div>
    )
  }

  /* ── BANNER ── */
  if (size === 'banner') {
    const pro = loaded && pros.length > 0 ? pros[0] : null
    const mock = MOCK[seed % MOCK.length]
    return (
      <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
        <div className="flex items-center justify-end px-3 py-0.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] text-gray-400">{pro ? 'Professionnel' : hasAdSense ? 'Google Ads' : 'Annonce'}</span>
        </div>

        {loaded && !pro && hasAdSense ? (
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} />
        ) : pro ? (
          <a
            href={proHref(pro)}
            target={proTarget(pro)}
            rel="noopener noreferrer"
            onClick={() => trackClick(pro.id)}
            className="flex items-center gap-4 px-4 py-2.5 hover:bg-orange-50 transition-colors"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg bg-orange-50">
              {pro.logo ? <img src={pro.logo} alt={pro.name} className="w-full h-full object-cover rounded" loading="lazy" /> : '💼'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy text-sm">{pro.name}</p>
              <p className="text-xs text-gray-500 truncate">{pro.description ?? pro.city}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-orange-primary font-semibold hidden sm:block">Voir →</span>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-4 px-4 py-2.5">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: mock.color + '20' }}>
              {mock.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy text-sm">{mock.title}</p>
              <p className="text-xs text-gray-500 truncate">{mock.desc}</p>
            </div>
            <button className="text-white text-xs font-semibold px-4 py-1.5 rounded whitespace-nowrap shrink-0" style={{ backgroundColor: mock.color }}>
              {mock.cta}
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ── RECTANGLE ── */
  if (size === 'rectangle') {
    const pro = loaded && pros.length > 0 ? pros[0] : null
    const mock = MOCK[seed % MOCK.length]
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Annonce</span>
          <span className="text-[10px] text-gray-400">{pro ? 'Professionnel' : 'Pub'}</span>
        </div>

        {loaded && !pro && hasAdSense ? (
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE ?? ''} />
        ) : pro ? (
          <ProCard pro={pro} />
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: mock.color + '20' }}>{mock.emoji}</div>
              <div>
                <p className="font-bold text-navy text-sm leading-tight">{mock.title}</p>
                <p className="text-[11px] text-green-700">{mock.url}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{mock.desc}</p>
            <button className="w-full text-white text-xs font-semibold px-3 py-2 rounded" style={{ backgroundColor: mock.color }}>{mock.cta}</button>
          </div>
        )}
      </div>
    )
  }

  /* ── INLINE (2 annonces côte à côte) ── */
  const showPros = loaded && pros.length > 0
  const mock0 = MOCK[seed % MOCK.length]
  const mock1 = MOCK[(seed + 1) % MOCK.length]
  return (
    <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-gray-200">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Annonces sponsorisées</span>
        <span className="text-[10px] text-gray-400">{showPros ? 'Professionnels' : hasAdSense ? 'Google Ads' : 'Pub'}</span>
      </div>

      {loaded && !showPros && hasAdSense ? (
        <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? ''} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {(showPros ? pros.slice(0, 2) : [null, null]).map((pro, i) => {
            const mock = i === 0 ? mock0 : mock1
            return pro ? (
              <a key={pro.id} href={proHref(pro)} target={proTarget(pro)} rel="noopener noreferrer"
                onClick={() => trackClick(pro.id)}
                className="flex items-center gap-3 p-3 hover:bg-orange-50 transition-colors">
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-orange-50 text-lg overflow-hidden">
                  {pro.logo ? <img src={pro.logo} alt={pro.name} className="w-full h-full object-cover" loading="lazy" /> : '💼'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy text-xs leading-tight">{pro.name}</p>
                  <p className="text-[11px] text-orange-primary mb-0.5">{pro.city}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{pro.description}</p>
                </div>
              </a>
            ) : (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: mock.color + '20' }}>{mock.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy text-xs leading-tight">{mock.title}</p>
                  <p className="text-[11px] text-green-700 mb-0.5">{mock.url}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{mock.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
