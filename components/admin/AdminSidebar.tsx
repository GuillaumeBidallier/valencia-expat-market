'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, LayoutDashboard, FileText, Users, Star, Flag, CreditCard,
  BarChart3, BookOpen, Tags, Settings2, Wrench, Headphones, ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/annonces', label: 'Annonces', icon: FileText },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/professionnels', label: 'Professionnels', icon: Star },
  { href: '/admin/signalements', label: 'Signalements', icon: Flag },
  { href: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/categories', label: 'Catégories', icon: Tags },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings2 },
  { href: '/admin/parametres#maintenance', label: 'Maintenance', icon: Wrench },
]

export default function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={`shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-navy transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>
        {!collapsed && (
          <Link href="/admin" className="font-black text-navy text-sm tracking-tight leading-none whitespace-nowrap overflow-hidden">
            1000<span className="text-orange-primary">Q</span><br />CLICK
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const base = item.href.split('#')[0]
          const isActive = base === '/admin' ? pathname === '/admin' : pathname.startsWith(base)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors border-l-[3px] ${
                isActive
                  ? 'bg-orange-soft text-orange-primary border-orange-primary'
                  : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-navy'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 shrink-0 space-y-3">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2.5">
              <Headphones size={16} className="text-indigo-primary" />
            </div>
            <p className="text-xs font-bold text-navy mb-1">Besoin d&apos;aide ?</p>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
              Notre équipe est disponible pour vous accompagner.
            </p>
            <a
              href="mailto:contact@1000clic.fr"
              className="block bg-white border border-gray-200 rounded-lg py-2 text-xs font-semibold text-navy hover:border-orange-primary hover:text-orange-primary transition-colors"
            >
              Contacter le support
            </a>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <ShieldCheck size={13} /> 1000Click Admin
          </p>
        </div>
      )}
    </aside>
  )
}
