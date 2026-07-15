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
  const rows = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }],
    include: { parent: { select: { slug: true } } },
  })
  return NextResponse.json(
    rows.map(r => ({
      id:         r.id,
      slug:       r.slug,
      label:      r.label,
      icon:       r.icon,
      order:      r.order,
      parentId:   r.parentId   ?? null,
      parentSlug: r.parent?.slug ?? null,
    }))
  )
}

const createSchema = z.object({
  slug:     z.string().min(1).max(40).regex(/^[a-z0-9-]+$/, 'Slug : lettres minuscules, chiffres et tirets uniquement'),
  label:    z.string().min(1).max(60),
  icon:     z.string().min(1).max(8),
  parentId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  // Validate parentId if provided
  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } })
    if (!parent) return NextResponse.json({ error: 'Catégorie parente introuvable' }, { status: 404 })
    if (parent.parentId) return NextResponse.json({ error: 'Impossible d\'imbriquer plus de 2 niveaux' }, { status: 400 })
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
  const category = await prisma.category.create({
    data: {
      slug:     parsed.data.slug.trim().toLowerCase(),
      label:    parsed.data.label.trim(),
      icon:     parsed.data.icon.trim(),
      order:    (maxOrder._max.order ?? -1) + 1,
      parentId: parsed.data.parentId ?? null,
    },
    include: { parent: { select: { slug: true } } },
  })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({
    id:         category.id,
    slug:       category.slug,
    label:      category.label,
    icon:       category.icon,
    order:      category.order,
    parentId:   category.parentId   ?? null,
    parentSlug: category.parent?.slug ?? null,
  }, { status: 201 })
}

const updateSchema = z.object({
  id:    z.string().min(1),
  label: z.string().min(1).max(60).optional(),
  icon:  z.string().min(1).max(8).optional(),
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

  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  })
  if (!category) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Block delete if any listing uses this category or any of its children
  const slugsToCheck = [category.slug, ...category.children.map(c => c.slug)]
  const inUse = await prisma.listing.count({ where: { categorySlug: { in: slugsToCheck } } })
  if (inUse > 0) {
    return NextResponse.json({ error: `Catégorie utilisée par ${inUse} annonce(s), suppression impossible` }, { status: 409 })
  }

  // Delete children first, then parent
  if (category.children.length > 0) {
    await prisma.category.deleteMany({ where: { parentId: id } })
  }
  await prisma.category.delete({ where: { id } })
  revalidateTag('categories', { expire: 0 })
  return NextResponse.json({ ok: true })
}
