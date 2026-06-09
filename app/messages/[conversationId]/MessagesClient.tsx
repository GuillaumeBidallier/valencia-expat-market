'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Plus, ArrowLeft } from 'lucide-react'

type Message = {
  id: string
  body: string
  createdAt: string
  senderId: string
  sender: { id: string; name: string }
}

type Conv = {
  conversationId: string
  listing: { id: string; title: string; images: { url: string }[] }
  otherUser: { id: string; name: string }
  lastBody: string
  lastDate: string
  unreadCount: number
}

type ListingDetail = {
  id: string
  title: string
  price: number | null
  images: { url: string }[]
  user: { name: string } | null
}

type Props = {
  conversationId: string
  conversations: Conv[]
  listing: ListingDetail
  initialMessages: Message[]
  currentUserId: string
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export default function MessagesClient({ conversationId, conversations, listing, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (res.ok) {
      const msg = await res.json()
      setMessages(prev => [...prev, msg])
      setBody('')
    }
    setSending(false)
  }

  // Group messages by day
  const groups: { date: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const d = dayLabel(msg.createdAt)
    const last = groups[groups.length - 1]
    if (!last || last.date !== d) groups.push({ date: d, msgs: [msg] })
    else last.msgs.push(msg)
  }

  const cover = listing.images[0]?.url
  const priceLabel = listing.price != null ? `${listing.price} €` : 'Gratuit'
  const sellerInitial = (listing.user?.name ?? 'V').charAt(0).toUpperCase()

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* ── Left: conversation list ───────────────────────────── */}
      <aside className="hidden md:flex w-72 lg:w-80 flex-col border-r border-gray-200 bg-white shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-navy">Messages</h1>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-10 px-4">Aucune conversation</p>
          )}
          {conversations.map(conv => {
            const active = conv.conversationId === conversationId
            return (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.conversationId}`}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                  active ? 'bg-orange-soft/40 border-l-[3px] border-l-orange-primary' : 'border-l-[3px] border-l-transparent'
                }`}
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
                      {new Date(conv.lastDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
            )
          })}
        </div>
      </aside>

      {/* ── Center: thread ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 bg-white shrink-0">
          <Link href="/messages" className="md:hidden mr-1 text-gray-400 hover:text-navy">
            <ArrowLeft size={20} />
          </Link>
          {cover && (
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <Image src={cover} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
            <p className="text-xs text-gray-400 truncate">{listing.user?.name ?? 'Vendeur'}</p>
          </div>
          <Link href={`/annonces/${listing.id}`} className="hidden sm:block text-xs text-orange-primary hover:underline font-medium shrink-0">
            Voir l&apos;annonce
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {groups.length === 0 && (
            <p className="text-center text-sm text-gray-400 mt-auto mb-auto">Démarrez la conversation !</p>
          )}
          {groups.map(group => (
            <div key={group.date}>
              {/* Day separator */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 shrink-0 font-medium">{group.date}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="flex flex-col gap-1.5">
                {group.msgs.map(msg => {
                  const isMe = msg.senderId === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'bg-navy text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-navy rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={`text-[11px] mt-1 ${isMe ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors shrink-0"
            >
              <Plus size={16} />
            </button>
            <input
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent) } }}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-primary transition-all"
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="w-9 h-9 rounded-full bg-orange-primary text-white flex items-center justify-center hover:bg-orange-dark transition-colors disabled:opacity-40 shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* ── Right: listing info ───────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col border-l border-gray-200 bg-white shrink-0 overflow-y-auto">
        <div className="p-5">
          <Link href={`/annonces/${listing.id}`}>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
              {cover && <Image src={cover} alt={listing.title} fill className="object-cover" unoptimized />}
            </div>
            <p className="font-semibold text-navy text-sm mb-1 leading-snug">{listing.title}</p>
            <p className="text-xl font-extrabold text-navy mb-4">{priceLabel}</p>
          </Link>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Vendeur</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                {sellerInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">{listing.user?.name ?? 'Vendeur'}</p>
                <p className="text-xs text-gray-400">Membre Vendo</p>
              </div>
            </div>
          </div>

          <Link
            href={`/annonces/${listing.id}`}
            className="mt-5 block w-full text-center border border-gray-200 text-navy text-sm font-semibold rounded-xl px-4 py-2.5 hover:border-orange-primary hover:text-orange-primary transition-colors"
          >
            Voir l&apos;annonce
          </Link>
        </div>
      </aside>

    </div>
  )
}
