import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

type Params = Promise<{ id: string }>

const updateSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  slug:        z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  category:    z.string().min(1).optional(),
  city:        z.string().min(1).optional(),
  description: z.string().max(1000).nullable().optional(),
  phone:       z.string().nullable().optional(),
  whatsapp:    z.string().nullable().optional(),
  website:     z.string().nullable().optional(),
  logo:        z.string().nullable().optional(),
  photos:      z.array(z.string()).optional(),
  tier:        z.enum(['FREE', 'PREMIUM', 'PREMIUM_PLUS']).optional(),
  verified:    z.boolean().optional(),
  featured:    z.boolean().optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return false
  return true
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const pro = await prisma.professional.update({ where: { id }, data: parsed.data })
  return NextResponse.json(pro)
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.professional.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
