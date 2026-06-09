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
    lastDate: Date
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
        lastDate: msg.createdAt,
        unreadCount: 0,
      })
    }
    if (msg.receiverId === userId && !msg.readAt) map.get(conversationId)!.unreadCount++
  }

  const conversations = Array.from(map.values())

  // On desktop redirect to first conversation for the 3-panel layout
  // On this page we show the list (mobile-first) + empty center placeholder

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left: list */}
      <aside className="w-full md:w-72 lg:w-80 flex-col border-r border-gray-200 bg-white flex shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-navy">Messages</h1>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
              <p className="text-gray-400 text-sm mb-1">Aucun message</p>
              <p className="text-gray-400 text-xs mb-4">Contactez un vendeur depuis une annonce.</p>
              <Link href="/annonces" className="text-sm text-orange-primary hover:underline font-medium">
                Parcourir les annonces →
              </Link>
            </div>
          ) : (
            conversations.map(conv => (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.conversationId}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 border-l-[3px] border-l-transparent hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {conv.listing.images[0]
                    ? <Image src={conv.listing.images[0].url} alt="" fill className="object-cover" unoptimized />
                    : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <span className="text-sm font-semibold text-navy truncate">{conv.listing.title}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {conv.lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-0.5">{conv.otherUser.name}</p>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-navy' : 'text-gray-400'}`}>
                    {conv.lastBody}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-orange-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* Center: empty state (desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-center text-center">
        <div>
          <p className="text-gray-300 text-5xl mb-4">💬</p>
          <p className="text-gray-400 text-sm font-medium">Sélectionnez une conversation</p>
        </div>
      </div>
    </div>
  )
}
