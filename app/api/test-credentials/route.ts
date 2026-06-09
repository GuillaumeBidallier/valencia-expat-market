import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') ?? 'demo@vendo.es'
  const password = req.nextUrl.searchParams.get('password') ?? 'demo1234'
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ result: 'user-not-found', email })
    const valid = await bcrypt.compare(password, user.passwordHash)
    return NextResponse.json({ result: valid ? 'ok' : 'wrong-password', userId: user.id })
  } catch (e) {
    return NextResponse.json({ result: 'error', error: String(e) }, { status: 500 })
  }
}
