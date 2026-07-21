import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const siteId = await getAdminSiteId()

  const users = await prisma.user.findMany({
    where: {
      siteId,
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
    },
    select: {
      id: true, name: true, email: true, role: true,
      blocked: true, createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })))
}
