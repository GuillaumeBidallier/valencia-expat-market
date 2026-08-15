'use client'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function ProBadge({ logo, dark, className }: { logo?: string | null; dark?: boolean; className?: string }) {
  const t = useTranslations('Listings')
  return (
    <div
      className={`absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow ${
        dark ? 'bg-black/60 border border-white/20 text-white' : 'bg-white/95 text-navy'
      } ${className ?? ''}`}
    >
      {logo && (
        <span className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 bg-white">
          <Image src={logo} alt="" fill className="object-cover" />
        </span>
      )}
      {t('pro_badge')}
    </div>
  )
}
