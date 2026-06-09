import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }
})

export const config = {
  matcher: ['/deposer-annonce', '/mon-compte'],
}
