'use client'
import { usePathname } from 'next/navigation'

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noPublicChrome = pathname.startsWith('/admin') || pathname.startsWith('/manuel')

  // Clears the fixed navbar: 64px row on mobile, plus the 40px category bar from md up.
  return (
    <main id="main-content" className={noPublicChrome ? '' : 'pt-[calc(64px+var(--announcement-h))] md:pt-[calc(104px+var(--announcement-h))]'}>
      {children}
    </main>
  )
}
