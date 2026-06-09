'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, ExternalLink, Trash2, CheckCircle2, RefreshCcw,
  HeartOff, LogOut, LayoutList, Heart, User, MessageSquare,
  ChevronRight, CheckCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/* ── Types ──────────────────────────────────────────────── */
type ListingItem = {
  id: string; title: string; price: number | null
  city: string; status: 'ACTIVE' | 'SOLD' | 'EXPIRED'
  publishedAt: string; image: string | null
}
type FavoriteItem = {
  id: string; listingId: string
  listing: { id: string; title: string; price: number | null; city: string; status: string; image: string | null; sellerName: string }
}
type UserInfo = { id: string; name: string; email: string; createdAt: string; role: string }
type Tab = 'listings' | 'favorites' | 'profile'
type Props = { user: UserInfo; initialListings: ListingItem[]; initialFavorites: FavoriteItem[] }

/* ── Constants ──────────────────────────────────────────── */
const STATUS_META: Record<string, { label: string; badge: string }> = {
  ACTIVE:  { label: 'Active',  badge: 'bg-emerald-100 text-emerald-700' },
  SOLD:    { label: 'Vendue',  badge: 'bg-gray-100 text-gray-500' },
  EXPIRED: { label: 'Expirée', badge: 'bg-amber-100 text-amber-700' },
}

