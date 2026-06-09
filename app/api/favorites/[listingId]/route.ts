import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

type Params = Promise<{ listingId: string }>

export async function POST(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { listingId } = await params
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: { not: 'DELETED' } },
  })
  if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  try {
    const fav = await prisma.favorite.create({
      data: { userId: session.user.id, listingId },
    })
    return NextResponse.json(fav, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Déjà en favori' }, { status: 409 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { listingId } = await params
  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, listingId },
  })
  return new NextResponse(null, { status: 204 })
}
