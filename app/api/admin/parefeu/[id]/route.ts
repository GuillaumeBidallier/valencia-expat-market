import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// POST /api/admin/parefeu/[id] — approve (false positive) or delete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
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
