import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, MessageCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { proCategories } from '@/lib/proCategories'

type Props = { params: Promise<{ slug: string }> }

export default async function ProDetailPage({ params }: Props) {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({ where: { slug } })
  if (!pro) notFound()

  const catLabel = proCategories.find(c => c.slug === pro.category)?.label ?? pro.category
  const isPremiumPlus = pro.tier === 'PREMIUM_PLUS'
  const isPremium = pro.tier === 'PREMIUM' || isPremiumPlus

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/professionnels" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
          <ArrowLeft size={14} /> Retour aux professionnels
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Hero photo */}
          {pro.logo && (
            <div className="relative h-48 sm:h-64 bg-gray-100">
              <Image src={pro.logo} alt={pro.name} fill className="object-cover" unoptimized />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {isPremiumPlus && (
                <span className="bg-orange-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Recommandé
                </span>
              )}
              {isPremium && !isPremiumPlus && (
                <span className="bg-indigo-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Premium
                </span>
              )}
              {pro.verified && (
                <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold border border-blue-200 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} /> Vérifié
                </span>
              )}
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{catLabel}</span>
            </div>

            <h1 className="text-2xl font-black text-navy mb-1">{pro.name}</h1>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
              <MapPin size={13} />
              <span>{pro.city}</span>
            </div>

            {pro.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{pro.description}</p>
            )}

            {/* Galerie photos */}
            {pro.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {pro.photos.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image src={url} alt={`${pro.name} photo ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}

            {/* Contact */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
              {pro.phone && (
                <a
                  href={`tel:${pro.phone}`}
                  className="flex items-center justify-center gap-2 border-2 border-navy text-navy px-5 py-3 rounded-xl font-bold text-sm hover:bg-navy hover:text-white transition-colors"
                >
                  <Phone size={16} /> {pro.phone}
                </a>
              )}
              {pro.whatsapp && (
                <a
                  href={`https://wa.me/${pro.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              )}
              {pro.website && (
                <a
                  href={pro.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                >
                  <Globe size={16} /> Voir le site
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
