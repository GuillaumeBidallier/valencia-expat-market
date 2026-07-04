import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // ProClick and BusinessCard cascade automatically (onDelete: Cascade in schema)
    const result = await prisma.professional.deleteMany({})
    return NextResponse.json({ success: true, deleted: result.count })
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    )
  }
}
