import { prisma } from '@/lib/prisma'

const FALLBACK = process.env.ADMIN_EMAIL ?? 'contact@1000clic.fr'

/**
 * Returns the platform contact email from SiteSettings.
 * Falls back to ADMIN_EMAIL env var, then to the hardcoded default.
 * Safe to call from server components, API routes and server actions.
 */
export async function getContactEmail(): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: { contactEmail: true },
    })
    return settings?.contactEmail?.trim() || FALLBACK
  } catch {
    return FALLBACK
  }
}
