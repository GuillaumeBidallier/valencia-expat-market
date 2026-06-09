import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import MessagesClient from './MessagesClient'

type Props = { params: Promise<{ conversationId: string }> }

function parse(id: string) {
  const idx = id.indexOf('_')
  if (idx === -1) return null
  return { listingId: id.slice(0, idx), buyerId: id.slice(idx + 1) }
}

async function getConversations(userId: string) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      listing: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  type Conv = {
    conversationId: string
    listing: { id: string; title: string; userId: string; images: { url: string }[] }
    otherUser: { id: string; name: string }
    lastBody: string
    lastDate: string
    unreadCount: number
  }

  const map = new Map<string, Conv>()
  for (const msg of messages) {
    const isSeller = msg.listing.userId === userId
    const buyerId = isSeller
      ? msg.senderId === userId ? msg.receiverId : msg.senderId
      : userId
    const conversationId = `${msg.listingId}_${buyerId}`
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender

    if (!map.has(conversationId)) {
      map.set(conversationId, {
        conversationId,
        listing: msg.listing,
        otherUser,
        lastBody: msg.body,
        lastDate: msg.createdAt.toISOString(),
        unreadCount: 0,
      })
    }
    if (msg.receiverId === userId && !msg.readAt) map.get(conversationId)!.unreadCount++
  }

  return Array.from(map.values())
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const { conversationId } = await params
  const parsed = parse(conversationId)
  if (!parsed) notFound()

  const { listingId, buyerId } = parsed
  const userId = session.user.id

  const [listing, messages, conversations] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        user: { select: { name: true } },
      },
    }),
    prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: buyerId, receiverId: { not: buyerId } },
          { receiverId: buyerId, senderId: { not: buyerId } },
        ],
      },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    getConversations(userId),
  ])

  if (!listing) notFound()

  const sellerId = listing.userId
  if (userId !== buyerId && userId !== sellerId) notFound()

  await prisma.message.updateMany({
    where: { listingId, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  })

  return (
    <MessagesClient
      conversationId={conversationId}
      conversations={conversations}
      listing={{
        id: listing.id,
        title: listing.title,
        price: listing.price ?? null,
        images: listing.images,
        user: listing.user,
      }}
      initialMessages={messages.map(m => ({
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() ?? null,
        sender: m.sender,
      }))}
      currentUserId={userId}
    />
  )
}
