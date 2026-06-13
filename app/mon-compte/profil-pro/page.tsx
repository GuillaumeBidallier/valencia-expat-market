import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ProDashboardClient from './ProDashboardClient'

export const metadata = { title: 'Gérer ma vitrine pro' }

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
        <h1 className="text-2xl font-black text-navy mb-3">Aucune vitrine liée</h1>
        <p className="text-gray-500 text-sm">
          Votre compte n'est pas encore lié à un profil professionnel.
          Contactez-nous pour créer votre vitrine sur Vendo.
        </p>
        <a
          href="mailto:contact@vendo.es?subject=Créer ma vitrine pro"
          className="mt-6 inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
        >
          Nous contacter
        </a>
      </div>
    )
  }

  return <ProDashboardClient pro={JSON.parse(JSON.stringify(pro))} />
}
