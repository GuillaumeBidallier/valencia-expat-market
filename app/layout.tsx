export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { ListingsProvider } from '@/context/ListingsContext'
import Navbar from '@/components/layout/Navbar'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import { LocaleProvider, type SupportedLocale } from '@/components/providers/LocaleProvider'
import { getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-nunito',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Vendo — Petites annonces entre expatriés en Espagne',
    template: '%s — Vendo',
  },
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés en Espagne. La marketplace des expatriés francophones.',
  openGraph: {
    type: 'website',
    siteName: 'Vendo — Valencia Expat Market',
    title: 'Vendo — Petites annonces entre expatriés en Espagne',
    description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés en Espagne.',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vendo — Petites annonces entre expatriés en Espagne',
    description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés en Espagne.',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body className={`${inter.className} ${nunito.variable}`}>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <LocaleProvider initialLocale={locale as SupportedLocale}>
          <SessionProvider>
            <AuthProvider>
              <ListingsProvider>
                <Navbar />
                <main className="pt-16">{children}</main>
                <ConditionalFooter />
              </ListingsProvider>
            </AuthProvider>
          </SessionProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
