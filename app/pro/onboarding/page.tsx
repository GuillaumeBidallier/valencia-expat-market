import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OnboardingWizard from './OnboardingWizard'

export const metadata: Metadata = {
  title: 'Créer ma fiche professionnelle — Vendo',
  description: 'Créez votre fiche professionnelle et choisissez votre abonnement Premium pour apparaître devant la communauté des expatriés en Espagne.',
}

export default async function ProOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const existing = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    select: { slug: true },
  })
  if (existing) redirect('/mon-compte/profil-pro')

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Nouveau professionnel</p>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mb-2">Créez votre fiche pro</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Renseignez vos informations, choisissez votre abonnement et soyez visible en quelques minutes.
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  )
}
