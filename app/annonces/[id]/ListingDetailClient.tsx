'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import AdUnit from '@/components/ads/AdUnit'
import {
  MapPin, Calendar, ChevronRight, ChevronLeft, Phone, Flag, ShieldCheck, MessageSquare, X, Share2, Copy, Check,
  Gauge, Fuel, Settings2, Disc, Tag, Package, IdCard, Zap, BadgeCheck,
  Home, Ruler, Building, CheckCircle2, Clock3, Flame, BedDouble, Bath, DoorOpen, Trees, Warehouse, FileText, type LucideIcon,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import FavoriteButton from '@/components/listings/FavoriteButton'
import { Listing } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useVehiculesPageTheme } from '@/context/PageThemeContext'
import { CATEGORY_ATTRIBUTES } from '@/lib/categoryAttributes'

const ATTRIBUTE_ICONS: Record<string, LucideIcon> = {
  brand: Tag,
  model: Package,
  cubic_capacity: Disc,
  regdate: Calendar,
  mileage: Gauge,
  fuel: Fuel,
  gearbox: Settings2,
  cycle_licence: IdCard,
  horse_power_din: Zap,
  horsepower: Zap,
  type_bien: Home,
  annee_construction: Calendar,
  surface_habitable: Ruler,
  surface_terrain: Trees,
  nb_facades: Building,
  etat_bien: CheckCircle2,
  disponibilite: Clock3,
  classe_energie: Zap,
  type_chauffage: Flame,
  pieces: DoorOpen,
  chambres: BedDouble,
  salles_bain: Bath,
}
const DEFAULT_ATTR_ICON = Tag

// Quick-spec chips for Immobilier — curated subset + order, matching the mockup.
const IMMOBILIER_CHIP_KEYS = ['surface_habitable', 'chambres', 'salles_bain', 'surface_terrain', 'classe_energie']
// Caractéristiques grid for Immobilier — curated subset + order, matching the mockup.
const IMMOBILIER_CARACTERISTIQUES_KEYS = [
  'type_bien', 'annee_construction', 'surface_habitable',
  'nb_facades', 'etat_bien', 'surface_terrain',
  'disponibilite', 'classe_energie', 'type_chauffage',
]

interface AttrPair { key: string; label: string; value: string; icon: LucideIcon }

function getVehicleAttributePairs(categorySlug: string, attributes: Record<string, string | number | string[]> | null | undefined): AttrPair[] {
  const fields = CATEGORY_ATTRIBUTES[categorySlug]
  if (!fields || !attributes) return []

  const pairs: AttrPair[] = []
  for (const field of fields) {
    if (field.type === 'brand-model') {
      const brand = attributes[field.brandKey]
      const model = attributes[field.modelKey]
      if (brand) pairs.push({ key: field.brandKey, label: 'Marque', value: String(brand), icon: ATTRIBUTE_ICONS.brand })
      if (model) pairs.push({ key: field.modelKey, label: 'Modèle', value: String(model), icon: ATTRIBUTE_ICONS.model })
    } else if (field.type === 'select' && field.multi) {
      const raw = attributes[field.key]
      const values = Array.isArray(raw) ? raw : []
      const labels = values
        .map(v => field.options.find(o => o.value === v)?.label)
        .filter((l): l is string => Boolean(l))
      if (labels.length > 0) pairs.push({ key: field.key, label: field.label, value: labels.join(', '), icon: ATTRIBUTE_ICONS[field.key] ?? DEFAULT_ATTR_ICON })
    } else if (field.type === 'select') {
      const raw = attributes[field.key]
      if (raw !== undefined && raw !== '') {
        const opt = field.options.find(o => o.value === String(raw))
        if (opt) pairs.push({ key: field.key, label: field.key === 'critair' ? "Crit'air" : field.label, value: opt.label, icon: ATTRIBUTE_ICONS[field.key] ?? DEFAULT_ATTR_ICON })
      }
    } else {
      const raw = attributes[field.key]
      if (raw !== undefined && raw !== '') {
        pairs.push({ key: field.key, label: field.label, value: field.unit ? `${raw} ${field.unit}` : String(raw), icon: ATTRIBUTE_ICONS[field.key] ?? DEFAULT_ATTR_ICON })
      }
    }
  }
  return pairs
}

