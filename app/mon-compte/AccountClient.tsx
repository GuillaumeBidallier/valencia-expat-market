'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, ExternalLink, Trash2, CheckCircle2, RefreshCcw,
  HeartOff, LogOut,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type ListingItem = {
  id: string
  title: string
  price: number | null
  city: string
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED'
  publishedAt: string
  image: string | null
}

type FavoriteItem = {
  id: string
  listingId: string
  listing: {
    id: string
    title: string
    price: number | null
    city: string
    status: string
    image: string | null
    sellerName: string
  }
}

type UserInfo = {
  id: string
  name: string
  email: string
  createdAt: string
  role: string
}

type Tab = 'listings' | 'favorites' | 'profile'

type Props = {
  user: UserInfo
  initialListings: ListingItem[]
  initialFavorites: FavoriteItem[]
}

const STATUS_META: Record<string, { label: string; dot: string; badge: string }> = {
  ACTIVE:  { label: 'Active',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  SOLD:    { label: 'Vendue',  dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-500' },
  EXPIRED: { label: 'Expirée', dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
}

export default function AccountClient({ user, initialListings, initialFavorites }: Props) {
  const router = useRouter()
  const { logout } = useAuth()

  const [tab, setTab]                     = useState<Tab>('listings')
  const [listings, setListings]           = useState(initialListings)
  const [favorites, setFavorites]         = useState(initialFavorites)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId]         = useState<string | null>(null)

  // Profile form
  const [profileName, setProfileName]   = useState(user.name)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)

  const activeCount = listings.filter(l => l.status === 'ACTIVE').length
  const soldCount   = listings.filter(l => l.status === 'SOLD').length
  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'SOLD') => {
    const prev = listings.find(l => l.id === id)?.status
    setListings(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    setLoadingId(id)
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    if (!profileName.trim()) return
    setSavingProfile(true)
    await fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileName.trim() }),
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleLogout = () => { logout(); router.push('/') }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Profile header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-indigo-primary flex items-center justify-center text-white font-bold text-2xl shrink-0 select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-navy leading-tight">{user.name}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Membre depuis {memberSince}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-5 mt-4">
                <div>
                  <span className="text-2xl font-extrabold text-navy">{listings.length}</span>
                  <span className="text-sm text-gray-400 ml-1">annonce{listings.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600 font-medium">{activeCount} active{activeCount !== 1 ? 's' : ''}</span>
                </div>
                {soldCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-500">{soldCount} vendue{soldCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/deposer-annonce"
              className="hidden sm:flex items-center gap-2 bg-orange-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors shrink-0"
            >
              <Plus size={15} />
              Déposer une annonce
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Tabs ────────────────────────────────────────── */}
        <div className="flex items-center border-b border-gray-200 mb-6">
          {([
            ['listings',  'Mes annonces',  listings.length],
            ['favorites', 'Mes favoris',   favorites.length],
            ['profile',   'Mon profil',    0],
          ] as [Tab, string, number][]).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-orange-primary text-orange-primary'
                  : 'border-transparent text-gray-500 hover:text-navy'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === key ? 'bg-orange-soft text-orange-primary' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors py-3"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>

        {/* ── Tab: Mes annonces ───────────────────────────── */}
        {tab === 'listings' && (
          <>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                <p className="text-5xl mb-4">📋</p>
                <p className="font-semibold text-navy mb-1 text-lg">Aucune annonce</p>
                <p className="text-sm text-gray-400 mb-6">Publiez votre première annonce gratuitement.</p>
                <Link
                  href="/deposer-annonce"
                  className="inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
                >
                  <Plus size={15} />
                  Déposer une annonce
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(listing => {
                  const meta = STATUS_META[listing.status] ?? STATUS_META.ACTIVE
                  const isConfirming = confirmDeleteId === listing.id
                  const isLoading = loadingId === listing.id

                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
                    >
                      {/* Thumbnail */}
                      <Link href={`/annonces/${listing.id}`} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {listing.image
                          ? <Image src={listing.image} alt={listing.title} fill className="object-cover" unoptimized />
                          : <div className="w-full h-full bg-gray-200" />}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/annonces/${listing.id}`}
                            className="text-sm font-semibold text-navy hover:text-orange-primary transition-colors truncate max-w-[200px] sm:max-w-none"
                          >
                            {listing.title}
                          </Link>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {listing.city}
                          {listing.price != null ? ` · ${listing.price.toLocaleString('fr-FR')} €` : ' · Gratuit'}
                          {' · '}
                          {new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 hidden sm:inline">Supprimer ?</span>
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                            >
                              Oui
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <>
                            <Link
                              href={`/annonces/${listing.id}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                              title="Voir l'annonce"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            {listing.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleStatusChange(listing.id, 'SOLD')}
                                disabled={isLoading}
                                title="Marquer comme vendu"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(listing.id, 'ACTIVE')}
                                disabled={isLoading}
                                title="Remettre en ligne"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                              >
                                <RefreshCcw size={14} />
                              </button>
                            )}

                            <button
                              onClick={() => setConfirmDeleteId(listing.id)}
                              title="Supprimer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Mobile CTA */}
                <Link
                  href="/deposer-annonce"
                  className="sm:hidden flex items-center justify-center gap-2 bg-orange-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors mt-2"
                >
                  <Plus size={15} />
                  Déposer une annonce
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── Tab: Mes favoris ────────────────────────────── */}
        {tab === 'favorites' && (
          <>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                <p className="text-5xl mb-4">🤍</p>
                <p className="font-semibold text-navy mb-1 text-lg">Aucun favori</p>
                <p className="text-sm text-gray-400 mb-6">Sauvegardez des annonces pour les retrouver ici.</p>
                <Link
                  href="/annonces"
                  className="inline-flex items-center gap-2 border border-orange-primary text-orange-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-soft transition-colors"
                >
                  Parcourir les annonces →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map(fav => (
                  <div
                    key={fav.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
                  >
                    <Link href={`/annonces/${fav.listing.id}`} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {fav.listing.image
                        ? <Image src={fav.listing.image} alt={fav.listing.title} fill className="object-cover" unoptimized />
                        : <div className="w-full h-full bg-gray-200" />}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/annonces/${fav.listing.id}`}
                        className="text-sm font-semibold text-navy hover:text-orange-primary transition-colors truncate block"
                      >
                        {fav.listing.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fav.listing.city}
                        {fav.listing.price != null ? ` · ${fav.listing.price.toLocaleString('fr-FR')} €` : ' · Gratuit'}
                        {' · '}{fav.listing.sellerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/annonces/${fav.listing.id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                        title="Voir l'annonce"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => handleUnfavorite(fav.id, fav.listingId)}
                        title="Retirer des favoris"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <HeartOff size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Tab: Mon profil ─────────────────────────────── */}
        {tab === 'profile' && (
          <div className="max-w-md space-y-4">
            {/* Infos form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-navy mb-5">Mes informations</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nom affiché
                  </label>
                  <input
                    value={profileName}
                    onChange={e => { setProfileName(e.target.value); setProfileSaved(false) }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">L&apos;adresse e-mail ne peut pas être modifiée.</p>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile || profileName.trim() === user.name || !profileName.trim()}
                  className="w-full bg-orange-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-40"
                >
                  {savingProfile ? 'Enregistrement…' : profileSaved ? '✓ Modifications enregistrées' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-500">Statut</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Gratuit</span>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-500">Membre depuis</span>
                <span className="text-sm font-semibold text-navy">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-500">Rôle</span>
                <span className="text-sm font-semibold text-navy capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
