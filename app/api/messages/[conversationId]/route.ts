import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { pusherServer } from '@/lib/pusher'

type Params = Promise<{ conversationId: string }>

function parse(conversationId: string) {
  const idx = conversationId.indexOf('_')
  if (idx === -1) return null
  return { listingId: conversationId.slice(0, idx), buyerId: conversationId.slice(idx + 1) }
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { conversationId } = await params
  const parsed = parse(conversationId)
  if (!parsed) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const { listingId, buyerId } = parsed
  const userId = session.user.id

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
  })
  if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  const sellerId = listing.userId
  if (userId !== buyerId && userId !== sellerId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: buyerId, receiverId: sellerId },
        { senderId: sellerId, receiverId: buyerId },
      ],
    },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  await prisma.message.updateMany({
    where: { listingId, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ messages, listing })
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { conversationId } = await params
  const parsed = parse(conversationId)
  if (!parsed) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const { listingId, buyerId } = parsed
  const userId = session.user.id

  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  const sellerId = listing.userId
  if (userId !== buyerId && userId !== sellerId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 })

  const receiverId = userId === buyerId ? sellerId : buyerId

  const message = await prisma.message.create({
    data: { listingId, senderId: userId, receiverId, body: body.trim() },
    include: { sender: { select: { id: true, name: true } } },
  })

  const payload = {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString() ?? null,
    senderId: message.senderId,
    sender: message.sender,
  }

  await pusherServer?.trigger(`conv-${conversationId}`, 'new-message', payload)

  return NextResponse.json(payload, { status: 201 })
}
