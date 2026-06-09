import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-nunito',
})
import { AuthProvider } from '@/context/AuthContext'
import { ListingsProvider } from '@/context/ListingsContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Valencia Expat Market — Petites annonces entre expatriés',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés à Valencia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${nunito.variable}`}>
        <AuthProvider>
          <ListingsProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </ListingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
