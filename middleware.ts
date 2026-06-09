import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/connexion', req.url))
  }
})

export const config = {
  matcher: ['/deposer-annonce', '/mon-compte'],
}
