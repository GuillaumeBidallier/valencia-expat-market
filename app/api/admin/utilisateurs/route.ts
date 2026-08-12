import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

export async function GET(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const q       = searchParams.get('q') ?? ''
  const role    = searchParams.get('role') ?? ''
  const blocked = searchParams.get('blocked') ?? ''
  const pro     = searchParams.get('pro') ?? ''
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit   = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const siteId  = await getAdminSiteId()

  const where = {
    siteId,
    ...(q && { OR: [{ name: { contains: q } }, { email: { contains: q } }] }),
    ...(role && ['USER', 'PREMIUM', 'ADMIN'].includes(role) && { role: role as 'USER' | 'PREMIUM' | 'ADMIN' }),
    ...(blocked === 'true' && { blocked: true }),
    ...(blocked === 'false' && { blocked: false }),
    ...(pro === 'true' && { professional: { isNot: null } }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        blocked: true, createdAt: true,
        _count: { select: { listings: true, favorites: true, sentMessages: true } },
        professional: { select: { id: true, verified: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  })
}
