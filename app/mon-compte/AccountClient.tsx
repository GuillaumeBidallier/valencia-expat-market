'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, ExternalLink, Trash2, CheckCircle2, RefreshCcw, HeartOff,
  LogOut, LayoutList, Heart, User, MessageSquare, ChevronRight,
  Pencil, Eye, Settings, Phone, MessageCircle, Save,
  Loader2, KeyRound, ShieldAlert, Star, Mail, Calendar,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/* ── Types ──────────────────────────────────────────────── */
type ListingItem = {
  id: string; title: string; price: number | null
  city: string; status: 'ACTIVE' | 'SOLD' | 'EXPIRED'
  publishedAt: string; image: string | null
  views: number; favoritesCount: number
}
type FavoriteItem = {
  id: string; listingId: string
  listing: { id: string; title: string; price: number | null; city: string; status: string; image: string | null; sellerName: string }
}
type UserInfo = {
  id: string; name: string; email: string; createdAt: string; role: string
  showPhone: boolean; showWhatsapp: boolean
}
type Tab = 'listings' | 'favorites' | 'profile' | 'prefs'
type ProProfile = {
  slug: string; name: string; tier: string
  subscriptionStatus: string | null
  subscriptionPeriod: string | null
  subscriptionCurrentPeriodEnd: string | null
} | null
type Props = { user: UserInfo; initialListings: ListingItem[]; initialFavorites: FavoriteItem[]; proProfile?: ProProfile }

