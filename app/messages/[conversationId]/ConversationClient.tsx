'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Send, ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Message = {
  id: string
  body: string
  createdAt: string
  readAt: string | null
  senderId: string
  sender: { id: string; name: string }
}

type ListingSummary = {
  id: string
  title: string
  price: number | null
  images: { url: string }[]
}

type Props = {
  conversationId: string
  listing: ListingSummary
  initialMessages: Message[]
  currentUserId: string
}

export default function ConversationClient({ conversationId, listing, initialMessages, currentUserId }: Props) {
  const t = useTranslations('Messages')
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
      const newMsg = await res.json()
      setMessages(prev => [...prev, { ...newMsg, createdAt: newMsg.createdAt }])
      setBody('')
    }
    setSending(false)
  }

  const coverImage = listing.images[0]?.url
  const priceLabel = listing.price !== null && listing.price !== undefined ? `${listing.price} €` : 'Gratuit'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <Link href="/messages" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy mb-4 shrink-0">
        <ChevronLeft size={16} /> {t('back')}
      </Link>

      {/* Listing card at top */}
      <Link
        href={`/annonces/${listing.id}`}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-orange-primary transition-colors mb-4 shrink-0"
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          {coverImage ? (
            <Image src={coverImage} alt={listing.title} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
          <p className="text-orange-primary text-sm font-bold">{priceLabel}</p>
        </div>
      </Link>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 pr-1 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">Démarrez la conversation !</p>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMe
                  ? 'bg-indigo-primary text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-navy rounded-bl-sm'
              }`}>
                {!isMe && (
                  <p className="text-xs font-semibold mb-1 text-orange-primary">{msg.sender.name}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2 shrink-0">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as React.FormEvent)
            }
          }}
          placeholder="Écrivez votre message... (Entrée pour envoyer)"
          rows={2}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-primary transition-colors"
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className="w-11 h-11 rounded-xl bg-orange-primary text-white flex items-center justify-center hover:bg-orange-dark transition-colors disabled:opacity-40 self-end shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
