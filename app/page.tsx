import type { Metadata } from 'next'
import { preload } from 'react-dom'
import LandingHome from '@/components/home/LandingHome'
import { DEFAULT_HERO_SLIDES } from '@/lib/hero-slides'
import { getHeroSlides } from '@/lib/site-settings.server'

export const metadata: Metadata = {
  title: '1000Click — Petites annonces francophones en Belgique',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires en Belgique. La marketplace francophone des petites annonces.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const heroSlides = await getHeroSlides()
  const first = (heroSlides[0] ?? DEFAULT_HERO_SLIDES[0]).src

  preload(first, { as: 'image', fetchPriority: 'high' })

  return <LandingHome heroSlides={heroSlides} />
}
