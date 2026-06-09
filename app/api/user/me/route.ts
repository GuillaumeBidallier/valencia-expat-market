import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      listings: {
        where: { status: { not: 'DELETED' } },
        include: { images: { take: 1, orderBy: { order: 'asc' } } },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(user)
}

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true },
  })
  return NextResponse.json(user)
}
