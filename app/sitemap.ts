import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, pros, blogPosts] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5000,
    }),
    prisma.professional.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/annonces`,      lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/professionnels`,lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/connexion`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/inscription`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  return [
    ...staticPages,
    ...listings.map(l => ({
      url: `${BASE}/annonces/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...pros.map(p => ({
      url: `${BASE}/professionnels/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...blogPosts.map(b => ({
      url: `${BASE}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ]
}
