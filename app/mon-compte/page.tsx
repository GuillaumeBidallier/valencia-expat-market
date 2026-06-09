'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, List, Heart, CreditCard, MessageSquare, User, LogOut, Plus, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useListings } from '@/context/ListingsContext'
import Button from '@/components/ui/Button'

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: List, label: 'Mes annonces' },
  { icon: Heart, label: 'Mes favoris' },
  { icon: CreditCard, label: 'Mon abonnement' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: User, label: 'Mes informations' },
]

export default function MonComptePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { listings } = useListings()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/connexion')
  }, [isAuthenticated, router])

  if (!user) return null

  const myListings = listings.filter(l => l.userId === user.id || l.userId === 'demo').slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-6 p-2">
              <div className="w-10 h-10 bg-orange-primary rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{user.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-orange-soft text-orange-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
              <hr className="my-2" />
              <button onClick={() => { logout(); router.push('/') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Déconnexion
              </button>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold text-navy">Mon compte</h1>

          {/* Account status */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-navy mb-4">Mon compte</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut :</span>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                <CheckCircle size={12} /> Actif — Gratuit
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Publiez autant d&apos;annonces que vous voulez, c&apos;est entièrement gratuit.</p>
          </div>

          {/* My listings */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">Mes annonces</h2>
              <Link href="/deposer-annonce">
                <Button size="sm" className="flex items-center gap-1"><Plus size={14} /> Déposer une annonce</Button>
              </Link>
            </div>
            {myListings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Vous n&apos;avez pas encore d&apos;annonce.</p>
            ) : (
              <div className="space-y-3">
                {myListings.map(listing => (
                  <Link key={listing.id} href={`/annonces/${listing.id}`} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-orange-primary transition-colors">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={listing.images[0]?.url ?? ''} alt={listing.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Publié le {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className="shrink-0 text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
