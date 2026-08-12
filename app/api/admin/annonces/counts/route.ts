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

  const [TOTAL, PENDING, ACTIVE, REJECTED, SOLD, EXPIRED, REPORTED] = await Promise.all([
    prisma.listing.count({ where: { status: { not: 'DELETED' }, siteId } }),
    prisma.listing.count({ where: { status: 'PENDING', siteId } }),
    prisma.listing.count({ where: { status: 'ACTIVE', siteId } }),
    prisma.listing.count({ where: { status: 'REJECTED', siteId } }),
    prisma.listing.count({ where: { status: 'SOLD', siteId } }),
    prisma.listing.count({ where: { status: 'EXPIRED', siteId } }),
    prisma.listing.count({ where: { reports: { some: {} }, status: { not: 'DELETED' }, siteId } }),
  ])

  return NextResponse.json({ TOTAL, PENDING, ACTIVE, REJECTED, SOLD, EXPIRED, REPORTED })
}
