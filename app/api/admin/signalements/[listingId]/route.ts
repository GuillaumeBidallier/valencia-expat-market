import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

// DELETE /api/admin/signalements/[listingId] — dismiss all reports for a listing
export async function DELETE(_req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { listingId } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.report.deleteMany({ where: { listingId } })
  return NextResponse.json({ ok: true })
}
