import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ConversationClient from './ConversationClient'

type Props = { params: Promise<{ conversationId: string }> }

function parse(conversationId: string) {
  const idx = conversationId.indexOf('_')
  if (idx === -1) return null
  return { listingId: conversationId.slice(0, idx), buyerId: conversationId.slice(idx + 1) }
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const { conversationId } = await params
  const parsed = parse(conversationId)
  if (!parsed) notFound()

  const { listingId, buyerId } = parsed
  const userId = session.user.id

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
  })
  if (!listing) notFound()

  const sellerId = listing.userId
  if (userId !== buyerId && userId !== sellerId) notFound()

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

  const listingData = {
    id: listing.id,
    title: listing.title,
    price: listing.price ?? null,
    images: listing.images,
  }

  const messagesData = messages.map(m => ({
    id: m.id,
    body: m.body,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
    sender: m.sender,
  }))

  return (
    <ConversationClient
      conversationId={conversationId}
      listing={listingData}
      initialMessages={messagesData}
      currentUserId={userId}
    />
  )
}
