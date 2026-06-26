'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, Plus, MessageSquare, ShieldCheck, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import VendoLogo from '@/components/layout/VendoLogo'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { useTranslations } from 'next-intl'
import { useLocale, type SupportedLocale } from '@/components/providers/LocaleProvider'

const LANGUAGES = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
]

function LanguagePicker({ transparent }: { transparent: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { locale, setLocale } = useLocale()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  const select = (code: string) => {
    setLocale(code as SupportedLocale)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Langue : ${current.label}`}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          transparent
            ? 'text-white/90 hover:bg-white/10'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide">{current.code}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul role="listbox" aria-label="Choisir une langue" className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[150px]">
          {LANGUAGES.map(l => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <button
                onClick={() => select(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  l.code === locale ? 'text-orange-primary font-semibold' : 'text-navy'
                }`}
              >
                <span className="text-base" aria-hidden="true">{l.flag}</span>
                <span>{l.label}</span>
                {l.code === locale && <span className="ml-auto text-orange-primary text-xs" aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { locale, setLocale: switchLocale } = useLocale()
  const isHome = pathname === '/'
  const unreadCount = useUnreadCount(isAuthenticated)
  const t = useTranslations('Nav')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled && !menuOpen

  return (
    <header role="banner" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent
        ? 'bg-transparent border-transparent'
        : 'bg-white border-b border-gray-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Vendo — Accueil">
            <VendoLogo size="md" theme={transparent ? 'light' : 'dark'} />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
            {[
              { label: t('home'),          href: '/' },
              { label: t('listings'),      href: '/annonces' },
              { label: t('professionals'), href: '/professionnels' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  transparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-navy'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/annonces"
              aria-label={t('listings')}
              title={t('listings')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                transparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search size={17} aria-hidden="true" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/mon-compte/profil-pro/create"
                  className={`text-sm font-semibold transition-colors ${
                    transparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  Devenir Pro
                </Link>
                <Link
                  href="/deposer-annonce"
                  className="flex items-center gap-1.5 bg-orange-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors"
                >
                  <Plus size={15} />
                  {t('postAd')}
                </Link>
                <Link
                  href="/messages"
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    transparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label={unreadCount > 0 ? `${t('messages')} — ${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : t('messages')}
                >
                  <MessageSquare size={18} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      transparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Admin"
                  >
                    <ShieldCheck size={18} />
                  </Link>
                )}
                <Link
                  href="/mon-compte"
                  className="w-9 h-9 rounded-full bg-indigo-primary flex items-center justify-center text-white font-bold text-sm hover:bg-indigo-dark transition-colors shrink-0"
                  title={user?.name ?? t('account')}
                >
                  {(user?.name ?? 'M').charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/mon-compte/profil-pro/create"
                  className={`text-sm font-semibold transition-colors ${
                    transparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  Devenir Pro
                </Link>
                <Link
                  href="/connexion"
                  className={`text-sm font-semibold transition-colors ${
                    transparent
                      ? 'text-white border border-white/60 px-4 py-2 rounded-lg hover:bg-white/10'
                      : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/inscription"
                  className="flex items-center gap-1.5 bg-orange-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors"
                >
                  <Plus size={15} />
                  {t('postAd')}
                </Link>
              </>
            )}
            {/* Language picker */}
            <div className="ml-1 border-l pl-3 border-white/20">
              <LanguagePicker transparent={transparent} />
            </div>
          </div>

          {/* Mobile : Recherche + Déposer + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/annonces"
              aria-label={t('listings')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                transparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'
              }`}
            >
              <Search size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/deposer-annonce"
              className="flex items-center gap-1 bg-orange-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-orange-dark transition-colors whitespace-nowrap"
            >
              <Plus size={13} aria-hidden="true" />
              {t('postAd')}
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — always solid */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Navigation mobile" className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>{t('home')}</Link>
          <Link href="/annonces" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>{t('listings')}</Link>
          <Link href="/professionnels" className="text-sm font-semibold text-orange-primary" onClick={() => setMenuOpen(false)}>{t('professionals')}</Link>
          <hr />
          {isAuthenticated ? (
            <>
              <Link href="/messages" className="flex items-center gap-2 text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>
                {t('messages')}
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/mon-compte" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>{t('account')}</Link>
              <Link href="/mon-compte/profil-pro/create" className="text-sm font-semibold text-orange-primary" onClick={() => setMenuOpen(false)}>Devenir Pro</Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-indigo-600" onClick={() => setMenuOpen(false)}>
                  <ShieldCheck size={15} /> {t('admin')}
                </Link>
              )}
              <Link href="/deposer-annonce" onClick={() => setMenuOpen(false)} className="bg-orange-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center">{t('postAd')}</Link>
            </>
          ) : (
            <>
              <Link href="/mon-compte/profil-pro/create" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-orange-primary">Devenir Pro</Link>
              <Link href="/connexion" onClick={() => setMenuOpen(false)} className="border border-gray-300 text-navy px-4 py-2.5 rounded-lg font-semibold text-sm text-center">{t('login')}</Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)} className="bg-orange-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2">
                <Plus size={15} />
                {t('postAd')}
              </Link>
            </>
          )}
          <hr />
          {/* Language selector mobile */}
          <div role="group" aria-label="Choisir une langue" className="flex items-center gap-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  switchLocale(l.code as SupportedLocale)
                  setMenuOpen(false)
                }}
                aria-current={l.code === locale ? 'true' : undefined}
                aria-label={`${l.label}${l.code === locale ? ' (sélectionné)' : ''}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  l.code === locale
                    ? 'border-orange-primary text-orange-primary font-semibold'
                    : 'border-gray-200 hover:border-orange-primary hover:text-orange-primary'
                }`}
              >
                <span aria-hidden="true">{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
