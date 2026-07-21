import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getAdminSiteId } from '@/lib/site'

// POST /api/admin/parefeu/[id] — approve (false positive) or delete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const siteId = await getAdminSiteId()
  const target = await prisma.listing.findUnique({ where: { id } })
  if (!target || target.siteId !== siteId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const { action } = await req.json() as { action: 'approve' | 'delete' }

  if (action === 'approve') {
    await prisma.listing.update({
      where: { id },
      data: { status: 'ACTIVE', blockedReason: null },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    await prisma.listing.update({
      where: { id },
      data: { status: 'DELETED' },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
