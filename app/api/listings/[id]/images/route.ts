import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

type Params = Promise<{ id: string }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.status === 'DELETED') return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })

  const existingCount = await prisma.listingImage.count({ where: { listingId: id } })
  if (existingCount + files.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 photos par annonce' }, { status: 400 })
  }

  const results: Awaited<ReturnType<typeof prisma.listingImage.create>>[] = []
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Type de fichier non autorisé : ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 5 Mo)' }, { status: 400 })
    }
    const blob = await put(`listings/${id}/${Date.now()}-${file.name}`, file, { access: 'public' })
    const image = await prisma.listingImage.create({
      data: { listingId: id, url: blob.url, order: existingCount + results.length },
    })
    results.push(image)
  }

  return NextResponse.json(results, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.status === 'DELETED') return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { imageId } = await req.json()
  const image = await prisma.listingImage.findFirst({ where: { id: imageId, listingId: id } })
  if (!image) return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })

  await del(image.url)
  await prisma.listingImage.delete({ where: { id: imageId } })
  return new NextResponse(null, { status: 204 })
}
