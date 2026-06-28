import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MapPin, Globe, Phone, MessageCircle, Mail, QrCode } from 'lucide-react'
import { BUSINESS_CARD_ENABLED } from '@/lib/feature-flags'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!BUSINESS_CARD_ENABLED) return { title: 'Page introuvable' }
  const { slug } = await params
  const pro = await prisma.professional.findUnique({
    where: { slug },
    include: { businessCard: true },
  })
  if (!pro?.businessCard?.active) return { title: 'Carte de visite introuvable' }

  return {
    title: `${pro.name} — Carte de visite numérique`,
    description: pro.businessCard.tagline ?? pro.description ?? `Contactez ${pro.name} sur 1000Click`,
    openGraph: {
      title: `${pro.name} — ${pro.businessCard.headline ?? pro.category}`,
      description: pro.businessCard.tagline ?? pro.description ?? '',
      ...(pro.logo ? { images: [{ url: pro.logo, width: 400, height: 400 }] } : {}),
    },
  }
}

export default async function BusinessCardPage({ params }: Props) {
  if (!BUSINESS_CARD_ENABLED) notFound()

  const { slug } = await params

  const pro = await prisma.professional.findUnique({
    where: { slug },
    include: { businessCard: true },
  })

  if (!pro || !pro.businessCard?.active) notFound()

  const card = pro.businessCard
  const primary = card.primaryColor ?? '#4F46E5'

  // Determine first contact CTA
  const ctaHref = card.showWhatsapp && pro.whatsapp
    ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}`
    : card.showPhone && pro.phone
      ? `tel:${pro.phone}`
      : card.showEmail && (card.email ?? pro.website)
        ? `mailto:${card.email}`
        : card.showWebsite && pro.website
          ? pro.website
          : null

  return (
    <>
      {/* ─── Mobile-first full-page card ─────────────────── */}
      <div className="min-h-screen bg-gray-50 pb-28">

        {/* Hero banner */}
        <div
          className="relative h-44 sm:h-56 w-full overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primary}ee 0%, ${primary}88 100%)` }}
        >
          {pro.banner && (
            <Image src={pro.banner} alt="Bannière" fill className="object-cover mix-blend-overlay opacity-30" sizes="100vw" />
          )}
          {/* 1000Click watermark */}
          <Link
            href="/"
            className="absolute top-4 right-4 text-white/70 text-xs font-bold tracking-widest uppercase hover:text-white transition-colors"
          >
            1000Click
          </Link>
        </div>

        {/* Card body */}
        <div className="max-w-md mx-auto px-4 -mt-14 relative z-10">

          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden mb-4 bg-white"
            style={{ borderColor: 'white' }}
          >
            {pro.logo
              ? <Image src={pro.logo} alt={pro.name} width={96} height={96} className="w-full h-full object-cover" />
              : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-3xl font-black"
                  style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}99 100%)` }}
                >
                  {pro.name.charAt(0).toUpperCase()}
                </div>
              )}
          </div>

          {/* Name + headline */}
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{pro.name}</h1>
          {card.headline && (
            <p className="text-base font-semibold mt-0.5" style={{ color: primary }}>
              {card.headline}
            </p>
          )}
          {card.tagline && (
            <p className="text-sm text-gray-500 mt-1 leading-snug">{card.tagline}</p>
          )}

          {/* Location + category */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <MapPin size={12} style={{ color: primary }} />
              {pro.city}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              {pro.category}
            </span>
          </div>

          {/* Description */}
          {pro.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-5 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed">{pro.description}</p>
            </div>
          )}

          {/* Contact details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 overflow-hidden divide-y divide-gray-50">
            {card.showPhone && pro.phone && (
              <a
                href={`tel:${pro.phone}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${primary}18` }}>
                  <Phone size={16} style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Téléphone</p>
                  <p className="text-sm font-bold text-gray-800 group-hover:underline">{pro.phone}</p>
                </div>
              </a>
            )}
            {card.showWhatsapp && pro.whatsapp && (
              <a
                href={`https://wa.me/${pro.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50">
                  <MessageCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">WhatsApp</p>
                  <p className="text-sm font-bold text-gray-800 group-hover:underline">{pro.whatsapp}</p>
                </div>
              </a>
            )}
            {card.showEmail && (card.email) && (
              <a
                href={`mailto:${card.email}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">E-mail</p>
                  <p className="text-sm font-bold text-gray-800 group-hover:underline">{card.email}</p>
                </div>
              </a>
            )}
            {card.showWebsite && pro.website && (
              <a
                href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${primary}18` }}>
                  <Globe size={16} style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Site web</p>
                  <p className="text-sm font-bold text-gray-800 group-hover:underline truncate max-w-[220px]">{pro.website}</p>
                </div>
              </a>
            )}
          </div>

          {/* View full profile */}
          <Link
            href={`/professionnels/${pro.slug}`}
            className="flex items-center justify-center gap-2 mt-4 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors shadow-sm"
          >
            Voir la fiche complète
          </Link>

          {/* QR code hint */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
            <QrCode size={13} />
            <span>Scannez ou partagez ce lien</span>
          </div>

          {/* 1000Click footer */}
          <p className="text-center text-[10px] text-gray-300 mt-3 pb-2">
            Carte de visite numérique propulsée par{' '}
            <Link href="/" className="text-gray-400 hover:underline font-medium">1000Click</Link>
          </p>
        </div>
      </div>

      {/* ─── Fixed CTA bar ─────────────────────────────────── */}
      {ctaHref && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-2xl">
          <a
            href={ctaHref}
            target={ctaHref.startsWith('http') ? '_blank' : undefined}
            rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full max-w-md mx-auto py-4 rounded-2xl text-white font-black text-base shadow-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 100%)` }}
          >
            {card.showWhatsapp && pro.whatsapp ? (
              <><MessageCircle size={20} /> Contacter sur WhatsApp</>
            ) : card.showPhone && pro.phone ? (
              <><Phone size={20} /> Appeler maintenant</>
            ) : card.showEmail && card.email ? (
              <><Mail size={20} /> Envoyer un e-mail</>
            ) : (
              <><Globe size={20} /> Visiter le site web</>
            )}
          </a>
        </div>
      )}
    </>
  )
}
