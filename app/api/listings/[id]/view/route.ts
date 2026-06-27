import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fire-and-forget view counter — no auth required
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Non-blocking increment
  prisma.listing.updateMany({
    where: { id, status: { not: 'DELETED' } },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
