'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'vem_cookie_consent'
const CONSENT_EXPIRY_DAYS = 365

export default function CookieBanner() {
  const t = useTranslations('Cookies')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) { setVisible(true); return }
      const { at } = JSON.parse(raw) as { decision: string; at: number }
      const age = Date.now() - at
      if (age > CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const save = (decision: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ decision, at: Date.now() }))
    setVisible(false)
    // Reload to let ConsentScripts re-evaluate (accepted → loads ads)
    if (decision === 'accepted') window.location.reload()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
    >
      <div className="max-w-3xl mx-auto bg-navy text-white rounded-2xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Cookie emoji + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0" aria-hidden="true">🍪</span>
          <p className="text-sm text-white/80 leading-relaxed">
            {t('banner_text')}{' '}
            <Link href="/cookies" className="text-orange-primary hover:underline font-medium">
              {t('learn_more')}
            </Link>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => save('declined')}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-white/70 border border-white/20 rounded-xl hover:border-white/40 hover:text-white transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={() => save('accepted')}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold bg-orange-primary text-white rounded-xl hover:bg-orange-dark transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Hook to read current consent decision synchronously on client */
export function useCookieConsent(): 'accepted' | 'declined' | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { decision } = JSON.parse(raw) as { decision: string }
    return decision as 'accepted' | 'declined'
  } catch {
    return null
  }
}
