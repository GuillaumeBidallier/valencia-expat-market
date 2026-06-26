import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 'light' = fond sombre → logo outline blanc
   *  'dark'  = fond clair  → logo navy (défaut) */
  theme?: 'light' | 'dark'
}

// Tailles augmentées pour être bien visible en navbar et footer
const HEIGHTS: Record<string, number> = { sm: 36, md: 56, lg: 80, xl: 112 }

export default function VendoLogo({ size = 'md', theme = 'dark' }: LogoProps) {
  const h = HEIGHTS[size]
  const w = Math.round(h * 1.55)

  // logo blanc pour fond sombre, logo navy pour fond clair
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
