'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import VendoLogo from '@/components/layout/VendoLogo'

const LANGUAGES = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
]

function LanguagePicker({ transparent }: { transparent: boolean }) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('fr')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vem_lang')
    if (stored) setLang(stored)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  const select = (code: string) => {
    setLang(code)
    localStorage.setItem('vem_lang', code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          transparent
            ? 'text-white/90 hover:bg-white/10'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide">{current.code}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[150px]">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                l.code === lang ? 'text-orange-primary font-semibold' : 'text-navy'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && <span className="ml-auto text-orange-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = !scrolled && !menuOpen

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent
        ? 'bg-transparent border-transparent'
        : 'bg-white border-b border-gray-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <VendoLogo size="md" theme={transparent ? 'light' : 'dark'} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {['Accueil', 'Catégories', 'Comment ça marche ?', 'Publicité'].map((label, i) => (
              <Link
                key={label}
                href={i === 0 ? '/' : i === 1 ? '/annonces' : '/'}
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
            {isAuthenticated ? (
              <>
                <Link
                  href="/mon-compte"
                  className={`text-sm font-medium transition-colors ${transparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-navy'}`}
                >
                  Mon compte
                </Link>
                <Link
                  href="/deposer-annonce"
                  className="bg-orange-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors"
                >
                  Déposer une annonce
                </Link>
                <button
                  onClick={logout}
                  className={`text-sm font-medium transition-colors ${transparent ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-navy'}`}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className={`text-sm font-semibold transition-colors ${
                    transparent
                      ? 'text-white border border-white/60 px-4 py-2 rounded-lg hover:bg-white/10'
                      : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="bg-orange-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-dark transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
            {/* Language picker */}
            <div className="ml-1 border-l pl-3 border-white/20">
              <LanguagePicker transparent={transparent} />
            </div>
          </div>

          {/* Mobile : Déposer + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/deposer-annonce"
              className="bg-orange-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-orange-dark transition-colors whitespace-nowrap"
            >
              + Déposer
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'}`}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — always solid */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/annonces" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Catégories</Link>
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Comment ça marche ?</Link>
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Publicité</Link>
          <hr />
          {isAuthenticated ? (
            <>
              <Link href="/mon-compte" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Mon compte</Link>
              <Link href="/deposer-annonce" onClick={() => setMenuOpen(false)} className="bg-orange-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center">Déposer une annonce</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-gray-400 text-left">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" onClick={() => setMenuOpen(false)} className="border border-gray-300 text-navy px-4 py-2.5 rounded-lg font-semibold text-sm text-center">Se connecter</Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)} className="bg-orange-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center">S&apos;inscrire</Link>
            </>
          )}
          <hr />
          {/* Language selector mobile */}
          <div className="flex items-center gap-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  localStorage.setItem('vem_lang', l.code)
                  setMenuOpen(false)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:border-orange-primary hover:text-orange-primary transition-colors"
              >
                <span>{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
