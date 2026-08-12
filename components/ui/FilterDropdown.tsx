'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  icon?: LucideIcon
  active?: boolean
  badge?: number
  align?: 'left' | 'right'
  panelClassName?: string
  dark?: boolean
  children: ReactNode
}

export default function FilterDropdown({ label, icon: Icon, active, badge, align = 'left', panelClassName, dark, children }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-full border transition-colors whitespace-nowrap ${
          dark
            ? active || (badge ?? 0) > 0
              ? 'border-red-600 bg-red-600/15 text-white'
              : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/30'
            : active || (badge ?? 0) > 0
              ? 'border-orange-primary bg-orange-soft text-orange-primary'
              : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40'
        }`}
      >
        {Icon && <Icon size={13} className={dark ? 'text-white/60' : 'text-gray-400'} />}
        {label}
        {(badge ?? 0) > 0 && (
          <span className={`w-4 h-4 text-white rounded-full text-[10px] flex items-center justify-center font-bold ${dark ? 'bg-red-600' : 'bg-orange-primary'}`}>
            {badge}
          </span>
        )}
        <ChevronDown size={13} className={`transition-transform ${dark ? 'text-white/50' : ''} ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 z-30 bg-white border border-gray-100 rounded-xl shadow-xl p-4 max-w-[92vw] overflow-y-auto max-h-[75vh] ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName ?? 'w-72'}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
