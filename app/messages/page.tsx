import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')
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
    lastBody: string
    lastDate: Date
    lastSenderId: string
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
        lastBody: msg.body,
        lastDate: msg.createdAt,
        lastSenderId: msg.senderId,
        unreadCount: 0,
      })
    }
    if (msg.receiverId === userId && !msg.readAt) {
      convMap.get(conversationId)!.unreadCount++
    }
  }

  const conversations = Array.from(convMap.values())

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-lg font-medium mb-2">Aucun message</p>
          <p className="text-sm">Contactez un vendeur depuis une annonce pour démarrer une conversation.</p>
          <Link href="/annonces" className="inline-block mt-6 text-sm text-orange-primary hover:underline font-medium">
            Parcourir les annonces →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map(conv => (
            <Link
              key={conv.conversationId}
              href={`/messages/${conv.conversationId}`}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-orange-primary hover:bg-orange-soft/30 ${
                conv.unreadCount > 0 ? 'border-orange-primary bg-orange-soft/20' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {conv.listing.images[0] ? (
                  <Image src={conv.listing.images[0].url} alt={conv.listing.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-semibold text-navy text-sm truncate">{conv.otherUser.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {conv.lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-0.5">{conv.listing.title}</p>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-navy' : 'text-gray-400'}`}>
                  {conv.lastSenderId === userId ? 'Vous : ' : ''}{conv.lastBody}
                </p>
              </div>

              {conv.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-primary text-white text-xs flex items-center justify-center shrink-0 font-bold">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
