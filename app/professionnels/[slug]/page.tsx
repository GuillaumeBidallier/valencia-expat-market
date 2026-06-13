import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MapPin, Phone, Globe, ArrowLeft, CheckCircle, Star, ExternalLink, Pencil } from 'lucide-react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { proCategories } from '@/lib/proCategories'
import ProGallery from './ProGallery'
import ProMapClient from './ProMapClient'

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'valencia':  { lat: 39.4699, lng: -0.3763 },
  'madrid':    { lat: 40.4168, lng: -3.7038 },
  'barcelona': { lat: 41.3874, lng:  2.1686 },
  'alicante':  { lat: 38.3452, lng: -0.4815 },
  'benidorm':  { lat: 38.5400, lng: -0.1300 },
  'torrevieja':{ lat: 37.9783, lng: -0.6826 },
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const key = city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (CITY_COORDS[key]) return CITY_COORDS[key]
  try {
    const q = encodeURIComponent(`${city}, Spain`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VendoValencia/1.0 contact@vendo.es' }, next: { revalidate: 86400 } }
    )
    if (!res.ok) return CITY_COORDS['valencia']
    const data = await res.json()
    if (!data[0]) return CITY_COORDS['valencia']
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return CITY_COORDS['valencia']
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({
    where: { slug },
    select: { name: true, description: true, city: true, logo: true, banner: true, category: true },
  })
  if (!pro) return { title: 'Professional not found' }
  const catLabel = proCategories.find(c => c.slug === pro.category)?.label ?? pro.category
  const description = pro.description
    ? pro.description.slice(0, 155).replace(/\n/g, ' ')
    : `${pro.name} — ${catLabel} · ${pro.city}`
  const image = pro.banner ?? pro.logo
  return {
    title: `${pro.name} — ${catLabel} · ${pro.city}`,
    description,
    openGraph: {
      title: `${pro.name} — ${catLabel} · ${pro.city}`,
      description,
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: pro.name }] }),
    },
  }
}

