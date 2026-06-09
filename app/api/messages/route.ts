import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const userId = session.user.id

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      listing: {
        include: { images: { take: 1, orderBy: { order: 'asc' } } },
      },
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  type Conv = {
    conversationId: string
    listing: { id: string; title: string; userId: string; images: { url: string }[] }
    otherUser: { id: string; name: string }
    lastMessage: { body: string; createdAt: Date; senderId: string }
    unreadCount: number
  }

  const convMap = new Map<string, Conv>()

  for (const msg of messages) {
    const isSeller = msg.listing.userId === userId
    const buyerId = isSeller
      ? msg.senderId === userId ? msg.receiverId : msg.senderId
      : userId
    const conversationId = `${msg.listingId}_${buyerId}`
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender

    if (!convMap.has(conversationId)) {
      convMap.set(conversationId, {
        conversationId,
        listing: msg.listing,
        otherUser,
        lastMessage: { body: msg.body, createdAt: msg.createdAt, senderId: msg.senderId },
        unreadCount: 0,
      })
    }
    if (msg.receiverId === userId && !msg.readAt) {
      convMap.get(conversationId)!.unreadCount++
    }
  }

  return NextResponse.json({ conversations: Array.from(convMap.values()) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { listingId, body } = await req.json()
  if (!listingId || !body?.trim()) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId, status: { not: 'DELETED' } } })
  if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
  if (listing.userId === session.user.id) return NextResponse.json({ error: 'Vous ne pouvez pas vous contacter vous-même' }, { status: 400 })

  await prisma.message.create({
    data: {
      listingId,
      senderId: session.user.id,
      receiverId: listing.userId,
      body: body.trim(),
    },
  })

  const conversationId = `${listingId}_${session.user.id}`
  return NextResponse.json({ conversationId }, { status: 201 })
}
