import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

const updateSchema = z.object({
  name:           z.string().min(1).max(80).optional(),
  country:        z.string().min(1).max(80).optional(),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  active:         z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const existing = await prisma.site.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const site = await prisma.site.update({ where: { id }, data: parsed.data })
  return NextResponse.json(site)
}
