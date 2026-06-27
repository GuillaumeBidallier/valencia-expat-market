'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/messages')) return null
  if (pathname.startsWith('/carte/')) return null
  return <Footer />
}
