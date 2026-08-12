'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AdminSiteSelector from '@/components/admin/AdminSiteSelector'

interface Site { id: string; name: string; domain: string; country: string }

export default function AdminTopBar({
  adminName,
  notificationCount,
  sites,
  currentSiteId,
}: {
  adminName: string
  notificationCount: number
  sites: Site[]
  currentSiteId: string
}) {
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const initial = adminName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-5 shrink-0">
      <div className="flex items-center gap-2">
        <AdminSiteSelector sites={sites} currentSiteId={currentSiteId} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Rechercher"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-navy transition-colors"
        >
          <Search size={17} />
        </button>

        <Link
          href="/deposer-annonce"
          className="hidden sm:flex items-center gap-1.5 bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus size={15} /> Déposer une annonce
        </Link>

        <Link
          href="/admin/signalements"
          aria-label={`Notifications — ${notificationCount}`}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-navy transition-colors"
        >
          <Bell size={17} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-orange-primary text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-indigo-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
              {initial}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[180px] z-30">
              <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-50 truncate">{adminName}</p>
              <Link
                href="/mon-compte"
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <User size={14} /> Mon compte
              </Link>
              <button
                role="menuitem"
                onClick={() => logout()}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
