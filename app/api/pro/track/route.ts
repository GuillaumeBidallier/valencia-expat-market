import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_TYPES = ['phone', 'whatsapp', 'website', 'profile_view'] as const

export async function POST(req: NextRequest) {
  try {
    const { proId, type } = await req.json() as { proId?: string; type?: string }
    if (!proId || !type || !(ALLOWED_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Verify pro exists then persist — never block the response
    prisma.professional.findUnique({ where: { id: proId }, select: { id: true } })
      .then(pro => {
        if (pro) return prisma.proClick.create({ data: { professionalId: proId, type } })
      })
      .catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