const STATUS_META: Record<string, { label: string; dot: string; badge: string }> = {
  ACTIVE:  { label: 'Active',  dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  SOLD:    { label: 'Vendue',  dot: 'bg-gray-300',    badge: 'bg-gray-100 text-gray-500'       },
  EXPIRED: { label: 'Expirée', dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700'     },
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-primary ${checked ? 'bg-indigo-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function EmptyState({ icon, title, sub, cta, href }: { icon: string; title: string; sub: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-5">{icon}</span>
      <p className="text-base font-black text-navy mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-8 max-w-xs">{sub}</p>
      <Link href={href} className="inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors">
        {cta}
      </Link>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function AccountClient({ user, initialListings, initialFavorites, proProfile }: Props) {
  const router = useRouter()
  const { logout } = useAuth()

  const [tab, setTab]                 = useState<Tab>('listings')
  const [listings, setListings]       = useState(initialListings)
  const [favorites, setFavorites]     = useState(initialFavorites)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId]     = useState<string | null>(null)

  // Profile form
  const [profileName, setProfileName] = useState(user.name)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)

  // Password form
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  // Preferences
  const [showPhone, setShowPhone]       = useState(user.showPhone)
  const [showWhatsapp, setShowWhatsapp] = useState(user.showWhatsapp)
  const [savingPrefs, setSavingPrefs]   = useState(false)
  const [prefsSaved, setPrefsSaved]     = useState(false)

  // Danger zone
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const activeCount = listings.filter(l => l.status === 'ACTIVE').length
  const soldCount   = listings.filter(l => l.status === 'SOLD').length
  const totalViews  = listings.reduce((s, l) => s + l.views, 0)
  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const avatarLetter = user.name.charAt(0).toUpperCase()

  const tierLabel = proProfile?.tier === 'PREMIUM_PLUS' ? 'Premium+' : proProfile?.tier === 'PREMIUM' ? 'Premium' : 'Gratuit'
  const tierColor = proProfile?.tier === 'PREMIUM_PLUS'
    ? 'bg-indigo-primary text-white' : proProfile?.tier === 'PREMIUM'
      ? 'bg-orange-primary text-white' : 'bg-white/15 text-white/70'

  /* ── Handlers ────────────────────────────────────────── */
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

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('Les mots de passe ne correspondent pas.'); return }
    if (pwdForm.next.length < 8) { setPwdError('Minimum 8 caractères.'); return }
    setSavingPwd(true); setPwdError(''); setPwdSaved(false)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.next }),
    })
    if (!res.ok) { const d = await res.json(); setPwdError(d.error ?? 'Erreur') }
    else { setPwdSaved(true); setPwdForm({ current: '', next: '', confirm: '' }); setTimeout(() => setPwdSaved(false), 4000) }
    setSavingPwd(false)
  }

  const handleSavePrefs = async () => {
    setSavingPrefs(true)
    await fetch('/api/user/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showPhone, showWhatsapp }),
    })
    setSavingPrefs(false)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 3000)
  }

  const handleLogout = () => { logout(); router.push('/') }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (res.ok) { logout(); router.push('/') }
    else setDeletingAccount(false)
  }

  /* ── Tabs config ─────────────────────────────────────── */
  const TABS: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'listings',  label: 'Mes annonces', icon: LayoutList,  count: listings.length  },
    { key: 'favorites', label: 'Mes favoris',  icon: Heart,       count: favorites.length },
    { key: 'profile',   label: 'Mon profil',   icon: User                                  },
    { key: 'prefs',     label: 'Préférences',  icon: Settings                              },
  ]

  /* ── Listing card ────────────────────────────────────── */
  const renderListing = (listing: ListingItem) => {
    const meta        = STATUS_META[listing.status] ?? STATUS_META.ACTIVE
    const isConfirming = confirmDeleteId === listing.id
    const isLoading   = loadingId === listing.id
    const dateLabel   = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    const priceLabel  = listing.price != null ? `${listing.price.toLocaleString('fr-FR')} €` : 'Gratuit'

    return (
      <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="flex gap-4 p-4">
          <Link href={`/annonces/${listing.id}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {listing.image
              ? <Image src={listing.image} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link href={`/annonces/${listing.id}`} className="text-sm font-bold text-navy hover:text-orange-primary transition-colors line-clamp-1 leading-snug">
                {listing.title}
              </Link>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${meta.badge}`}>{meta.label}</span>
            </div>
            <p className="text-sm font-black text-navy">{priceLabel}</p>
            <p className="text-xs text-gray-400 mt-0.5">{listing.city} · {dateLabel}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Eye size={11} className="text-gray-300" />
                {listing.views.toLocaleString('fr-FR')} vue{listing.views !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Heart size={11} className="text-red-300" />
                {listing.favoritesCount} favori{listing.favoritesCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 px-4 py-2.5">
          {isConfirming ? (
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs text-gray-500">Supprimer définitivement ?</span>
              <button onClick={() => handleDelete(listing.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">Confirmer</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annuler</button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link href={`/annonces/${listing.id}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ExternalLink size={12} /> Voir
              </Link>
              <Link href={`/annonces/${listing.id}/modifier`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-primary px-2.5 py-1.5 rounded-lg hover:bg-orange-soft transition-colors">
                <Pencil size={12} /> Modifier
              </Link>
              {listing.status === 'ACTIVE' ? (
                <button onClick={() => handleStatusChange(listing.id, 'SOLD')} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-40">
                  <CheckCircle2 size={12} /> Marquer vendu
                </button>
              ) : (
                <button onClick={() => handleStatusChange(listing.id, 'ACTIVE')} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40">
                  <RefreshCcw size={12} /> Remettre en ligne
                </button>
              )}
              <button onClick={() => setConfirmDeleteId(listing.id)} className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Favorite card ────────────────────────────────────── */
  const renderFavorite = (fav: FavoriteItem) => (
    <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex gap-4 p-4">
        <Link href={`/annonces/${fav.listing.id}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {fav.listing.image
            ? <Image src={fav.listing.image} alt={fav.listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
            : <div className="w-full h-full bg-gray-200" />}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/annonces/${fav.listing.id}`} className="text-sm font-bold text-navy hover:text-orange-primary transition-colors line-clamp-1 block">{fav.listing.title}</Link>
          <p className="text-sm font-black text-navy mt-0.5">
            {fav.listing.price != null ? `${fav.listing.price.toLocaleString('fr-FR')} €` : 'Gratuit'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{fav.listing.city} · par {fav.listing.sellerName}</p>
        </div>
      </div>
      <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-2">
        <Link href={`/annonces/${fav.listing.id}`} className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <ExternalLink size={12} /> Voir l&apos;annonce
        </Link>
        <button onClick={() => handleUnfavorite(fav.id, fav.listingId)} className="flex items-center gap-1.5 text-xs text-red-400 font-semibold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
          <HeartOff size={12} /> Retirer
        </button>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Navy header ──────────────────────────────────── */}
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 pb-6">

            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-primary to-indigo-primary/60 flex items-center justify-center text-white font-black text-3xl shrink-0 shadow-xl border-4 border-white/10 select-none">
              {avatarLetter}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{user.name}</h1>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ${tierColor}`}>{tierLabel}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm">
                <span className="flex items-center gap-1.5"><Mail size={12} />{user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} />Membre depuis {memberSince}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/deposer-annonce"
              className="shrink-0 inline-flex items-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-primary/25"
            >
              <Plus size={15} /> Déposer une annonce
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 pb-5 overflow-x-auto scrollbar-none">
            {[
              { label: 'Annonces',  value: listings.length, color: 'text-white' },
              { label: 'Actives',   value: activeCount,     color: 'text-emerald-300' },
              { label: 'Vendues',   value: soldCount,       color: 'text-white/50' },
              { label: 'Favoris',   value: favorites.length, color: 'text-red-300' },
              { label: 'Vues totales', value: totalViews,   color: 'text-indigo-300' },
            ].map(s => (
              <div key={s.label} className="shrink-0 text-center">
                <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
            {proProfile && (
              <Link
                href="/mon-compte/profil-pro"
                className="ml-auto shrink-0 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <Star size={12} /> Mon espace Pro
              </Link>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex items-end gap-1 overflow-x-auto scrollbar-none">
            {TABS.map(({ key, label, icon: Icon, count }) => {
              const active = tab === key
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                    active
                      ? 'bg-white text-navy border-transparent'
                      : 'text-white/60 hover:text-white border-transparent hover:bg-white/8'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? 'bg-orange-primary text-white' : 'bg-white/15 text-white/70'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

        {/* ════ MES ANNONCES ══════════════════════════════ */}
        {tab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {listings.length} annonce{listings.length !== 1 ? 's' : ''}
              </p>
              <Link href="/deposer-annonce" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-primary hover:underline">
                <Plus size={14} /> Déposer une annonce
              </Link>
            </div>
            {listings.length === 0
              ? <EmptyState icon="📋" title="Aucune annonce" sub="Publiez votre première annonce gratuitement." cta="Déposer une annonce" href="/deposer-annonce" />
              : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{listings.map(renderListing)}</div>}
          </div>
        )}

        {/* ════ MES FAVORIS ═══════════════════════════════ */}
        {tab === 'favorites' && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">
              {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
            </p>
            {favorites.length === 0
              ? <EmptyState icon="🤍" title="Aucun favori" sub="Sauvegardez des annonces pour les retrouver ici." cta="Parcourir les annonces" href="/annonces" />
              : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{favorites.map(renderFavorite)}</div>}
          </div>
        )}

        {/* ════ MON PROFIL ════════════════════════════════ */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — forms */}
            <div className="lg:col-span-2 space-y-5">

              {/* Identity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center">
                    <User size={16} className="text-indigo-primary" />
                  </div>
                  <div>
                    <p className="font-black text-navy text-sm">Identité</p>
                    <p className="text-xs text-gray-400 mt-0.5">Votre nom affiché sur la plateforme</p>
                  </div>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom affiché</label>
                    <input
                      value={profileName}
                      onChange={e => { setProfileName(e.target.value); setProfileSaved(false) }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse e-mail</label>
                    <input value={user.email} disabled className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1.5">L&apos;adresse e-mail ne peut pas être modifiée.</p>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={savingProfile || profileName.trim() === user.name || !profileName.trim()}
                      className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors disabled:opacity-30"
                    >
                      {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    {profileSaved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Enregistré</span>}
                  </div>
                </form>
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <KeyRound size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="font-black text-navy text-sm">Mot de passe</p>
                    <p className="text-xs text-gray-400 mt-0.5">Minimum 8 caractères</p>
                  </div>
                </div>
                <form onSubmit={handleSavePassword} className="p-6 space-y-4">
                  {['current', 'next', 'confirm'].map((field, i) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        {i === 0 ? 'Mot de passe actuel' : i === 1 ? 'Nouveau mot de passe' : 'Confirmer le nouveau'}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={pwdForm[field as keyof typeof pwdForm]}
                        onChange={e => { setPwdForm(f => ({ ...f, [field]: e.target.value })); setPwdError(''); setPwdSaved(false) }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
                      />
                    </div>
                  ))}
                  {pwdError && <p className="text-xs text-red-500 font-medium">{pwdError}</p>}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={savingPwd || !pwdForm.current || !pwdForm.next || !pwdForm.confirm}
                      className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors disabled:opacity-30"
                    >
                      {savingPwd ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                      {savingPwd ? 'Enregistrement…' : 'Changer le mot de passe'}
                    </button>
                    {pwdSaved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Modifié</span>}
                  </div>
                </form>
              </div>
            </div>

            {/* Right — sidebar */}
            <div className="space-y-4">

              {/* Account info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="font-black text-navy text-sm">Informations du compte</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: 'Statut', value: tierLabel, icon: <Star size={13} className="text-orange-primary" /> },
                    { label: 'Membre depuis', value: memberSince, icon: <Calendar size={13} className="text-gray-400" /> },
                    { label: 'Rôle', value: user.role.toLowerCase(), icon: <User size={13} className="text-gray-400" /> },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {item.icon}
                        {item.label}
                      </div>
                      <span className="text-sm font-semibold text-navy capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro vitrine */}
              {proProfile ? (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5">
                  <p className="text-xs font-black text-orange-primary uppercase tracking-widest mb-2">Vitrine Pro</p>
                  <p className="text-sm font-bold text-navy mb-3">{proProfile.name}</p>
                  <div className="flex gap-2">
                    <Link href={`/professionnels/${proProfile.slug}`} target="_blank"
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-orange-primary border border-orange-primary/30 px-3 py-2 rounded-xl hover:bg-orange-primary hover:text-white transition-colors">
                      Voir <ExternalLink size={11} />
                    </Link>
                    <Link href="/mon-compte/profil-pro"
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-orange-primary text-white px-3 py-2 rounded-xl hover:bg-orange-dark transition-colors">
                      Gérer <Pencil size={11} />
                    </Link>
                  </div>
                </div>
              ) : (
                <Link href="/mon-compte/profil-pro/create"
                  className="block bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 hover:border-orange-primary transition-colors group">
                  <p className="text-xs font-black text-orange-primary uppercase tracking-widest mb-1">Devenez Pro</p>
                  <p className="text-sm font-bold text-navy">Créer ma fiche professionnelle</p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Visibilité renforcée auprès des expatriés</p>
                  <span className="text-xs font-bold text-orange-primary group-hover:underline flex items-center gap-1">
                    Commencer <ChevronRight size={12} />
                  </span>
                </Link>
              )}

              {/* Messages */}
              <Link href="/messages"
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:border-indigo-primary/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center">
                    <MessageSquare size={16} className="text-indigo-primary" />
                  </div>
                  <span className="text-sm font-bold text-navy">Mes messages</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-primary transition-colors" />
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-400 py-3.5 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          </div>
        )}

        {/* ════ PRÉFÉRENCES ═══════════════════════════════ */}
        {tab === 'prefs' && (
          <div className="max-w-2xl space-y-5">

            {/* Contact prefs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Settings size={16} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-black text-navy text-sm">Préférences de contact</p>
                  <p className="text-xs text-gray-400 mt-0.5">Choisissez les informations visibles sur vos annonces</p>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Numéro de téléphone', desc: 'Affiché sur vos annonces si renseigné', icon: <Phone size={14} className="text-emerald-500" />, bg: 'bg-emerald-50', val: showPhone, set: setShowPhone },
                  { label: 'WhatsApp',             desc: 'Bouton WhatsApp visible sur vos annonces', icon: <MessageCircle size={14} className="text-green-500" />, bg: 'bg-green-50', val: showWhatsapp, set: setShowWhatsapp },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle checked={item.val} onChange={item.set} />
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                {prefsSaved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 size={13} /> Préférences sauvegardées
                  </span>
                )}
                {!prefsSaved && <span />}
                <button
                  onClick={handleSavePrefs}
                  disabled={savingPrefs}
                  className="flex items-center gap-1.5 bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
                >
                  {savingPrefs ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {savingPrefs ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-red-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <ShieldAlert size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="font-black text-red-600 text-sm">Zone de danger</p>
                  <p className="text-xs text-gray-400 mt-0.5">Actions irréversibles — agissez avec prudence</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-navy mb-1">Supprimer mon compte</p>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Cette action supprime définitivement vos annonces, favoris et messages, résilie tout abonnement actif et anonymise vos données personnelles. Cette opération est <strong>irréversible</strong>.
                </p>
                {confirmDeleteAccount ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-sm font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : null}
                      {deletingAccount ? 'Suppression…' : 'Confirmer la suppression'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAccount(false)}
                      disabled={deletingAccount}
                      className="flex-1 bg-gray-100 text-gray-600 text-sm font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteAccount(true)}
                    className="w-full text-red-500 border border-red-200 text-sm font-bold py-3 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Supprimer définitivement mon compte
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
