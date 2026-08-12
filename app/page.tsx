import type { Metadata } from 'next'
import { preload } from 'react-dom'
import LandingHome from '@/components/home/LandingHome'

export const metadata: Metadata = {
  title: '1000Click — Petites annonces francophones en Belgique',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires en Belgique. La marketplace francophone des petites annonces.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  preload('/landing-test/hero-vehicules-immobilier.png', { as: 'image', fetchPriority: 'high' })

  return <LandingHome />
}
