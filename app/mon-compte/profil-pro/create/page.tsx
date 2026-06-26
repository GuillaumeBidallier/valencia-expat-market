import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OnboardingWizard from './OnboardingWizard'

export const metadata: Metadata = {
  title: 'Créer ma fiche professionnelle — Vendo',
  description: 'Créez votre fiche professionnelle et choisissez votre abonnement Premium pour apparaître devant la communauté des expatriés en Espagne.',
}

export default async function CreateProPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const existing = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (existing) redirect('/mon-compte/profil-pro')

  return <OnboardingWizard />
}
