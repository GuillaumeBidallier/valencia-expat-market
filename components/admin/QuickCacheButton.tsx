'use client'
import { useState } from 'react'
import { Trash2, Check, Loader2 } from 'lucide-react'

export default function QuickCacheButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const clear = async () => {
    setState('loading')
    try {
      await fetch('/api/admin/cache/clear', { method: 'POST' })
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      type="button"
      onClick={clear}
      disabled={state === 'loading'}
      className="flex items-center justify-between w-full px-5 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      <span className="flex items-center gap-2.5 text-navy font-medium">
        <Trash2 size={15} className="text-gray-400" /> Vider le cache
      </span>
      {state === 'loading' && <Loader2 size={14} className="animate-spin text-gray-400" />}
      {state === 'done' && <Check size={14} className="text-emerald-500" />}
    </button>
  )
}
