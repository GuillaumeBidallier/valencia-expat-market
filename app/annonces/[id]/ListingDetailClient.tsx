'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdUnit from '@/components/ads/AdUnit'
import { MapPin, Calendar, ChevronRight, Phone, Flag, ShieldCheck, MessageSquare, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Listing } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function ListingDetailClient({ listing }: { listing: Listing }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [activeImg, setActiveImg] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [messageSending, setMessageSending] = useState(false)

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

  const waLink = `https://wa.me/${(listing.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Valencia Expat Market.`)}`
  const publishDate = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-primary">Accueil</Link>
        <ChevronRight size={12} />
        <Link href="/annonces" className="hover:text-orange-primary">Annonces</Link>
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
              <Image src={listing.images[activeImg]?.url ?? ''} alt={listing.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Pas de photo</div>
            )}
          </div>
          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-orange-primary' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" unoptimized />
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
                {listing.price !== null ? `${listing.price} €` : <span className="text-green-600 text-xl">Gratuit</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.neighborhood}, {listing.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Publié le {publishDate}</span>
            </div>
            <div>
              <h2 className="font-semibold text-navy mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Contact + security + ads */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <h2 className="font-semibold text-navy mb-1">Contacter le vendeur</h2>
            <p className="text-xs text-gray-400 mb-4">Publié par {listing.userName ?? listing.user?.name ?? 'Vendeur'}</p>

            {isOwner ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">C&apos;est votre annonce — vous ne pouvez pas vous contacter vous-même.</p>
            ) : (
              <>
                <Button className="w-full text-sm mb-3" onClick={openMessageModal}>
                  <MessageSquare size={15} /> Envoyer un message
                </Button>

                {listing.phone && (
                  <>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full block mb-3">
                      <Button variant="whatsapp" className="w-full text-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Contacter via WhatsApp
                      </Button>
                    </a>

                    {!showPhone ? (
                      <Button variant="outline" className="w-full text-sm" onClick={() => setShowPhone(true)}>
                        <Phone size={15} /> Voir le numéro de téléphone
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

            {/* Security notice */}
            <div className="mt-4 bg-orange-soft rounded-lg p-3 flex gap-2">
              <ShieldCheck size={16} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Les échanges et paiements se font <strong>uniquement en main propre</strong>. Valencia Expat Market n&apos;intervient pas dans la transaction.
              </p>
            </div>

            <button onClick={() => setReportOpen(true)} className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Flag size={12} /> Signaler cette annonce
            </button>
          </div>

          {/* Ads in sidebar */}
          <AdUnit size="rectangle" seed={1} />
          <AdUnit size="rectangle" seed={3} />
        </div>
      </div>

      {/* Bottom ad banner */}
      <AdUnit size="inline" seed={6} className="mt-6" />

      {/* Message modal */}
      {messageOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMessageOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy text-lg">Envoyer un message</h3>
              <button onClick={() => setMessageOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Listing summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
              {listing.images[0] && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
                <p className="text-orange-primary text-sm font-bold">
                  {listing.price !== null ? `${listing.price} €` : 'Gratuit'}
                </p>
              </div>
            </div>

            <form onSubmit={sendMessage}>
              <textarea
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                placeholder="Bonjour, je suis intéressé(e) par votre annonce..."
                rows={4}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-primary resize-none mb-4"
              />
              <Button type="submit" className="w-full" disabled={!messageBody.trim() || messageSending}>
                <MessageSquare size={15} />
                {messageSending ? 'Envoi...' : 'Envoyer le message'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-navy mb-3">Signaler cette annonce</h3>
            <p className="text-sm text-gray-500 mb-4">Pourquoi souhaitez-vous signaler cette annonce ?</p>
            {['Annonce frauduleuse', 'Produit interdit', 'Contenu inapproprié', 'Doublon', 'Autre'].map(r => (
              <label key={r} className="flex items-center gap-2 py-2 text-sm cursor-pointer hover:text-orange-primary">
                <input type="radio" name="reason" value={r} className="accent-orange-primary" /> {r}
              </label>
            ))}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => setReportOpen(false)}>Annuler</Button>
              <Button className="flex-1 text-sm" onClick={() => setReportOpen(false)}>Envoyer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
