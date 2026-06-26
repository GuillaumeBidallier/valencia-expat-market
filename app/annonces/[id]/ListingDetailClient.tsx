'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import AdUnit from '@/components/ads/AdUnit'
import { MapPin, Calendar, ChevronRight, Phone, Flag, ShieldCheck, MessageSquare, X, Share2, Copy, Check } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import FavoriteButton from '@/components/listings/FavoriteButton'
import { Listing } from '@/types'
import { useAuth } from '@/context/AuthContext'

const ListingMap = dynamic(() => import('@/components/listings/ListingMap'), { ssr: false })

export default function ListingDetailClient({ listing, isFavorited }: { listing: Listing & { neighborhood: string }; isFavorited?: boolean }) {
  const t = useTranslations('ListingDetail')
  const tShare = useTranslations('Share')
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [activeImg, setActiveImg] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [reportSending, setReportSending] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shareOpen])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url: pageUrl })
        return
      } catch { /* user cancelled */ }
    }
    setShareOpen(prev => !prev)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShareOpen(false) }, 2000)
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${pageUrl}`)}`, '_blank', 'noopener,noreferrer')
    setShareOpen(false)
  }

  const isOwner = isAuthenticated && user?.id === listing.userId

  const openMessageModal = () => {
    if (!isAuthenticated) { router.push('/connexion'); return }
    setMessageOpen(true)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim() || messageSending) return
    setMessageSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, body: messageBody }),
    })
    if (res.ok) {
      const { conversationId } = await res.json()
      router.push(`/messages/${conversationId}`)
    }
    setMessageSending(false)
  }

  const waLink = `https://wa.me/${(listing.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur 1000Click.`)}`
  const publishDate = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const reportReasons = [0, 1, 2, 3, 4].map(i => t(`report_reason_${i}` as Parameters<typeof t>[0]))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-primary">{t('breadcrumb_home')}</Link>
        <ChevronRight size={12} />
        <Link href="/annonces" className="hover:text-orange-primary">{t('breadcrumb_listings')}</Link>
        <ChevronRight size={12} />
        <Link href={`/annonces?cat=${listing.categorySlug}`} className="hover:text-orange-primary">{listing.category ?? listing.categorySlug}</Link>
        <ChevronRight size={12} />
        <span className="text-navy line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + info */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3">
            {listing.images.length > 0 ? (
              <Image src={listing.images[activeImg]?.url ?? ''} alt={listing.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">{t('no_photo')}</div>
            )}
            <FavoriteButton
              listingId={listing.id}
              initialFavorited={isFavorited}
              iconSize={16}
              className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110"
            />
          </div>
          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-orange-primary' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge className="mb-2">{listing.category ?? listing.categorySlug}</Badge>
                <h1 className="text-2xl font-bold text-navy">{listing.title}</h1>
              </div>
              <div className="text-2xl font-extrabold text-navy shrink-0">
                {listing.price !== null ? `${listing.price} €` : <span className="text-green-600 text-xl">{t('free')}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.neighborhood}, {listing.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {t('published_on')} {publishDate}</span>
            </div>
            <div>
              <h2 className="font-semibold text-navy mb-2">{t('description')}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Map */}
          {listing.lat != null && listing.lng != null && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-navy mb-3 flex items-center gap-1.5">
                <MapPin size={15} className="text-orange-primary" /> {t('location')}
              </h2>
              <ListingMap lat={listing.lat} lng={listing.lng} neighborhood={listing.neighborhood} />
            </div>
          )}
        </div>

        {/* Right: Contact + security + ads */}
        <div className="flex flex-col gap-4 self-start sticky top-20">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy mb-1">{t('contact_seller')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('published_by')} {listing.userName ?? listing.user?.name ?? 'Vendeur'}</p>

            {isOwner ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">{t('owner_notice')}</p>
            ) : (
              <>
                <Button className="w-full text-sm mb-3" onClick={openMessageModal}>
                  <MessageSquare size={15} /> {t('send_message')}
                </Button>

                {listing.phone && (
                  <>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full block mb-3">
                      <Button variant="whatsapp" className="w-full text-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {t('whatsapp')}
                      </Button>
                    </a>

                    {!showPhone ? (
                      <Button variant="outline" className="w-full text-sm" onClick={() => setShowPhone(true)}>
                        <Phone size={15} /> {t('show_phone')}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-navy">
                        <Phone size={15} className="text-orange-primary" />
                        {listing.phone}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Save to favorites */}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={isFavorited}
                iconSize={15}
                showLabel
                className="mt-3 w-full flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-red-300 transition-colors"
              />
            )}

            {/* Security notice */}
            <div className="mt-4 bg-orange-soft rounded-lg p-3 flex gap-2">
              <ShieldCheck size={16} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">{t('security_notice')}</p>
            </div>

            {/* Share button */}
            <div ref={shareRef} className="relative mt-3">
              <button
                onClick={handleShare}
                aria-label={tShare('share_btn')}
                aria-expanded={shareOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-primary transition-colors"
              >
                <Share2 size={13} aria-hidden="true" /> {tShare('share_btn')}
              </button>
              {shareOpen && (
                <div role="menu" className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 min-w-[180px]">
                  <button
                    role="menuitem"
                    onClick={copyLink}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check size={15} className="text-green-500" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    {copied ? tShare('copied') : tShare('copy_link')}
                  </button>
                  <button
                    role="menuitem"
                    onClick={shareWhatsApp}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-green-500" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {tShare('share_whatsapp')}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setReportOpen(true)} aria-haspopup="dialog" className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Flag size={12} aria-hidden="true" /> {t('report')}
            </button>
          </div>

          {/* Ads in sidebar */}
          <AdUnit size="rectangle" seed={1} category={listing.categorySlug} neighborhood={listing.neighborhood} />
          <AdUnit size="rectangle" seed={3} category={listing.categorySlug} neighborhood={listing.neighborhood} />
        </div>
      </div>

      {/* Bottom ad banner */}
      <AdUnit size="inline" seed={6} category={listing.categorySlug} neighborhood={listing.neighborhood} className="mt-6" />

      {/* Message modal */}
      {messageOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMessageOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="msg-modal-title" className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 id="msg-modal-title" className="font-bold text-navy text-lg">{t('message_modal_title')}</h3>
              <button onClick={() => setMessageOpen(false)} aria-label="Fermer" className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Listing summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
              {listing.images[0] && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={listing.images[0].url} alt={listing.title} fill sizes="48px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
                <p className="text-orange-primary text-sm font-bold">
                  {listing.price !== null ? `${listing.price} €` : t('free')}
                </p>
              </div>
            </div>

            <form onSubmit={sendMessage}>
              <label htmlFor="message-body" className="sr-only">{t('message_modal_title')}</label>
              <textarea
                id="message-body"
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                placeholder={t('message_placeholder')}
                rows={4}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary resize-none mb-4"
              />
              <Button type="submit" className="w-full" disabled={!messageBody.trim() || messageSending}>
                <MessageSquare size={15} />
                {messageSending ? t('sending') : t('send_btn')}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setReportOpen(false); setReportSent(false); setReportReason('') }}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-modal-title" className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <div className="text-center py-4" role="status" aria-live="polite">
                <p className="text-3xl mb-3" aria-hidden="true">✅</p>
                <h3 id="report-modal-title" className="font-bold text-navy mb-1">{t('report_sent_title')}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('report_sent_desc')}</p>
                <Button className="w-full text-sm" onClick={() => { setReportOpen(false); setReportSent(false); setReportReason('') }}>{t('close')}</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 id="report-modal-title" className="font-bold text-navy">{t('report_title')}</h3>
                  <button onClick={() => setReportOpen(false)} aria-label="Fermer" className="text-gray-400 hover:text-navy"><X size={18} aria-hidden="true" /></button>
                </div>
                <fieldset>
                  <legend className="text-sm text-gray-500 mb-4">{t('report_reason_prompt')}</legend>
                  {reportReasons.map(r => (
                    <label key={r} className="flex items-center gap-2 py-2 text-sm cursor-pointer hover:text-orange-primary">
                      <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-orange-primary" /> {r}
                    </label>
                  ))}
                </fieldset>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1 text-sm" onClick={() => setReportOpen(false)}>{t('cancel')}</Button>
                  <Button
                    className="flex-1 text-sm"
                    disabled={!reportReason || reportSending}
                    onClick={async () => {
                      if (!reportReason) return
                      setReportSending(true)
                      await fetch(`/api/listings/${listing.id}/report`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reason: reportReason }),
                      })
                      setReportSending(false)
                      setReportSent(true)
                    }}
                  >
                    {reportSending ? t('sending_short') : t('send')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
