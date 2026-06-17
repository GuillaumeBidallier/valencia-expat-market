import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const rows = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(rows)
}

const createSchema = z.object({
  slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/, 'Slug : lettres minuscules, chiffres et tirets uniquement'),
  label: z.string().min(1).max(60),
  icon: z.string().min(1).max(8),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
  const category = await prisma.category.create({
    data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 },
  })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json(category, { status: 201 })
}

const updateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(60).optional(),
  icon: z.string().min(1).max(8).optional(),
  order: z.number().int().optional(),
})

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { id, ...data } = parsed.data
  const category = await prisma.category.update({ where: { id }, data })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const inUse = await prisma.listing.count({ where: { categorySlug: category.slug } })
  if (inUse > 0) {
    return NextResponse.json({ error: `Catégorie utilisée par ${inUse} annonce(s), suppression impossible` }, { status: 409 })
  }

  await prisma.category.delete({ where: { id } })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({ ok: true })
}
