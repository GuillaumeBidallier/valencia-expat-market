/**
 * Shared hero-carousel definitions. No server-only dependencies here — this
 * module is imported by both the homepage (client) and the settings route
 * (server). The DB read lives in `lib/hero-slides.server.ts`.
 */

export interface HeroSlide {
  src: string
  alt: string
}

/** Shown when no hero image has been configured in /admin/parametres. */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { src: '/landing-test/hero-vehicules-immobilier.png', alt: 'Véhicules et biens immobiliers' },
]

/** Cache tag shared with the admin settings route, which invalidates it on save. */
export const SITE_SETTINGS_TAG = 'site-settings'

/**
 * Hosts next/image is allowed to optimise — must mirror `images.remotePatterns`
 * in next.config.ts. The admin settings page lets an admin paste an arbitrary
 * URL, and next/image throws on an unconfigured host; since this renders in the
 * homepage's server component, an unusable URL would 500 the whole page rather
 * than just show a broken image. Slides that fail this check are dropped.
 */
function isRenderableSrc(src: string): boolean {
  if (src.startsWith('/')) return true
  let host: string
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:') return false
    host = url.hostname
  } catch {
    return false
  }
  return host === 'images.unsplash.com' || host === 'picsum.photos' || host.endsWith('.vercel-storage.com')
}

export function isHeroSlide(value: unknown): value is HeroSlide {
  if (typeof value !== 'object' || value === null) return false
  const { src, alt } = value as Record<string, unknown>
  if (typeof src !== 'string' || typeof alt !== 'string') return false
  const trimmed = src.trim()
  return trimmed.length > 0 && isRenderableSrc(trimmed)
}
