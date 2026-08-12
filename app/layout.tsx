import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { ListingsProvider } from '@/context/ListingsContext'
import { PageThemeProvider } from '@/context/PageThemeContext'
import ConditionalNavbar from '@/components/layout/ConditionalNavbar'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import ConditionalMain from '@/components/layout/ConditionalMain'
import { LocaleProvider, type SupportedLocale } from '@/components/providers/LocaleProvider'
import CookieBanner from '@/components/CookieBanner'
import ConsentScripts from '@/components/ConsentScripts'
import { getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-nunito',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://1000clic.fr'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: '1000Click — Petites annonces francophones en Belgique',
    template: '%s — 1000Click',
  },
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires en Belgique. La marketplace francophone des petites annonces.',
  openGraph: {
    type: 'website',
    siteName: '1000Click',
    title: '1000Click — Petites annonces francophones en Belgique',
    description: 'Achetez, vendez et donnez une seconde vie à vos affaires en Belgique.',
    locale: 'fr_BE',
    images: [{ url: '/brussels-hero.png', width: 1200, height: 630, alt: '1000Click' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '1000Click — Petites annonces francophones en Belgique',
    description: 'Achetez, vendez et donnez une seconde vie à vos affaires en Belgique.',
    images: ['/brussels-hero.png'],
  },
  robots: { index: true, follow: true },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body className={`${inter.className} ${nunito.variable}`}>
        <ConsentScripts />
        <LocaleProvider initialLocale={locale as SupportedLocale}>
          <a href="#main-content" className="skip-link">Aller au contenu principal</a>
          <SessionProvider>
            <AuthProvider>
              <ListingsProvider>
                <PageThemeProvider>
                  <ConditionalNavbar />
                  <ConditionalMain>{children}</ConditionalMain>
                  <ConditionalFooter />
                </PageThemeProvider>
              </ListingsProvider>
            </AuthProvider>
          </SessionProvider>
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  )
}
