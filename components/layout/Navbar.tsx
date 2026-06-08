'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">V</span>
            </div>
            <div className="leading-tight">
              <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
              <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Accueil</Link>
            <Link href="/annonces" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Catégories</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Comment ça marche ?</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Publicité</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/mon-compte" className="text-sm text-gray-600 hover:text-navy font-medium">Mon compte</Link>
                <Link href="/deposer-annonce">
                  <Button size="md">Déposer une annonce</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-sm text-gray-600 hover:text-navy font-medium">Se connecter</Link>
                <Link href="/inscription">
                  <Button size="md">S&apos;inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
              <Link href="/deposer-annonce" onClick={() => setMenuOpen(false)}><Button className="w-full">Déposer une annonce</Button></Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-gray-500 text-left">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">Se connecter</Button></Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)}><Button className="w-full">S&apos;inscrire</Button></Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
