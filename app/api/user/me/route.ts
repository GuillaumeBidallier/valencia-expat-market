import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.name !== undefined) {
    if (!body.name?.trim() || body.name.trim().length < 2) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    }
    data.name = body.name.trim()
  }

  if (typeof body.showPhone === 'boolean') data.showPhone = body.showPhone
  if (typeof body.showWhatsapp === 'boolean') data.showWhatsapp = body.showWhatsapp

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: session.user.id }, data })
  return NextResponse.json({ ok: true })
}
