'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Menu, X, ChevronDown, Plus, MessageSquare, ShieldCheck, Search } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import VendoLogo from '@/components/layout/VendoLogo'
import CategoryNavBar from '@/components/layout/CategoryNavBar'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { useTranslations } from 'next-intl'
import { useLocale, type SupportedLocale } from '@/components/providers/LocaleProvider'
import { useCategories } from '@/hooks/useCategories'
import { usePageTheme } from '@/context/PageThemeContext'
import type { CategoryTree } from '@/types'

function isUnderCategoryRoot(categories: CategoryTree[], slug: string, rootSlug: string): boolean {
  if (!slug) return false
  if (slug === rootSlug) return true
  const root = categories.find(c => c.slug === rootSlug)
  if (!root) return false
  const walk = (nodes: CategoryTree[]): boolean => nodes.some(n => n.slug === slug || walk(n.children))
  return walk(root.children)
}

interface CategoryThemeFlags {
  vehicules: boolean
  immobilier: boolean
}

// Isolated in its own Suspense boundary — useSearchParams() would otherwise force
// the whole (globally-mounted) Navbar subtree to opt out of static rendering.
function CategoryThemeWatcher({ onChange }: { onChange: (v: CategoryThemeFlags) => void }) {
  const searchParams = useSearchParams()
  const categories = useCategories()
  const cat = searchParams.get('cat') ?? ''
  useEffect(() => {
    onChange({
      vehicules: isUnderCategoryRoot(categories, cat, 'vehicules'),
      immobilier: isUnderCategoryRoot(categories, cat, 'immobilier'),
    })
  }, [cat, categories, onChange])
  return null
}

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
  const isAnnonces = pathname === '/annonces'
  const unreadCount = useUnreadCount(isAuthenticated)
  const t = useTranslations('Nav')
  const [rawCategoryTheme, setRawCategoryTheme] = useState<CategoryThemeFlags>({ vehicules: false, immobilier: false })
  const onCategoryThemeChange = useCallback((v: CategoryThemeFlags) => setRawCategoryTheme(v), [])
  const { vehiculesPage } = usePageTheme()
  // Ignore any stale watcher value once the user has navigated off /annonces.
  // vehiculesPage covers routes with no `cat` query param to watch (e.g. listing detail pages).
  const vehiculesTheme = (isAnnonces && rawCategoryTheme.vehicules) || vehiculesPage
  const immoTheme = isAnnonces && rawCategoryTheme.immobilier

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled && !menuOpen
  // Light text everywhere the background is dark — either the transient home-hero
  // overlay, or the permanent dark theme on the Véhicules section.
  const light = transparent || vehiculesTheme

  return (
    <header role="banner" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      vehiculesTheme
        ? 'bg-[#0a0a0f] border-b border-white/10'
        : transparent
        ? 'bg-transparent border-transparent'
        : 'bg-white border-b border-gray-100 shadow-sm'
    }`}>
      {isAnnonces && (
        <Suspense fallback={null}>
          <CategoryThemeWatcher onChange={onCategoryThemeChange} />
        </Suspense>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + nav links — collés ensemble à gauche */}
          <div className="flex items-center gap-6">
            <Link href="/" className="relative shrink-0" aria-label="1000Click — Accueil">
              <VendoLogo size="lg" theme={light ? 'light' : 'dark'} />
              {vehiculesTheme && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -translate-y-1/2 -right-4 rotate-[-8deg] bg-red-600 text-white text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md shadow-sm ring-1 ring-white/20 z-10"
                >
                  Auto
                </span>
              )}
              {immoTheme && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -translate-y-1/2 -right-4 rotate-[-8deg] bg-orange-primary text-white text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md shadow-sm ring-1 ring-white/20 z-10"
                >
                  Immo
                </span>
              )}
            </Link>

            <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
              {[
                { label: t('listings'),      href: '/annonces' },
                { label: t('professionals'), href: '/professionnels' },
                { label: 'Espace Pro',      href: '/devenir-pro' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    light ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/annonces"
              aria-label={t('listings')}
              title={t('listings')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                light ? 'text-white/90 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search size={17} aria-hidden="true" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/deposer-annonce"
                  className={`flex items-center gap-1.5 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors ${vehiculesTheme ? "bg-red-600 hover:bg-red-700" : "bg-orange-primary hover:bg-orange-dark"}`}
                >
                  <Plus size={15} />
                  {t('postAd')}
                </Link>
                <Link
                  href="/messages"
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    light ? 'text-white/90 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
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
                      light ? 'text-white/90 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
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
                  href="/inscription"
                  className={`flex items-center gap-1.5 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors ${vehiculesTheme ? "bg-red-600 hover:bg-red-700" : "bg-orange-primary hover:bg-orange-dark"}`}
                >
                  <Plus size={15} />
                  {t('postAd')}
                </Link>
                <Link
                  href="/connexion"
                  className={`text-sm font-normal transition-colors px-2.5 py-1.5 ${
                    light ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  {t('login')}
                </Link>
              </>
            )}
            {/* Language picker */}
            <div className="ml-1 border-l pl-3 border-white/20">
              <LanguagePicker transparent={light} />
            </div>
          </div>

          {/* Mobile : Recherche + Déposer + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/annonces"
              aria-label={t('listings')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                light ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'
              }`}
            >
              <Search size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/deposer-annonce"
              className={`flex items-center gap-1 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${vehiculesTheme ? "bg-red-600 hover:bg-red-700" : "bg-orange-primary hover:bg-orange-dark"}`}
            >
              <Plus size={13} aria-hidden="true" />
              {t('postAd')}
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors ${light ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'}`}
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

      <CategoryNavBar transparent={transparent} dark={vehiculesTheme} />

      {/* Mobile menu — always solid */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Navigation mobile" className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
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
              <Link href="/devenir-pro" className="text-sm font-semibold text-orange-primary" onClick={() => setMenuOpen(false)}>Espace Pro</Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-indigo-600" onClick={() => setMenuOpen(false)}>
                  <ShieldCheck size={15} /> {t('admin')}
                </Link>
              )}
              <Link href="/deposer-annonce" onClick={() => setMenuOpen(false)} className={`text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center ${vehiculesTheme ? "bg-red-600" : "bg-orange-primary"}`}>{t('postAd')}</Link>
            </>
          ) : (
            <>
              <Link href="/devenir-pro" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-orange-primary">Espace Pro</Link>
              <Link href="/connexion" onClick={() => setMenuOpen(false)} className="border border-gray-300 text-navy px-4 py-2.5 rounded-lg font-semibold text-sm text-center">{t('login')}</Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)} className={`text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 ${vehiculesTheme ? "bg-red-600" : "bg-orange-primary"}`}>
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