/** Filters + reorders pairs to an explicit key list (used to curate the Immobilier chip row / Caractéristiques grid). */
function pickPairs(pairs: AttrPair[], keys: string[]): AttrPair[] {
  return keys.map(k => pairs.find(p => p.key === k)).filter((p): p is AttrPair => Boolean(p))
}

const ListingMap = dynamic(() => import('@/components/listings/ListingMap'), { ssr: false })
const RentalApplicationModal = dynamic(() => import('./RentalApplicationModal'), { ssr: false })

interface Props {
  listing: Listing & { neighborhood: string }
  isFavorited?: boolean
  categoryInfo?: {
    label: string
    slug: string
    icon: string
    parent: { slug: string; label: string; icon: string } | null
  } | null
  vehicules?: boolean
  immobilier?: boolean
  sellerVerified?: boolean
  professional?: { slug: string; name: string; logo: string | null } | null
}

export default function ListingDetailClient({ listing, isFavorited, categoryInfo, vehicules, immobilier, sellerVerified, professional }: Props) {
  const enhanced = !!(vehicules || immobilier)
  const t = useTranslations('ListingDetail')
  const tShare = useTranslations('Share')
  const tListings = useTranslations('Listings')
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [activeImg, setActiveImg] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const sellerShowsPhone = listing.user?.showPhone !== false
  const sellerShowsWhatsapp = listing.user?.showWhatsapp !== false
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [reportSending, setReportSending] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  useVehiculesPageTheme(!!vehicules)

  // Track view — fire-and-forget
  useEffect(() => {
    fetch(`/api/listings/${listing.id}/view`, { method: 'POST' }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id])

  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shareOpen])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url: pageUrl })
        return
      } catch { /* user cancelled */ }
    }
    setShareOpen(prev => !prev)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShareOpen(false) }, 2000)
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${pageUrl}`)}`, '_blank', 'noopener,noreferrer')
    setShareOpen(false)
  }

  const isOwner = isAuthenticated && user?.id === listing.userId

  const openMessageModal = () => {
    if (!isAuthenticated) { router.push('/connexion'); return }
    setMessageOpen(true)
  }

  const openApplicationModal = () => {
    if (!isAuthenticated) { router.push('/connexion'); return }
    setApplicationOpen(true)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim() || messageSending) return
    setMessageSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, body: messageBody }),
    })
    if (res.ok) {
      const { conversationId } = await res.json()
      router.push(`/messages/${conversationId}`)
    }
    setMessageSending(false)
  }

  const waLink = `https://wa.me/${(listing.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur 1000Click.`)}`
  const publishDate = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const reportReasons = [0, 1, 2, 3, 4].map(i => t(`report_reason_${i}` as Parameters<typeof t>[0]))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-primary">{t('breadcrumb_home')}</Link>
        <ChevronRight size={12} />
        <Link href="/annonces" className="hover:text-orange-primary">{t('breadcrumb_listings')}</Link>
        <ChevronRight size={12} />
        {categoryInfo?.parent ? (
          <>
            <Link href={`/annonces?cat=${categoryInfo.parent.slug}`} className="hover:text-orange-primary">
              {categoryInfo.parent.icon} {categoryInfo.parent.label}
            </Link>
            <span className="text-gray-300 mx-1">›</span>
            <Link href={`/annonces?cat=${categoryInfo.slug}`} className="hover:text-orange-primary">
              {categoryInfo.icon} {categoryInfo.label}
            </Link>
          </>
        ) : (
          <Link href={`/annonces?cat=${listing.categorySlug}`} className="hover:text-orange-primary">
            {categoryInfo?.label ?? listing.category ?? listing.categorySlug}
          </Link>
        )}
        <ChevronRight size={12} />
        <span className="text-navy line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + info */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className={`relative rounded-xl overflow-hidden ${vehicules ? 'bg-[#0a0a0f] mb-6' : enhanced ? 'bg-gray-100 mb-6' : 'bg-gray-100 mb-3'}`}>
            <div className={`relative ${enhanced ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
              {listing.images.length > 0 ? (
                <Image src={listing.images[activeImg]?.url ?? ''} alt={listing.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">{t('no_photo')}</div>
              )}

              {enhanced && listing.images.length > 1 && (
                <>
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeImg + 1} / {listing.images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveImg(i => (i - 1 + listing.images.length) % listing.images.length)}
                    aria-label="Image précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <ChevronLeft size={18} className="text-navy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImg(i => (i + 1) % listing.images.length)}
                    aria-label="Image suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <ChevronRight size={18} className="text-navy" />
                  </button>
                </>
              )}

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <FavoriteButton
                  listingId={listing.id}
                  initialFavorited={isFavorited}
                  iconSize={16}
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 flex items-center justify-center"
                />
                {enhanced && (
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label={tShare('share_btn')}
                    className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Share2 size={15} className="text-navy" />
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnails — attached filmstrip on Véhicules/Immobilier, matching the mockup */}
            {enhanced && listing.images.length > 1 && (
              <div className={vehicules ? 'bg-[#0a0a0f] px-3 py-2.5' : 'bg-white px-3 py-2.5'}>
                <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-20 h-14 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                        activeImg === i
                          ? (vehicules ? 'border-red-600' : 'border-orange-primary')
                          : (vehicules ? 'border-white/10' : 'border-gray-200')
                      }`}
                    >
                      <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails — non-enhanced layout unchanged */}
          {!enhanced && listing.images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImg === i ? 'border-orange-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={vehicules ? 'bg-red-600' : ''}>{categoryInfo?.label ?? listing.category ?? listing.categorySlug}</Badge>
                  {professional && (
                    <span className="inline-flex items-center gap-1 bg-navy/5 text-navy text-xs font-semibold px-2.5 py-1 rounded-full border border-navy/10">
                      {professional.logo && (
                        <span className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
                          <Image src={professional.logo} alt="" fill className="object-cover" />
                        </span>
                      )}
                      {tListings('pro_badge')}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-navy">{listing.title}</h1>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-extrabold text-navy">
                  {listing.price !== null ? `${listing.price.toLocaleString('fr-FR')} €` : <span className="text-green-600 text-xl">{t('free')}</span>}
                </div>
                {enhanced && listing.price !== null && (
                  <p className="text-xs text-gray-400 mt-0.5">{vehicules ? 'Prix fixe' : 'Prix demandé'}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.neighborhood}, {listing.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {t('published_on')} {publishDate}</span>
            </div>

            {(() => {
              const allPairs = getVehicleAttributePairs(listing.categorySlug, listing.attributes)

              if (immobilier) {
                const pairs = pickPairs(allPairs, IMMOBILIER_CHIP_KEYS)
                const caracteristiques = listing.attributes?.caracteristiques
                if (Array.isArray(caracteristiques) && caracteristiques.includes('parking_garage')) {
                  pairs.push({ key: 'garage', label: 'Équipement', value: 'Garage', icon: Warehouse })
                }
                if (pairs.length === 0) return null
                return (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {pairs.map(p => (
                      <div key={p.key} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                        <p.icon size={16} className="text-gray-400 shrink-0" />
                        <div className="leading-tight">
                          <p className="text-xs font-bold text-navy">{p.value}</p>
                          <p className="text-[10px] text-gray-400">{p.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              if (allPairs.length === 0) return null
              // Brand/model are already shown in the title — leave them out of the quick-spec chips.
              const pairs = vehicules ? allPairs.filter(p => p.key !== 'brand' && p.key !== 'model') : allPairs
              if (pairs.length === 0) return null
              return vehicules ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {pairs.map(p => (
                    <span key={p.key} className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-gray-100 px-2.5 py-1.5 rounded-lg">
                      <p.icon size={13} className="text-gray-400" /> {p.value}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-6">
                  {pairs.map(p => (
                    <span key={p.key} className="text-xs font-semibold text-navy bg-gray-100 px-2.5 py-1 rounded-lg">{p.value}</span>
                  ))}
                </div>
              )
            })()}

            <div>
              <h2 className="font-semibold text-navy mb-2">{t('description')}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Caractéristiques */}
          {enhanced && (() => {
            const allPairs = getVehicleAttributePairs(listing.categorySlug, listing.attributes)
            const pairs = immobilier ? pickPairs(allPairs, IMMOBILIER_CARACTERISTIQUES_KEYS) : allPairs
            if (pairs.length === 0) return null
            return (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <h2 className="font-semibold text-navy mb-4">Caractéristiques</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
                  {pairs.map(p => (
                    <div key={p.key} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${vehicules ? 'bg-red-50' : 'bg-orange-soft'}`}>
                        <p.icon size={15} className={vehicules ? 'text-red-600' : 'text-orange-primary'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{p.label}</p>
                        <p className="text-sm font-semibold text-navy">{p.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Map */}
          {listing.lat != null && listing.lng != null && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-navy mb-3 flex items-center gap-1.5">
                <MapPin size={15} className="text-orange-primary" /> {t('location')}
              </h2>
              <ListingMap lat={listing.lat} lng={listing.lng} neighborhood={listing.neighborhood} />
            </div>
          )}
        </div>

        {/* Right: Contact + security + ads */}
        <div className="flex flex-col gap-4 self-start sticky top-20">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            {professional ? (
              <Link
                href={`/professionnels/${professional.slug}`}
                className="flex items-center justify-between gap-3 mb-4 -mx-1 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <h2 className="font-semibold text-navy group-hover:text-orange-primary transition-colors">{t('contact_seller')}</h2>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {t('published_by')} {professional.name}
                    {enhanced && sellerVerified && <BadgeCheck size={13} className={vehicules ? 'text-red-600' : 'text-orange-primary'} aria-label="Vendeur vérifié" />}
                  </p>
                </div>
                {professional.logo && (
                  <span className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white">
                    <Image src={professional.logo} alt={professional.name} fill className="object-cover" />
                  </span>
                )}
              </Link>
            ) : (
              <>
                <h2 className="font-semibold text-navy mb-1">{t('contact_seller')}</h2>
                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                  {t('published_by')} {listing.userName ?? listing.user?.name ?? 'Vendeur'}
                  {enhanced && sellerVerified && <BadgeCheck size={13} className={vehicules ? 'text-red-600' : 'text-orange-primary'} aria-label="Vendeur vérifié" />}
                </p>
              </>
            )}

            {isOwner ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">{t('owner_notice')}</p>
            ) : (
              <>
                <Button
                  className={vehicules ? 'w-full text-sm mb-3 bg-red-600 hover:bg-red-700' : 'w-full text-sm mb-3'}
                  onClick={openMessageModal}
                >
                  <MessageSquare size={15} /> {t('send_message')}
                </Button>

                {immobilier && (
                  <Button
                    variant="outline"
                    className="w-full text-sm mb-3"
                    onClick={openApplicationModal}
                  >
                    <FileText size={15} /> {t('app_cta')}
                  </Button>
                )}

                {listing.phone && (sellerShowsPhone || sellerShowsWhatsapp) && (
                  <>
                    {sellerShowsWhatsapp && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full block mb-3">
                        <Button variant="whatsapp" className="w-full text-sm">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {t('whatsapp')}
                        </Button>
                      </a>
                    )}

                    {sellerShowsPhone && (
                      !showPhone ? (
                        <Button
                          variant="outline"
                          className={vehicules ? 'w-full text-sm border-red-600 text-red-600 hover:bg-red-50' : 'w-full text-sm'}
                          onClick={() => setShowPhone(true)}
                        >
                          <Phone size={15} /> {t('show_phone')}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-navy">
                          <Phone size={15} className={vehicules ? 'text-red-600' : 'text-orange-primary'} />
                          {listing.phone}
                        </div>
                      )
                    )}
                  </>
                )}
              </>
            )}

            {/* Save to favorites */}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={isFavorited}
                iconSize={15}
                showLabel
                className="mt-3 w-full flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-red-300 transition-colors"
              />
            )}

            {/* Security notice */}
            <div className={vehicules ? 'mt-4 bg-red-50 rounded-lg p-3 flex gap-2' : 'mt-4 bg-orange-soft rounded-lg p-3 flex gap-2'}>
              <ShieldCheck size={16} className={vehicules ? 'text-red-600 shrink-0 mt-0.5' : 'text-orange-primary shrink-0 mt-0.5'} />
              <p className="text-xs text-gray-600 leading-relaxed">{t('security_notice')}</p>
            </div>

            {/* Share button */}
            <div ref={shareRef} className="relative mt-3">
              <button
                onClick={handleShare}
                aria-label={tShare('share_btn')}
                aria-expanded={shareOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-primary transition-colors"
              >
                <Share2 size={13} aria-hidden="true" /> {tShare('share_btn')}
              </button>
              {shareOpen && (
                <div role="menu" className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 min-w-[180px]">
                  <button
                    role="menuitem"
                    onClick={copyLink}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check size={15} className="text-green-500" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    {copied ? tShare('copied') : tShare('copy_link')}
                  </button>
                  <button
                    role="menuitem"
                    onClick={shareWhatsApp}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-green-500" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {tShare('share_whatsapp')}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setReportOpen(true)} aria-haspopup="dialog" className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Flag size={12} aria-hidden="true" /> {t('report')}
            </button>
          </div>

          {/* Trust badges */}
          {enhanced && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
              {[
                { icon: ShieldCheck, title: 'Paiement sécurisé', desc: 'Paiement en main propre uniquement' },
                { icon: BadgeCheck, title: 'Vendeur vérifié', desc: 'Annonce publiée par un vendeur vérifié' },
                { icon: MessageSquare, title: 'Réponse rapide', desc: 'Répond en moyenne en moins de 2h' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${vehicules ? 'bg-red-50' : 'bg-orange-soft'}`}>
                    <item.icon size={15} className={vehicules ? 'text-red-600' : 'text-orange-primary'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ads in sidebar */}
          <AdUnit size="rectangle" seed={1} category={listing.categorySlug} neighborhood={listing.neighborhood} />
          <AdUnit size="rectangle" seed={3} category={listing.categorySlug} neighborhood={listing.neighborhood} />
        </div>
      </div>

      {/* Bottom ad banner */}
      <AdUnit size="inline" seed={6} category={listing.categorySlug} neighborhood={listing.neighborhood} className="mt-6" />

      {/* Message modal */}
      {messageOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMessageOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="msg-modal-title" className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 id="msg-modal-title" className="font-bold text-navy text-lg">{t('message_modal_title')}</h3>
              <button onClick={() => setMessageOpen(false)} aria-label="Fermer" className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Listing summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
              {listing.images[0] && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={listing.images[0].url} alt={listing.title} fill sizes="48px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
                <p className="text-orange-primary text-sm font-bold">
                  {listing.price !== null ? `${listing.price} €` : t('free')}
                </p>
              </div>
            </div>

            <form onSubmit={sendMessage}>
              <label htmlFor="message-body" className="sr-only">{t('message_modal_title')}</label>
              <textarea
                id="message-body"
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                placeholder={t('message_placeholder')}
                rows={4}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary resize-none mb-4"
              />
              <Button type="submit" className="w-full" disabled={!messageBody.trim() || messageSending}>
                <MessageSquare size={15} />
                {messageSending ? t('sending') : t('send_btn')}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Rental application modal */}
      {applicationOpen && (
        <RentalApplicationModal
          listingId={listing.id}
          defaultType={listing.categorySlug.includes('location') || listing.categorySlug.includes('coloc') ? 'LOCATION' : 'ACHAT'}
          defaultName={user?.name}
          defaultEmail={user?.email}
          onClose={() => setApplicationOpen(false)}
        />
      )}

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setReportOpen(false); setReportSent(false); setReportReason('') }}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-modal-title" className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <div className="text-center py-4" role="status" aria-live="polite">
                <p className="text-3xl mb-3" aria-hidden="true">✅</p>
                <h3 id="report-modal-title" className="font-bold text-navy mb-1">{t('report_sent_title')}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('report_sent_desc')}</p>
                <Button className="w-full text-sm" onClick={() => { setReportOpen(false); setReportSent(false); setReportReason('') }}>{t('close')}</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 id="report-modal-title" className="font-bold text-navy">{t('report_title')}</h3>
                  <button onClick={() => setReportOpen(false)} aria-label="Fermer" className="text-gray-400 hover:text-navy"><X size={18} aria-hidden="true" /></button>
                </div>
                <fieldset>
                  <legend className="text-sm text-gray-500 mb-4">{t('report_reason_prompt')}</legend>
                  {reportReasons.map(r => (
                    <label key={r} className="flex items-center gap-2 py-2 text-sm cursor-pointer hover:text-orange-primary">
                      <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-orange-primary" /> {r}
                    </label>
                  ))}
                </fieldset>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1 text-sm" onClick={() => setReportOpen(false)}>{t('cancel')}</Button>
                  <Button
                    className="flex-1 text-sm"
                    disabled={!reportReason || reportSending}
                    onClick={async () => {
                      if (!reportReason) return
                      setReportSending(true)
                      await fetch(`/api/listings/${listing.id}/report`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reason: reportReason }),
                      })
                      setReportSending(false)
                      setReportSent(true)
                    }}
                  >
                    {reportSending ? t('sending_short') : t('send')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
