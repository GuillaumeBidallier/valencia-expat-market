import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ProDashboardClient from './ProDashboardClient'

export default async function ProDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const [pro, t] = await Promise.all([
    prisma.professional.findUnique({ where: { userId: session.user.id } }),
    getTranslations('ProDashboard'),
  ])

  if (!pro) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏢</p>
        <h1 className="text-2xl font-black text-navy mb-3">{t('not_linked_title')}</h1>
        <p className="text-gray-500 text-sm">{t('not_linked_body')}</p>
        <a
          href="mailto:contact@vendo.es?subject=Créer ma vitrine pro"
          className="mt-6 inline-flex items-center gap-2 bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
        >
          {t('contact_us')}
        </a>
      </div>
    )
  }

  return <ProDashboardClient pro={JSON.parse(JSON.stringify(pro))} />
}
