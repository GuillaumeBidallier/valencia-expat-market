import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ClipboardList, Users, Star, BarChart3 } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const [pendingCount, prosCount, usersCount, reportsCount, newUsersMonth] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.professional.count(),
    prisma.user.count(),
    prisma.report.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ])

  const cards = [
    {
      href: '/admin/annonces',
      icon: <ClipboardList size={28} />,
      label: 'Modération annonces',
      desc: pendingCount > 0 ? `${pendingCount} annonce${pendingCount > 1 ? 's' : ''} en attente de validation` : 'Gérer les annonces publiées',
      badge: pendingCount > 0 ? pendingCount : null,
      color: 'text-orange-primary bg-orange-50',
    },
    {
      href: '/admin/utilisateurs',
      icon: <Users size={28} />,
      label: 'Utilisateurs',
      desc: `${usersCount} compte${usersCount !== 1 ? 's' : ''} · ${newUsersMonth} nouveau${newUsersMonth !== 1 ? 'x' : ''} ce mois`,
      badge: null,
      color: 'text-green-700 bg-green-50',
    },
    {
      href: '/admin/professionnels',
      icon: <Star size={28} />,
      label: 'Professionnels',
      desc: `${prosCount} professionnel${prosCount !== 1 ? 's' : ''} enregistré${prosCount !== 1 ? 's' : ''}`,
      badge: null,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      href: '/admin/statistiques',
      icon: <BarChart3 size={28} />,
      label: 'Statistiques',
      desc: `${reportsCount} signalement${reportsCount !== 1 ? 's' : ''} au total · revenus photo upgrade`,
      badge: reportsCount > 0 ? reportsCount : null,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-black text-navy mb-1">🛡 Panneau d&apos;administration</h1>
        <p className="text-sm text-gray-400 mb-8">Vendo — Valencia Expat Market</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(c => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-primary/40 hover:shadow-sm transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                {c.icon}
              </div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-navy text-sm group-hover:text-orange-primary transition-colors">{c.label}</p>
                {c.badge != null && (
                  <span className="shrink-0 min-w-[22px] h-[22px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
