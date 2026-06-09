'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import VendoLogo from '@/components/layout/VendoLogo'

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
          <div className="hidden md:flex items-center gap-3">
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
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'}`}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
        </div>
      )}
    </header>
  )
}