export default async function ProDetailPage({ params }: Props) {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({ where: { slug } })
  if (!pro) notFound()

  const [session, geoCoords, t] = await Promise.all([
    auth(),
    pro.city ? geocodeCity(pro.city) : null,
    getTranslations('ProDetail'),
  ])
  const tPros = await getTranslations('Pros')

  const isOwner = !!(session?.user?.id && pro.userId === session.user.id)

  const catLabel = tPros(`cat_${pro.category}` as Parameters<typeof tPros>[0], { defaultValue: pro.category }) ?? pro.category
  const catIcon  = proCategories.find(c => c.slug === pro.category)?.icon ?? '💼'
  const isPremiumPlus = pro.tier === 'PREMIUM_PLUS'
  const isPremium = pro.tier === 'PREMIUM' || isPremiumPlus

  const accentFrom = isPremiumPlus ? '#E8571A' : isPremium ? '#4338CA' : '#1e2d5e'
  const accentTo   = isPremiumPlus ? '#f97316' : isPremium ? '#6366F1' : '#334155'
  const heroGradient = isPremiumPlus
    ? 'from-orange-700 to-orange-500'
    : isPremium ? 'from-indigo-800 to-indigo-600'
    : 'from-navy to-slate-600'

  const coverSrc = pro.banner ?? pro.logo

  const waMsg = t('wa_message', { name: pro.name })
  const waLink = pro.whatsapp
    ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`
    : null

  const ccStrings = {
    contact_label:  t('contact_label'),
    verified_badge: t('verified_badge'),
    visit_website:  t('visit_website'),
    mention_vendo:  t('mention_vendo'),
  }

  const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

  const SCHEMA_TYPE: Record<string, string> = {
    immobilier:   'RealEstateAgent',
    juridique:    'LegalService',
    comptabilite: 'AccountingService',
    demenagement: 'MovingCompany',
    assurance:    'InsuranceAgency',
    sante:        'MedicalBusiness',
    automobiles:  'AutoDealer',
    services:     'HomeAndConstructionBusiness',
    education:    'EducationalOrganization',
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE[pro.category] ?? 'LocalBusiness',
    name: pro.name,
    ...(pro.description && { description: pro.description }),
    url: `${BASE}/professionnels/${pro.slug}`,
    ...(pro.logo && { image: pro.logo }),
    ...(pro.phone && { telephone: pro.phone }),
    ...(pro.website && { sameAs: [pro.website] }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: pro.city,
      addressCountry: 'ES',
    },
    ...(geoCoords && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geoCoords.lat,
        longitude: geoCoords.lng,
      },
    }),
    ...(pro.zones.length > 0 && { areaServed: pro.zones }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* ════════════════════════════════════════
          HERO — immersive, company name inside
      ════════════════════════════════════════ */}
      <div className={`relative h-72 sm:h-[400px] w-full bg-gradient-to-br ${heroGradient} overflow-hidden`}>
        {coverSrc && (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Navigation */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 flex items-center gap-3">
          <Link
            href="/professionnels"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-colors"
          >
            <ArrowLeft size={13} /> {t('back')}
          </Link>
        </div>

        {isOwner && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8">
            <Link
              href="/mon-compte/profil-pro"
              className="inline-flex items-center gap-1.5 text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-colors"
            >
              <Pencil size={13} /> {t('edit')}
            </Link>
          </div>
        )}

        {/* Company identity — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/15">
                <span aria-hidden="true">{catIcon}</span> {catLabel}
              </span>
              {isPremiumPlus && (
                <span className="inline-flex items-center gap-1 bg-orange-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  <Star size={10} fill="currentColor" /> {t('badge_premium_plus')}
                </span>
              )}
              {isPremium && !isPremiumPlus && (
                <span className="inline-flex items-center gap-1 bg-indigo-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  <Star size={10} fill="currentColor" /> {t('badge_premium')}
                </span>
              )}
              {pro.verified && (
                <span className="inline-flex items-center gap-1 bg-white/90 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
                  <CheckCircle size={10} /> {t('badge_verified')}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-white font-black text-2xl sm:text-4xl leading-tight drop-shadow-lg mb-2">
              {pro.name}
            </h1>

            {/* City + zones */}
            <p className="text-white/65 text-sm flex items-center gap-1.5">
              <MapPin size={12} aria-hidden="true" />
              {pro.city}
              {pro.zones.length > 0 && (
                <span className="text-white/40 mx-1">·</span>
              )}
              {pro.zones.slice(0, 3).join(' · ')}
              {pro.zones.length > 3 && <span className="text-white/40"> +{pro.zones.length - 3}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          AVATAR STRIP + QUICK ACTIONS
      ════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between">
            {/* Circular avatar overlapping hero */}
            <div
              className="shrink-0 -mt-10 sm:-mt-14 mb-4 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
            >
              {pro.logo
                ? <Image src={pro.logo} alt={pro.name} width={112} height={112} className="w-full h-full object-cover" />
                : <span className="text-4xl" aria-hidden="true">{catIcon}</span>
              }
            </div>

            {/* Quick contact buttons — desktop only */}
            <div className="hidden sm:flex items-center gap-2 pb-4">
              {pro.phone && (
                <a
                  href={`tel:${pro.phone}`}
                  className="inline-flex items-center gap-2 bg-navy text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-navy/90 transition-colors"
                >
                  <Phone size={14} /> {pro.phone}
                </a>
              )}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#1ebe5d] transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {isPremium && pro.website && (
                <a
                  href={pro.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-600 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <Globe size={14} /> {t('visit_website')} <ExternalLink size={11} className="opacity-50" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MAIN BODY
      ════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Left: editorial content ── */}
          <div className="space-y-12">

            {/* About */}
            {pro.description && (
              <section>
                <p className="text-[11px] font-bold text-orange-primary uppercase tracking-widest mb-4">{t('section_about')}</p>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                  {pro.description}
                </p>
              </section>
            )}

            {/* Gallery */}
            {pro.photos.length > 0 && (
              <section>
                <p className="text-[11px] font-bold text-orange-primary uppercase tracking-widest mb-4">{t('section_gallery')}</p>
                <ProGallery photos={pro.photos} name={pro.name} featured />
              </section>
            )}

            {/* Map */}
            {geoCoords && (
              <section>
                <p className="text-[11px] font-bold text-orange-primary uppercase tracking-widest mb-4">{t('section_location')}</p>
                <ProMapClient lat={geoCoords.lat} lng={geoCoords.lng} name={pro.name} city={pro.city} zones={pro.zones} />
              </section>
            )}

            {/* Zones */}
            {pro.zones.length > 0 && (
              <section>
                <p className="text-[11px] font-bold text-orange-primary uppercase tracking-widest mb-4">{t('section_zones')}</p>
                <div className="flex flex-wrap gap-2">
                  {pro.zones.map(z => (
                    <span
                      key={z}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm"
                    >
                      <MapPin size={11} className="text-orange-primary shrink-0" aria-hidden="true" /> {z}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Mobile contact */}
            <div className="lg:hidden pb-10">
              <ContactCard pro={pro} isPremium={isPremium} waLink={waLink} accentFrom={accentFrom} accentTo={accentTo} strings={ccStrings} />
            </div>
          </div>

          {/* ── Right: sticky contact ── */}
          <aside className="hidden lg:block self-start sticky top-24 pb-10">
            <ContactCard pro={pro} isPremium={isPremium} waLink={waLink} accentFrom={accentFrom} accentTo={accentTo} strings={ccStrings} />
          </aside>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM CTA BAND
      ════════════════════════════════════════ */}
      <div className="mt-16 bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white/50 text-sm mb-1">{t('cta_intro')}</p>
            <p className="text-white text-2xl font-black">{pro.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {pro.phone && (
              <a
                href={`tel:${pro.phone}`}
                className="inline-flex items-center gap-2 bg-white text-navy font-bold text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Phone size={15} /> {t('cta_call')}
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#1ebe5d] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            {isPremium && pro.website && (
              <a
                href={pro.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Globe size={15} /> {t('visit_website')}
              </a>
            )}
          </div>
        </div>
      </div>

    </div>
    </>
  )
}

/* ════════════════════════════════════════
   CONTACT CARD COMPONENT
════════════════════════════════════════ */
type ContactCardStrings = {
  contact_label: string
  verified_badge: string
  visit_website: string
  mention_vendo: string
}

type ContactCardProps = {
  pro: { name: string; phone: string | null; whatsapp: string | null; website: string | null; verified: boolean }
  isPremium: boolean
  waLink: string | null
  accentFrom: string
  accentTo: string
  strings: ContactCardStrings
}

function ContactCard({ pro, isPremium, waLink, accentFrom, accentTo, strings }: ContactCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200/60">
      {/* Card header */}
      <div
        className="px-5 py-5 text-white"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
      >
        <p className="text-white/60 text-xs font-medium mb-1">{strings.contact_label}</p>
        <p className="font-black text-lg leading-snug">{pro.name}</p>
        {pro.verified && (
          <p className="text-white/70 text-xs flex items-center gap-1 mt-2">
            <CheckCircle size={11} /> {strings.verified_badge}
          </p>
        )}
      </div>

      {/* CTAs */}
      <div className="bg-white p-4 flex flex-col gap-2.5">
        {pro.phone && (
          <a
            href={`tel:${pro.phone}`}
            className="flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-navy/90 transition-colors"
          >
            <Phone size={15} aria-hidden="true" /> {pro.phone}
          </a>
        )}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        )}
        {isPremium && pro.website && (
          <a
            href={pro.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-gray-100 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-colors"
          >
            <Globe size={14} aria-hidden="true" /> {strings.visit_website}
            <ExternalLink size={12} className="ml-auto opacity-40" aria-hidden="true" />
          </a>
        )}

        <p className="text-[11px] text-gray-400 text-center pt-1">
          {strings.mention_vendo}
        </p>
      </div>
    </div>
  )
}
