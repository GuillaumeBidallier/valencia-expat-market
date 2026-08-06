'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { proCategories } from '@/lib/proCategories'

interface VipPro {
  id: string
  name: string
  category: string
  city: string
  description: string | null
  logo: string | null
  banner: string | null
  slug: string
}

function trackClick(id: string) {
  fetch(`/api/ads/click?id=${id}`, { method: 'POST' }).catch(() => {})
}

/** Dedicated grand-format banner reserved for VIP professionals — shown once, near the top of the homepage. */
export default function VipBanner() {
  const [pro, setPro] = useState<VipPro | null>(null)

  useEffect(() => {
    fetch('/api/ads?count=1&tierFilter=VIP')
      .then(r => r.json())
      .then((data: VipPro[]) => { if (data.length > 0) setPro(data[0]) })
      .catch(() => {})
  }, [])

  if (!pro) return null

  const icon = proCategories.find(c => c.slug === pro.category)?.icon ?? '💼'

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <Link
        href={`/professionnels/${pro.slug}`}
        onClick={() => trackClick(pro.id)}
        className="group relative flex items-center gap-6 overflow-hidden rounded-2xl bg-navy px-6 py-8 sm:px-10 sm:py-10 min-h-[160px]"
      >
        {pro.banner && (
          <Image src={pro.banner} alt="" fill sizes="100vw" className="object-cover opacity-25 group-hover:opacity-30 transition-opacity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />

        <div className="relative z-10 flex items-center gap-5 flex-1 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {pro.logo
              ? <Image src={pro.logo} alt={pro.name} fill sizes="80px" className="object-cover" />
              : <span className="text-3xl">{icon}</span>
            }
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 bg-orange-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
              👑 VIP
            </span>
            <h3 className="text-white font-black text-lg sm:text-xl leading-tight truncate">{pro.name}</h3>
            {pro.description && (
              <p className="text-white/60 text-sm mt-0.5 line-clamp-1 max-w-xl">{pro.description}</p>
            )}
          </div>
        </div>

        <span className="relative z-10 shrink-0 hidden sm:flex items-center gap-1.5 bg-white text-navy text-sm font-bold px-4 py-2.5 rounded-xl group-hover:bg-orange-primary group-hover:text-white transition-colors">
          Voir le profil <ArrowRight size={15} />
        </span>
      </Link>
    </section>
  )
}
