import { headers } from 'next/headers'
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
