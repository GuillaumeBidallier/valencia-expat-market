import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  const cookies = req.cookies.getAll().map(c => c.name)
  const authCookies = cookies.filter(n => n.includes('auth') || n.includes('session') || n.includes('next'))

  return NextResponse.json({
    serverSession: session
      ? { email: session.user?.email, id: (session.user as { id?: string }).id }
      : null,
    authCookies,
    allCookieNames: cookies,
    env: {
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nextauthUrl: process.env.NEXTAUTH_URL ?? '(not set)',
    },
  })
}
