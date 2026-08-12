import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = await getAdminSiteId()

  const [TOTAL, USER, PREMIUM, ADMIN, BLOCKED, PROS] = await Promise.all([
    prisma.user.count({ where: { siteId } }),
    prisma.user.count({ where: { siteId, role: 'USER' } }),
    prisma.user.count({ where: { siteId, role: 'PREMIUM' } }),
    prisma.user.count({ where: { siteId, role: 'ADMIN' } }),
    prisma.user.count({ where: { siteId, blocked: true } }),
    prisma.user.count({ where: { siteId, professional: { isNot: null } } }),
  ])

  return NextResponse.json({ TOTAL, USER, PREMIUM, ADMIN, BLOCKED, PROS })
}
