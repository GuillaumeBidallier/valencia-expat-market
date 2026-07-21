import { headers, cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface CurrentSite {
  id: string
  domain: string
  name: string
  country: string
  primaryColor: string
  secondaryColor: string
}

const fetchSiteById = unstable_cache(
  async (siteId: string): Promise<CurrentSite | null> => {
    return prisma.site.findUnique({
      where: { id: siteId },
      select: {
        id: true, domain: true, name: true, country: true,
        primaryColor: true, secondaryColor: true,
      },
    })
  },
  ['site-by-id'],
  { revalidate: 60, tags: ['sites'] }
)

/** Server components / route handlers only — never import from a client component. */
export async function getCurrentSiteId(): Promise<string> {
  const headerStore = await headers()
  const siteId = headerStore.get('x-site-id')
  if (!siteId) throw new Error('x-site-id header missing — is this request going through middleware.ts?')
  return siteId
}

/** Server components / route handlers only — never import from a client component. */
export async function getCurrentSite(): Promise<CurrentSite> {
  const siteId = await getCurrentSiteId()
  const site = await fetchSiteById(siteId)
  if (!site) throw new Error(`Site introuvable pour id=${siteId}`)
  return site
}

const ADMIN_SITE_COOKIE = 'vem_admin_site'

/**
 * Admin-only site resolution: reads the admin's selected site from a cookie
 * (set via the site selector in the admin header), falling back to the
 * domain-resolved site if the admin hasn't picked one yet (e.g. first visit).
 * Server components / route handlers only — never import from a client component.
 */
export async function getAdminSiteId(): Promise<string> {
  const cookieStore = await cookies()
  const selected = cookieStore.get(ADMIN_SITE_COOKIE)?.value
  if (selected) return selected
  return getCurrentSiteId()
}

/** Server components / route handlers only — never import from a client component. */
export async function listActiveSites(): Promise<{ id: string; domain: string; name: string; country: string }[]> {
  return prisma.site.findMany({
    where: { active: true },
    select: { id: true, domain: true, name: true, country: true },
    orderBy: { name: 'asc' },
  })
}
