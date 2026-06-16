import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(pro ?? null)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile linked' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'phone', 'whatsapp', 'website', 'city', 'zones', 'logo', 'banner', 'photos', 'phoneHidden'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const updated = await prisma.professional.update({
    where: { id: pro.id },
    data,
  })
  return NextResponse.json(updated)
}