/* ── Shared sub-components ──────────────────────────────── */
function EmptyState({ icon, title, sub, cta, href }: { icon: string; title: string; sub: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <span className="text-5xl mb-5">{icon}</span>
      <p className="text-base font-bold text-navy mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-7 max-w-xs">{sub}</p>
      <Link href={href} className="inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors">
        {cta}
      </Link>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function AccountClient({ user, initialListings, initialFavorites }: Props) {
  const router = useRouter()
  const { logout } = useAuth()

  const [tab, setTab]                         = useState<Tab>('listings')
  const [listings, setListings]               = useState(initialListings)
  const [favorites, setFavorites]             = useState(initialFavorites)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId]             = useState<string | null>(null)
  const [profileName, setProfileName]         = useState(user.name)
  const [savingProfile, setSavingProfile]     = useState(false)
  const [profileSaved, setProfileSaved]       = useState(false)

  const activeCount  = listings.filter(l => l.status === 'ACTIVE').length
  const soldCount    = listings.filter(l => l.status === 'SOLD').length
  const memberSince  = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const initial      = user.name.charAt(0).toUpperCase()

  /* Handlers */
  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'SOLD') => {
    const prev = listings.find(l => l.id === id)?.status
    setListings(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    setLoadingId(id)
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) setListings(ls => ls.map(l => l.id === id ? { ...l, status: prev! } : l))
    setLoadingId(null)
  }

  const handleDelete = async (id: string) => {
    setListings(ls => ls.filter(l => l.id !== id))
    setConfirmDeleteId(null)
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    if (!res.ok) window.location.reload()
  }

  const handleUnfavorite = async (favoriteId: string, listingId: string) => {
    setFavorites(fs => fs.filter(f => f.id !== favoriteId))
    await fetch(`/api/favorites/${listingId}`, { method: 'DELETE' })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim() || profileName.trim() === user.name) return
    setSavingProfile(true)
    await fetch('/api/user/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileName.trim() }),
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleLogout = () => { logout(); router.push('/') }

  /* Nav definition */
  const navItems: { key: Tab; icon: React.ElementType; label: string; count?: number }[] = [
    { key: 'listings',  icon: LayoutList,    label: 'Mes annonces', count: listings.length  },
    { key: 'favorites', icon: Heart,         label: 'Mes favoris',  count: favorites.length },
    { key: 'profile',   icon: User,          label: 'Mon profil'                             },
  ]

  /* ── Listing card (shared desktop+mobile) ─────────────── */
  const renderListing = (listing: ListingItem) => {
    const meta        = STATUS_META[listing.status] ?? STATUS_META.ACTIVE
    const isConfirming = confirmDeleteId === listing.id
    const isLoading   = loadingId === listing.id
    const dateLabel   = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    const priceLabel  = listing.price != null ? `${listing.price.toLocaleString('fr-FR')} €` : 'Gratuit'

    return (
      <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
        <div className="flex gap-4 p-4">
          {/* Thumb */}
          <Link href={`/annonces/${listing.id}`} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {listing.image
              ? <Image src={listing.image} alt={listing.title} fill className="object-cover" unoptimized />
              : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-300 text-xl">📷</div>}
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/annonces/${listing.id}`} className="text-sm font-bold text-navy hover:text-orange-primary transition-colors leading-snug line-clamp-1">
                {listing.title}
              </Link>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {listing.city} · <span className="font-semibold text-gray-600">{priceLabel}</span>
            </p>
            <p className="text-xs text-gray-300 mt-0.5">{dateLabel}</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-gray-50 px-4 py-2.5 flex items-center justify-end gap-1">
          {isConfirming ? (
            <div className="flex items-center gap-2 w-full justify-center">
              <span className="text-xs text-gray-500">Supprimer définitivement ?</span>
              <button onClick={() => handleDelete(listing.id)} className="text-xs bg-red-500 text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">
                Confirmer
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3.5 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                Annuler
              </button>
            </div>
          ) : (
            <>
              {/* Desktop: icon buttons */}
              <div className="hidden sm:flex items-center gap-1">
                <Link href={`/annonces/${listing.id}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Voir">
                  <ExternalLink size={12} />
                  <span>Voir</span>
                </Link>
                {listing.status === 'ACTIVE' ? (
                  <button onClick={() => handleStatusChange(listing.id, 'SOLD')} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-40" title="Marquer vendu">
                    <CheckCircle2 size={12} />
                    <span>Vendu</span>
                  </button>
                ) : (
                  <button onClick={() => handleStatusChange(listing.id, 'ACTIVE')} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40" title="Remettre en ligne">
                    <RefreshCcw size={12} />
                    <span>Remettre en ligne</span>
                  </button>
                )}
                <button onClick={() => setConfirmDeleteId(listing.id)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                  <Trash2 size={12} />
                  <span>Supprimer</span>
                </button>
              </div>

              {/* Mobile: full-width labelled buttons */}
              <div className="flex sm:hidden items-center gap-2 w-full">
                <Link href={`/annonces/${listing.id}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <ExternalLink size={12} /> Voir
                </Link>
                {listing.status === 'ACTIVE' ? (
                  <button onClick={() => handleStatusChange(listing.id, 'SOLD')} disabled={isLoading} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-40">
                    <CheckCheck size={12} /> Vendu
                  </button>
                ) : (
                  <button onClick={() => handleStatusChange(listing.id, 'ACTIVE')} disabled={isLoading} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-semibold py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-40">
                    <RefreshCcw size={12} /> En ligne
                  </button>
                )}
                <button onClick={() => setConfirmDeleteId(listing.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 font-semibold py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Suppr.
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ── Favorite card ───────────────────────────────────── */
  const renderFavorite = (fav: FavoriteItem) => (
    <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-4">
        <Link href={`/annonces/${fav.listing.id}`} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {fav.listing.image
            ? <Image src={fav.listing.image} alt={fav.listing.title} fill className="object-cover" unoptimized />
            : <div className="w-full h-full bg-gray-200" />}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/annonces/${fav.listing.id}`} className="text-sm font-bold text-navy hover:text-orange-primary transition-colors leading-snug line-clamp-1 block">
            {fav.listing.title}
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            {fav.listing.city}
            {fav.listing.price != null ? ` · ${fav.listing.price.toLocaleString('fr-FR')} €` : ' · Gratuit'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{fav.listing.sellerName}</p>
        </div>
      </div>
      <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-2">
        <Link href={`/annonces/${fav.listing.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <ExternalLink size={12} /> Voir l&apos;annonce
        </Link>
        <button onClick={() => handleUnfavorite(fav.id, fav.listingId)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-red-400 font-semibold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
          <HeartOff size={12} /> Retirer
        </button>
      </div>
    </div>
  )

  /* ── Tab content ─────────────────────────────────────── */
  const tabContent = (
    <div>
      {tab === 'listings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy">Mes annonces <span className="text-gray-400 font-normal text-sm">({listings.length})</span></h2>
            <Link href="/deposer-annonce" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-primary hover:underline">
              <Plus size={14} /> Déposer
            </Link>
          </div>
          {listings.length === 0
            ? <EmptyState icon="📋" title="Aucune annonce" sub="Publiez votre première annonce gratuitement." cta="Déposer une annonce" href="/deposer-annonce" />
            : <div className="space-y-3">{listings.map(renderListing)}</div>}
          <Link href="/deposer-annonce" className="sm:hidden mt-4 flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-dark transition-colors">
            <Plus size={15} /> Déposer une annonce
          </Link>
        </div>
      )}

      {tab === 'favorites' && (
        <div>
          <h2 className="text-base font-bold text-navy mb-4">Mes favoris <span className="text-gray-400 font-normal text-sm">({favorites.length})</span></h2>
          {favorites.length === 0
            ? <EmptyState icon="🤍" title="Aucun favori" sub="Sauvegardez des annonces pour les retrouver ici." cta="Parcourir les annonces" href="/annonces" />
            : <div className="space-y-3">{favorites.map(renderFavorite)}</div>}
        </div>
      )}

      {tab === 'profile' && (
        <div>
          <h2 className="text-base font-bold text-navy mb-4">Mon profil</h2>
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nom affiché</label>
                <input
                  value={profileName}
                  onChange={e => { setProfileName(e.target.value); setProfileSaved(false) }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Adresse e-mail</label>
                <input value={user.email} disabled className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1.5">L&apos;email ne peut pas être modifié.</p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || profileName.trim() === user.name || !profileName.trim()}
                className="w-full bg-navy text-white py-3 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors disabled:opacity-30"
              >
                {savingProfile ? 'Enregistrement…' : profileSaved ? '✓ Enregistré' : 'Enregistrer'}
              </button>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {[
                ['Statut', <span key="s" className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Gratuit</span>],
                ['Membre depuis', <span key="m" className="text-sm font-semibold text-navy">{memberSince}</span>],
                ['Rôle', <span key="r" className="text-sm font-semibold text-navy capitalize">{user.role.toLowerCase()}</span>],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-500">{label}</span>
                  {val}
                </div>
              ))}
            </div>

            {/* Messages link */}
            <Link href="/messages" className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-orange-primary/40 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MessageSquare size={16} className="text-indigo-primary" />
                </div>
                <span className="text-sm font-semibold text-navy">Mes messages</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-primary transition-colors" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-400 py-3.5 rounded-2xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  )

  /* ═════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══ MOBILE layout (hidden lg+) ══════════════════════ */}
      <div className="lg:hidden">

        {/* Mobile hero header */}
        <div className="bg-navy px-5 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl shrink-0 select-none">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">{user.name}</p>
              <p className="text-white/50 text-xs truncate mt-0.5">{user.email}</p>
              <p className="text-white/40 text-xs mt-0.5">Membre depuis {memberSince}</p>
            </div>
            <Link href="/deposer-annonce" className="w-9 h-9 rounded-xl bg-orange-primary flex items-center justify-center shrink-0 hover:bg-orange-dark transition-colors">
              <Plus size={16} className="text-white" />
            </Link>
          </div>

          {/* Mobile stats row */}
          <div className="flex gap-3 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { val: listings.length, label: 'Annonces', color: 'bg-white/10 text-white' },
              { val: activeCount,     label: 'Actives',  color: 'bg-emerald-500/20 text-emerald-300' },
              { val: soldCount,       label: 'Vendues',  color: 'bg-white/10 text-white/60' },
              { val: favorites.length,label: 'Favoris',  color: 'bg-red-500/20 text-red-300' },
            ].map(s => (
              <div key={s.label} className={`shrink-0 px-4 py-2 rounded-xl ${s.color}`}>
                <p className="text-lg font-black leading-none">{s.val}</p>
                <p className="text-[11px] font-medium mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile sticky tab bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-100 flex shadow-sm">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors border-b-2 -mb-px ${
                tab === item.key
                  ? 'border-orange-primary text-orange-primary'
                  : 'border-transparent text-gray-400'
              }`}
            >
              <div className="relative">
                <item.icon size={17} />
                {!!item.count && item.count > 0 && (
                  <span className={`absolute -top-2 -right-3 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black px-1 rounded-full leading-none ${
                    tab === item.key ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </div>
              <span>{item.label.split(' ')[1] ?? item.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile content */}
        <div className="px-4 py-5">{tabContent}</div>
      </div>

      {/* ══ DESKTOP layout (hidden < lg) ════════════════════ */}
      <div className="hidden lg:flex max-w-6xl mx-auto px-8 py-10 gap-8">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-24 space-y-3">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-primary to-indigo-primary/70 flex items-center justify-center text-white font-black text-3xl select-none mb-4 shadow-md">
                  {initial}
                </div>
                <p className="font-bold text-navy text-base leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 mt-1 truncate w-full">{user.email}</p>
                <p className="text-xs text-gray-300 mt-0.5">Membre depuis {memberSince}</p>
              </div>

              {/* Stats pills */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-gray-50 rounded-xl py-2.5">
                  <span className="text-lg font-black text-navy">{listings.length}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Annonces</span>
                </div>
                <div className="flex flex-col items-center bg-emerald-50 rounded-xl py-2.5">
                  <span className="text-lg font-black text-emerald-600">{activeCount}</span>
                  <span className="text-[10px] text-emerald-500 font-medium">Actives</span>
                </div>
                <div className="flex flex-col items-center bg-red-50 rounded-xl py-2.5">
                  <span className="text-lg font-black text-red-400">{favorites.length}</span>
                  <span className="text-[10px] text-red-400 font-medium">Favoris</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {navItems.map((item, i) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-colors text-left ${
                    i > 0 ? 'border-t border-gray-50' : ''
                  } ${
                    tab === item.key
                      ? 'bg-orange-soft text-orange-primary'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-navy'
                  }`}
                >
                  <item.icon size={15} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {!!item.count && item.count > 0 && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === item.key ? 'bg-orange-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {item.count}
                    </span>
                  )}
                  {tab === item.key && <ChevronRight size={14} className="shrink-0 text-orange-primary" />}
                </button>
              ))}

              {/* Messages link */}
              <Link href="/messages" className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-navy transition-colors border-t border-gray-50">
                <MessageSquare size={15} className="shrink-0" />
                <span className="flex-1">Messages</span>
                <ExternalLink size={13} className="shrink-0 text-gray-300" />
              </Link>
            </nav>

            {/* Deposit CTA */}
            <Link href="/deposer-annonce" className="flex items-center justify-center gap-2 bg-orange-primary text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-dark transition-colors shadow-sm">
              <Plus size={15} />
              Déposer une annonce
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 py-2.5 rounded-2xl text-sm font-medium transition-colors hover:bg-red-50"
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0">{tabContent}</main>
      </div>
    </div>
  )
}
