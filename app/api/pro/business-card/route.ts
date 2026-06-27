import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { businessCard: true },
  })
  if (!pro) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ businessCard: pro.businessCard })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { businessCard: true },
  })
  if (!pro) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!pro.businessCard?.active) return NextResponse.json({ error: 'Carte non activée' }, { status: 403 })

  const body = await req.json()
  const allowed = ['headline', 'tagline', 'primaryColor', 'showEmail', 'showPhone', 'showWhatsapp', 'showWebsite', 'email']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const updated = await prisma.businessCard.update({
    where: { id: pro.businessCard.id },
    data,
  })

  return NextResponse.json({ businessCard: updated })
}
