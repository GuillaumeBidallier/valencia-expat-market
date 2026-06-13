'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useCookieConsent } from './CookieBanner'

export default function ConsentScripts() {
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    setConsent(useCookieConsent())
  }, [])

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!adsenseId || consent !== 'accepted') return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
