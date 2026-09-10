import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isHeroSlide, SITE_SETTINGS_TAG, type HeroSlide } from '@/lib/hero-slides'

const fetchHeroSlides = unstable_cache(
  async (): Promise<HeroSlide[]> => {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { heroImages: true },
    })
    const stored = settings?.heroImages
    if (!Array.isArray(stored)) return []
    // Prisma types the column as JsonValue[]; isHeroSlide does the real vetting.
    return (stored as unknown[])
      .filter(isHeroSlide)
      .map(s => ({ src: s.src.trim(), alt: s.alt }))
  },
  ['hero-slides'],
  { revalidate: 60, tags: [SITE_SETTINGS_TAG] }
)

/**
 * Hero carousel images configured in /admin/parametres.
 * Returns an empty array when none are set (callers fall back to
 * DEFAULT_HERO_SLIDES) or when the DB is unreachable — the homepage must still
 * render. Server components / route handlers only.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    return await fetchHeroSlides()
  } catch {
    return []
  }
}
