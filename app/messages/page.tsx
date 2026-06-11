import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import MessagesListUI from './MessagesListUI'

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')
  const userId = session.user.id

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

  const conversations = Array.from(map.values())

  return <MessagesListUI conversations={conversations} />
}
