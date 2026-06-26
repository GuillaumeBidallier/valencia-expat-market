import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OnboardingWizard from './OnboardingWizard'

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
