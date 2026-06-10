import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  const { reason } = await req.json()

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Raison requise' }, { status: 400 })
  }

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  await prisma.report.upsert({
    where: { listingId_userId: { listingId: id, userId: session?.user?.id ?? '' } },
    create: { listingId: id, userId: session?.user?.id ?? null, reason },
    update: { reason },
  })

  return NextResponse.json({ ok: true })
}
