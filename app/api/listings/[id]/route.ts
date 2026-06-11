import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { neighborhoodCoords } from '@/lib/neighborhoods'
import { checkFirewall } from '@/lib/content-firewall'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id, status: { not: 'DELETED' } },
    include: {
      images: { orderBy: { order: 'asc' } },
      user: { select: { name: true } },
    },
  })
  if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(listing)
}

const updateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'EXPIRED']).optional(),
  neighborhood: z.string().min(1).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.status === 'DELETED') return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  // Re-run firewall if title or description changed
  if (parsed.data.title !== undefined || parsed.data.description !== undefined) {
    const newTitle       = parsed.data.title       ?? listing.title
    const newDescription = parsed.data.description ?? listing.description
    const fw = checkFirewall(newTitle, newDescription)
    if (fw.blocked) {
      return NextResponse.json(
        { error: 'FIREWALL_BLOCKED', category: fw.category, message: fw.reason },
        { status: 422 },
      )
    }
  }

  const coords = parsed.data.neighborhood
    ? neighborhoodCoords[parsed.data.neighborhood] ?? neighborhoodCoords['Valencia']
    : undefined
  const updated = await prisma.listing.update({
    where: { id },
    data: { ...parsed.data, ...(coords && { lat: coords.lat, lng: coords.lng }) },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.status === 'DELETED') return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  await prisma.listing.update({ where: { id }, data: { status: 'DELETED' } })
  return new NextResponse(null, { status: 204 })
}
