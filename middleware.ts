import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/connexion' || pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && (pathname === '/deposer-annonce' || pathname === '/mon-compte' || pathname.startsWith('/messages'))) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }
})

export const config = {
  matcher: ['/connexion', '/inscription', '/deposer-annonce', '/mon-compte', '/messages/:path*'],
}
