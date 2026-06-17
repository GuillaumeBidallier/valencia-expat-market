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
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (consent !== 'accepted') return null

  return (
    <>
      {adsenseId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {gaId && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  )
}
