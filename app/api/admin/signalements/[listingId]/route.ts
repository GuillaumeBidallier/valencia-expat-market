import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// DELETE /api/admin/signalements/[listingId] — dismiss all reports for a listing
export async function DELETE(_req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { listingId } = await params
  await prisma.report.deleteMany({ where: { listingId } })
  return NextResponse.json({ ok: true })
}
