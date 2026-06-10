import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, MessageCircle, Globe } from 'lucide-react'
import type { Professional } from '@prisma/client'
import { proCategories } from '@/lib/proCategories'

type ProWithReco = Professional & { recommended?: boolean }

export default function ProsBanner({ pros }: { pros: ProWithReco[] }) {
  if (pros.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-navy">⭐ Professionnels francophones recommandés</h2>
          <p className="text-sm text-gray-400 mt-0.5">Avocats, comptables, agences immobilières, déménageurs… partout en Espagne</p>
        </div>
        <Link href="/professionnels" className="text-orange-primary text-sm font-bold hover:underline shrink-0 ml-4">
          Voir tous →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pros.map(pro => {
          const cat = proCategories.find(c => c.slug === pro.category)
          const isReco = pro.recommended
          const isPlus = pro.tier === 'PREMIUM_PLUS'

          return (
            <Link
              key={pro.id}
              href={`/professionnels/${pro.slug}`}
              className={`group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden ${
                isPlus ? 'border-orange-primary/40' : 'border-indigo-200/60'
              }`}
            >
              {/* Visuel */}
              <div className="relative h-28 bg-gray-100 overflow-hidden rounded-t-xl">
                {pro.logo ? (
                  <Image src={pro.logo} alt={pro.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-4xl ${
                    isPlus ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-gradient-to-br from-indigo-50 to-indigo-100'
                  }`}>
                    {cat?.icon ?? '💼'}
                  </div>
                )}

                {/* Badge */}
                {isReco ? (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    ✓ Recommandé
                  </span>
                ) : isPlus ? (
                  <span className="absolute top-2 right-2 bg-orange-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⭐ Premium+
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⭐ Premium
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-navy text-sm mb-0.5 group-hover:text-orange-primary transition-colors line-clamp-1">
                  {pro.name}
                </h3>
                <p className="text-xs text-gray-400 mb-1">{cat?.label ?? pro.category}</p>
                {pro.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 leading-relaxed">{pro.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={10} /> {pro.city}
                  </span>
                  <div className="flex gap-1.5">
                    {pro.phone    && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"><Phone size={8} className="inline" /></span>}
                    {pro.whatsapp && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded"><MessageCircle size={8} className="inline" /></span>}
                    {pro.website  && <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded"><Globe size={8} className="inline" /></span>}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
