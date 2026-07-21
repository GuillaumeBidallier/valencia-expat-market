import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(sites)
}

const createSchema = z.object({
  domain:         z.string().min(3).max(120).regex(/^[a-z0-9.-]+$/, 'Domaine invalide (minuscules, chiffres, points, tirets)'),
  name:           z.string().min(1).max(80),
  country:        z.string().min(1).max(80),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#F97316'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#12122A'),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.site.findUnique({ where: { domain: parsed.data.domain } })
  if (existing) return NextResponse.json({ error: 'Ce domaine existe déjà' }, { status: 409 })

  const site = await prisma.site.create({ data: parsed.data })
  return NextResponse.json(site, { status: 201 })
}
