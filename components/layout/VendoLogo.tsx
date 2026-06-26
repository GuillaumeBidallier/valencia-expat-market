import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
}

const HEIGHTS: Record<string, number> = { sm: 28, md: 40, lg: 60, xl: 88 }

export default function VendoLogo({ size = 'md' }: LogoProps) {
  const h = HEIGHTS[size]
  // aspect ratio of the logo is approximately 1.55 : 1 (width : height)
  const w = Math.round(h * 1.55)

  return (
    <Image
      src="/logo-1000click.png"
      alt="1000Click"
      width={w}
      height={h}
      priority
      style={{ height: h, width: 'auto', objectFit: 'contain', userSelect: 'none' }}
    />
  )
}
