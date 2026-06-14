'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { MapPin, Phone, Globe, MessageCircle, CheckCircle } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'
import type { Professional } from '@prisma/client'

export default function ProCard({ pro }: { pro: Professional }) {
  const t = useTranslations('Pros')

  const catIcon  = proCategories.find(c => c.slug === pro.category)?.icon ?? '💼'
  const catLabel = t(`cat_${pro.category}` as Parameters<typeof t>[0]) ?? pro.category
  const isPlus    = pro.tier === 'PREMIUM_PLUS'
  const isPremium = pro.tier === 'PREMIUM' || isPlus
  const isReco    = (pro as Professional & { recommended?: boolean }).recommended

  return (
    <Link
      href={`/professionnels/${pro.slug}`}
      className={`group bg-white rounded-xl border transition-all hover:shadow-md flex flex-col overflow-hidden ${
        isPlus    ? 'border-orange-primary/50 shadow-sm ring-1 ring-orange-primary/10' :
        isPremium ? 'border-indigo-200 shadow-sm' :
                    'border-gray-200'
      }`}
    >
      {/* Visuel */}
      <div className="relative h-32 bg-gray-100 overflow-hidden rounded-t-xl">
        {isPremium && pro.logo ? (
          <Image src={pro.logo} alt={pro.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 320px" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-4xl ${
            isPlus ? 'bg-gradient-to-br from-orange-50 to-orange-100' :
            isPremium ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' :
            'bg-gray-100'
          }`}>
            {catIcon}
          </div>
        )}

        {isPlus && (
          <span className="absolute top-2 right-2 bg-orange-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            ⭐ Premium+
          </span>
        )}
        {isPremium && !isPlus && (
          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⭐ Premium
          </span>
        )}
        {isReco && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ {t('recommended_badge')}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors ${
            isPlus ? 'text-navy group-hover:text-orange-primary' :
            isPremium ? 'text-navy group-hover:text-indigo-600' :
            'text-navy group-hover:text-orange-primary'
          }`}>
            {pro.name}
          </h3>
          {pro.verified && (
            <CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
          )}
        </div>

        <p className="text-xs text-gray-400 mb-2">{catLabel}</p>

        {isPremium && pro.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 leading-relaxed">{pro.description}</p>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto mb-2">
          <MapPin size={10} className="shrink-0" />
          <span>{pro.city}</span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {pro.phone && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
              <Phone size={9} /> {t('tel')}
            </span>
          )}
          {isPremium && pro.whatsapp && (
            <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-lg">
              <MessageCircle size={9} /> WhatsApp
            </span>
          )}
          {isPremium && pro.website && (
            <span className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
              <Globe size={9} /> {t('site')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
