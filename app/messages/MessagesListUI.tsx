'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

type Conv = {
  conversationId: string
  listing: { id: string; title: string; userId: string; images: { url: string }[] }
  otherUser: { id: string; name: string }
  lastBody: string
  lastDate: string
  unreadCount: number
}

interface Props {
  conversations: Conv[]
}

export default function MessagesListUI({ conversations }: Props) {
  const t = useTranslations('Messages')

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left: list */}
      <aside className="w-full md:w-72 lg:w-80 flex-col border-r border-gray-200 bg-white flex shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-navy">{t('title')}</h1>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
              <p className="text-gray-400 text-sm mb-1">{t('empty_title')}</p>
              <p className="text-gray-400 text-xs mb-4">{t('empty_sub')}</p>
              <Link href="/annonces" className="text-sm text-orange-primary hover:underline font-medium">
                {t('browse')}
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
                    ? <Image src={conv.listing.images[0].url} alt={conv.listing.title} fill className="object-cover" sizes="44px" />
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
            ))
          )}
        </div>
      </aside>

      {/* Center: empty state (desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-center text-center">
        <div>
          <p className="text-gray-300 text-5xl mb-4">💬</p>
          <p className="text-gray-400 text-sm font-medium">{t('select')}</p>
        </div>
      </div>
    </div>
  )
}
