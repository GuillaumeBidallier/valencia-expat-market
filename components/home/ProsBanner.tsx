import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, MessageCircle, Globe } from 'lucide-react'
import type { Professional } from '@prisma/client'
import { proCategories } from '@/lib/proCategories'

export default function ProsBanner({ pros }: { pros: Professional[] }) {
  if (pros.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-navy">
          ⭐ Professionnels recommandés
        </h2>
        <Link href="/professionnels" className="text-orange-primary text-sm font-bold hover:underline">
          Voir tous →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pros.map(pro => {
          const catLabel = proCategories.find(c => c.slug === pro.category)?.label ?? pro.category
          return (
            <Link
              key={pro.id}
              href={`/professionnels/${pro.slug}`}
              className="group bg-white rounded-xl border border-orange-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-32 rounded-t-xl overflow-hidden bg-gray-100">
                {pro.logo ? (
                  <Image src={pro.logo} alt={pro.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-orange-100">
                    {proCategories.find(c => c.slug === pro.category)?.icon ?? '💼'}
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-orange-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ⭐ Recommandé
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-navy text-sm mb-0.5 group-hover:text-orange-primary transition-colors line-clamp-1">
                  {pro.name}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{catLabel}</p>
                {pro.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{pro.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <MapPin size={11} className="shrink-0" />
                  <span>{pro.city}</span>
                </div>
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
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
