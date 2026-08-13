import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})

const MAINTENANCE_CACHE_TTL_MS = 15_000
let maintenanceCache: { value: boolean; expiresAt: number } | null = null

async function isMaintenanceModeOn(): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache && now < maintenanceCache.expiresAt) return maintenanceCache.value
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' }, select: { maintenanceMode: true } })
    const value = settings?.maintenanceMode ?? false
    maintenanceCache = { value, expiresAt: now + MAINTENANCE_CACHE_TTL_MS }
    return value
  } catch (err) {
    console.error('[middleware] failed to read maintenanceMode, failing open:', err)
    return maintenanceCache?.value ?? false
  }
}

const DEFAULT_DOMAIN = '1000click.com'
const SITE_CACHE_TTL_MS = 60_000
let siteCache: { domains: Map<string, string>; expiresAt: number } | null = null

async function resolveSiteId(hostname: string): Promise<string | null> {
  const now = Date.now()
  if (!siteCache || now > siteCache.expiresAt) {
    try {
      const sites = await prisma.site.findMany({ where: { active: true }, select: { id: true, domain: true } })
      siteCache = { domains: new Map(sites.map(s => [s.domain, s.id])), expiresAt: now + SITE_CACHE_TTL_MS }
    } catch (err) {
      console.error('[middleware] failed to refresh site cache:', err)
      if (!siteCache) return null
    }
  }
  const bareHost = hostname.replace(/^www\./, '')
  return siteCache!.domains.get(hostname)
    ?? siteCache!.domains.get(bareHost)
    ?? siteCache!.domains.get(DEFAULT_DOMAIN)
    ?? siteCache!.domains.values().next().value
    ?? null
}

export default auth(async (req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  const hostname = req.headers.get('host')?.split(':')[0] ?? DEFAULT_DOMAIN
  const siteId = await resolveSiteId(hostname)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.delete('x-site-id')
  if (siteId) requestHeaders.set('x-site-id', siteId)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (await isMaintenanceModeOn()) {
    const isAdminOrAuthRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname === '/connexion' || pathname.startsWith('/api/auth')
    if (!isAdminOrAuthRoute) {
      return new NextResponse('Site en maintenance — de retour très bientôt.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '120' },
      })
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/connexion' || pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && (pathname === '/deposer-annonce' || pathname === '/mon-compte' || pathname.startsWith('/messages'))) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }

  return response
})

export const config = {
  // This file uses the deprecated `middleware.ts` convention (not `proxy.ts`), which still
  // defaults to the Edge runtime in Next.js 16 — only `proxy.ts` defaults to Node.js. Prisma
  // cannot run on the Edge runtime, so the maintenance-mode DB check must opt in explicitly.
  // See node_modules/next/dist/build/entries.js `runDependingOnPageType`: for legacy
  // middleware files it only calls onServer() (Node.js) when pageRuntime === 'nodejs' is
  // explicitly set here; otherwise it silently falls back to onEdgeServer().
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
}
