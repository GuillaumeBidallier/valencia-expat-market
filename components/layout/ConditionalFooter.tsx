'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import type { SocialLinks } from '@/lib/social-links'

export default function ConditionalFooter({ socialLinks }: { socialLinks: SocialLinks }) {
  const pathname = usePathname()
  if (pathname.startsWith('/messages')) return null
  if (pathname.startsWith('/carte/')) return null
  if (pathname.startsWith('/admin')) return null
  if (pathname.startsWith('/manuel')) return null
  return <Footer socialLinks={socialLinks} />
}
