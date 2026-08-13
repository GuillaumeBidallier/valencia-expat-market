import { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.1000click.com').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/mon-compte/', '/messages/', '/deposer-annonce'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
