import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ProDashboardClient from './ProDashboardClient'

export default async function ProDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })

  if (!pro) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏢</p>
        <h1 className="text-2xl font-black text-navy mb-3">Créez votre vitrine professionnelle</h1>
        <p className="text-gray-500 text-sm mb-6">
          Rejoignez les professionnels visibles par la communauté des expatriés en Espagne.<br />
          Moins de 5 minutes pour être en ligne.
        </p>
        <Link
          href="/mon-compte/profil-pro/create"
          className="inline-flex items-center gap-2 bg-orange-primary text-white px-8 py-3.5 rounded-xl font-black text-sm hover:bg-orange-dark transition-colors shadow-lg shadow-orange-primary/25"
        >
          Créer ma fiche pro →
        </Link>
      </div>
    )
  }

  return <ProDashboardClient pro={JSON.parse(JSON.stringify(pro))} />
}
