import type { Metadata } from 'next'
import './globals.css'
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
      <body>
        <AuthProvider>
          <ListingsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ListingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
