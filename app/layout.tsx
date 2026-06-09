import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { ListingsProvider } from '@/context/ListingsContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Vendo — Petites annonces entre expatriés en Espagne',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés en Espagne.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${nunito.variable}`}>
        <SessionProvider>
          <AuthProvider>
            <ListingsProvider>
              <Navbar />
              <main className="pt-16">{children}</main>
              <Footer />
            </ListingsProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
