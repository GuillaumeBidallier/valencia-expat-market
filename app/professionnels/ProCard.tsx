import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Globe, MessageCircle } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'
import type { Professional } from '@prisma/client'

export default function ProCard({ pro }: { pro: Professional }) {
  const catLabel = proCategories.find(c => c.slug === pro.category)?.label ?? pro.category
  const isPremiumPlus = pro.tier === 'PREMIUM_PLUS'
  const isPremium = pro.tier === 'PREMIUM' || isPremiumPlus

  return (
    <Link
      href={`/professionnels/${pro.slug}`}
      className={`group bg-white rounded-xl border transition-all hover:shadow-md flex flex-col ${
        isPremiumPlus ? 'border-orange-primary/40 shadow-sm' : 'border-gray-200'
      }`}
    >
      {/* Logo / image */}
      <div className="relative h-36 rounded-t-xl overflow-hidden bg-gray-100">
        {pro.logo ? (
          <Image src={pro.logo} alt={pro.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
            {proCategories.find(c => c.slug === pro.category)?.icon ?? '💼'}
          </div>
        )}
        {isPremiumPlus && (
          <span className="absolute top-2 right-2 bg-orange-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⭐ Recommandé
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-navy text-sm leading-snug group-hover:text-orange-primary transition-colors line-clamp-2">
            {pro.name}
          </h3>
          {pro.verified && (
            <span className="shrink-0 text-blue-500 text-xs font-semibold border border-blue-200 px-1.5 py-0.5 rounded">✓</span>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-3">{catLabel}</p>

        {isPremium && pro.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{pro.description}</p>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin size={11} className="shrink-0" />
          <span>{pro.city}</span>
        </div>

        {isPremium && (
          <div className="flex gap-2 mt-auto">
            {pro.phone && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                <Phone size={10} /> Tél
              </span>
            )}
            {pro.whatsapp && (
              <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <MessageCircle size={10} /> WhatsApp
              </span>
            )}
            {pro.website && (
              <span className="flex items-center gap-1 text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                <Globe size={10} /> Site
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
