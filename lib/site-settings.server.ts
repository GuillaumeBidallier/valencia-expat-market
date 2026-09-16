import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isHeroSlide, SITE_SETTINGS_TAG, type HeroSlide } from '@/lib/hero-slides'

export interface Announcement {
  text: string
}

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

const fetchAnnouncement = unstable_cache(
  async (): Promise<Announcement | null> => {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { announcementText: true, announcementEnabled: true },
    })
    if (!settings?.announcementEnabled) return null
    const text = settings.announcementText?.trim()
    return text ? { text } : null
  },
  ['announcement'],
  { revalidate: 60, tags: [SITE_SETTINGS_TAG] }
)

/**
 * The announcement banner configured in /admin/parametres, or null when it is
 * disabled, empty or unreadable — the banner is decoration, never a reason to
 * fail a page render. Server components / route handlers only.
 */
export async function getAnnouncement(): Promise<Announcement | null> {
  try {
    return await fetchAnnouncement()
  } catch {
    return null
  }
}
