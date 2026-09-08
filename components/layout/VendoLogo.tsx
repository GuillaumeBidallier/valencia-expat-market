import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 'light' = fond sombre → logo à contour blanc
   *  'dark'  = fond clair  → logo noir (défaut) */
  theme?: 'light' | 'dark'
}

// Tailles augmentées pour être bien visible en navbar et footer.
// Les fichiers logo sont recadrés au plus près : ces hauteurs correspondent
// au visuel rendu, pas à une image avec marge transparente.
const HEIGHTS: Record<string, number> = { sm: 23, md: 35, lg: 50, xl: 70 }

export default function VendoLogo({ size = 'md', theme = 'dark' }: LogoProps) {
  const h = HEIGHTS[size]
  const w = Math.round(h * 1.925) // ratio natif des PNG (1740 × 904)

  // version contour blanc pour fond sombre, version noire pour fond clair
  const src = theme === 'light' ? '/logo-1000click-white.png' : '/logo-1000click.png'

  return (
    <Image
      src={src}
      alt="1000Click"
      width={w}
      height={h}
      priority
      style={{ height: h, width: 'auto', objectFit: 'contain', userSelect: 'none' }}
    />
  )
}
