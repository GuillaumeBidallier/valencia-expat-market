import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, ArrowLeft, CheckCircle, Star, Building2, ExternalLink, Pencil } from 'lucide-react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { proCategories } from '@/lib/proCategories'
import ProGallery from './ProGallery'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({
    where: { slug },
    select: { name: true, description: true, city: true, logo: true, banner: true, category: true },
  })
  if (!pro) return { title: 'Professionnel introuvable' }
  const catLabel = proCategories.find(c => c.slug === pro.category)?.label ?? pro.category
  const description = pro.description
    ? pro.description.slice(0, 155).replace(/\n/g, ' ')
    : `${pro.name} — ${catLabel} à ${pro.city}. Retrouvez ce professionnel sur Vendo Valencia.`
  const image = pro.banner ?? pro.logo
  return {
    title: `${pro.name} — ${catLabel} à ${pro.city}`,
    description,
    openGraph: {
      title: `${pro.name} — ${catLabel} à ${pro.city}`,
      description,
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: pro.name }] }),
    },
  }
}

export default async function ProDetailPage({ params }: Props) {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({ where: { slug } })
  if (!pro) notFound()

  const session = await auth()
  const isOwner = session?.user?.id && pro.userId === session.user.id

  const cat = proCategories.find(c => c.slug === pro.category)
  const catLabel = cat?.label ?? pro.category
  const catIcon = cat?.icon ?? '💼'
  const isPremiumPlus = pro.tier === 'PREMIUM_PLUS'
  const isPremium = pro.tier === 'PREMIUM' || isPremiumPlus

  const heroGradient = isPremiumPlus
    ? 'from-orange-600 to-orange-400'
    : isPremium
    ? 'from-indigo-700 to-indigo-500'
    : 'from-navy to-slate-600'

  const waLink = pro.whatsapp
    ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${pro.name}, j'ai trouvé votre profil sur Vendo Valencia et j'aimerais vous contacter.`)}`
    : null

  const coverSrc = pro.banner ?? pro.logo

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero banner ── */}
      <div className={`relative w-full h-44 sm:h-60 bg-gradient-to-br ${heroGradient} overflow-hidden`}>
        {coverSrc && (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Back */}
        <div className="absolute top-4 left-4 sm:left-6">
          <Link
            href="/professionnels"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft size={13} /> Retour
          </Link>
        </div>

        {/* Edit button for owner */}
        {isOwner && (
          <div className="absolute top-4 right-4 sm:right-6">
            <Link
              href="/mon-compte/profil-pro"
              className="inline-flex items-center gap-1.5 text-white text-sm bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
            >
              <Pencil size={13} /> Modifier ma vitrine
            </Link>
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-4 left-4 sm:left-6">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            <span aria-hidden="true">{catIcon}</span> {catLabel}
          </span>
        </div>
      </div>

      {/* ── Identity band (white strip, avatar overlaps hero) ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-4 sm:gap-5 -mt-12 pb-5">
            {/* Avatar */}
            <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br ${heroGradient} flex items-center justify-center`}>
              {pro.logo ? (
                <Image
                  src={pro.logo}
                  alt={pro.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl" aria-hidden="true">{catIcon}</span>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg sm:text-2xl font-black text-navy leading-tight">{pro.name}</h1>
                {isPremiumPlus && (
                  <span className="inline-flex items-center gap-1 bg-orange-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <Star size={10} fill="currentColor" /> Recommandé
                  </span>
                )}
                {isPremium && !isPremiumPlus && (
                  <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <Star size={10} fill="currentColor" /> Premium
                  </span>
                )}
                {pro.verified && (
                  <span className="inline-flex items-center gap-1 text-blue-600 text-[11px] font-semibold border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Vérifié
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin size={12} className="shrink-0 text-orange-primary" aria-hidden="true" />
                <span>{pro.city}</span>
                {pro.zones.length > 0 && <>
                  <span className="text-gray-300 mx-0.5">·</span>
                  {pro.zones.slice(0, 2).map(z => (
                    <span key={z} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{z}</span>
                  ))}
                  {pro.zones.length > 2 && (
                    <span className="text-xs text-gray-400">+{pro.zones.length - 2}</span>
                  )}
                </>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left – content */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {pro.description && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-navy mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-orange-primary" aria-hidden="true" />
                  À propos
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{pro.description}</p>
              </section>
            )}

            {pro.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-navy mb-4">Photos</h2>
                <ProGallery photos={pro.photos} name={pro.name} />
              </section>
            )}

            {pro.zones.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-navy mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-primary" aria-hidden="true" />
                  Zones d'intervention
                </h2>
                <div className="flex flex-wrap gap-2">
                  {pro.zones.map(z => (
                    <span key={z} className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                      <MapPin size={11} className="text-orange-primary" aria-hidden="true" /> {z}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Mobile contact (small screens) */}
            <div className="lg:hidden">
              <ContactCard pro={pro} isPremium={isPremium} waLink={waLink} />
            </div>
          </div>

          {/* Right – sticky sidebar */}
          <aside className="hidden lg:block self-start sticky top-20">
            <ContactCard pro={pro} isPremium={isPremium} waLink={waLink} />
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ── Contact sidebar card ── */
type ContactCardProps = {
  pro: {
    name: string
    phone: string | null
    whatsapp: string | null
    website: string | null
    verified: boolean
  }
  isPremium: boolean
  waLink: string | null
}

function ContactCard({ pro, isPremium, waLink }: ContactCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <h2 className="font-bold text-navy text-base">Contacter</h2>

      {pro.phone && (
        <a
          href={`tel:${pro.phone}`}
          className="flex items-center justify-center gap-2.5 bg-navy text-white px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors"
        >
          <Phone size={16} aria-hidden="true" /> {pro.phone}
        </a>
      )}

      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-[#1ebe5d] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
      )}

      {isPremium && pro.website && (
        <a
          href={pro.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 border-2 border-indigo-200 text-indigo-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
        >
          <Globe size={16} aria-hidden="true" />
          Voir le site web
          <ExternalLink size={13} className="ml-auto opacity-50" aria-hidden="true" />
        </a>
      )}

      {pro.verified && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100">
          <CheckCircle size={14} aria-hidden="true" />
          Professionnel vérifié par Vendo
        </div>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed pt-1">
        Mentionnez Vendo lors de votre prise de contact.
      </p>
    </div>
  )
}
