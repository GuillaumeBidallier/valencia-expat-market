import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  return NextResponse.json({
    serverSession: session
      ? { email: session.user?.email, id: (session.user as { id?: string }).id }
      : null,
    env: {
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nextauthUrl: process.env.NEXTAUTH_URL ?? '(not set)',
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
