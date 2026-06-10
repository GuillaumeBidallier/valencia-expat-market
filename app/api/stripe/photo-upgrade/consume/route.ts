import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const upgrade = await prisma.photoUpgrade.findFirst({
    where: { userId: session.user.id, paid: true, used: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!upgrade) return NextResponse.json({ ok: false })

  await prisma.photoUpgrade.update({
    where: { id: upgrade.id },
    data: { used: true },
  })

  return NextResponse.json({ ok: true })
}
