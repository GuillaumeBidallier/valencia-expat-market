'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  label: string
  active?: boolean
  badge?: number
  align?: 'left' | 'right'
  panelClassName?: string
  children: ReactNode
}

export default function FilterDropdown({ label, active, badge, align = 'left', panelClassName, children }: Props) {
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
          active || (badge ?? 0) > 0
            ? 'border-orange-primary bg-orange-soft text-orange-primary'
            : 'border-gray-200 bg-white text-navy hover:border-orange-primary/40'
        }`}
      >
        {label}
        {(badge ?? 0) > 0 && (
          <span className="w-4 h-4 bg-orange-primary text-white rounded-full text-[10px] flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
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
