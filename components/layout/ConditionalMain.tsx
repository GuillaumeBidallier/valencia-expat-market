'use client'
import { usePathname } from 'next/navigation'

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noPublicChrome = pathname.startsWith('/admin')

  return (
    <main id="main-content" className={noPublicChrome ? '' : 'pt-[104px]'}>
      {children}
    </main>
  )
}
