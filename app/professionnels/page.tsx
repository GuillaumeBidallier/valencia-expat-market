import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { proCategories } from '@/lib/proCategories'

export const metadata: Metadata = {
  title: 'Professionnels',
  description: 'Trouvez des professionnels francophones en Espagne : immobilier, juridique, comptabilité, déménagement, santé et plus.',
  alternates: { canonical: '/professionnels' },
}
import AdUnit from '@/components/ads/AdUnit'
import ProfessionnelsUI from './ProfessionnelsUI'
import ProfessionnelsHeader from './ProfessionnelsHeader'

type Props = {
  searchParams: Promise<{ cat?: string; city?: string }>
}

export default async function ProfessionnelsPage({ searchParams }: Props) {
  const { cat, city } = await searchParams

  const pros = await prisma.professional.findMany({
    where: {
      ...(cat  && { category: cat }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    },
    orderBy: [{ tier: 'desc' }, { featured: 'desc' }, { name: 'asc' }],
  })

  const activeCat = proCategories.find(c => c.slug === cat)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ProfessionnelsHeader />

      <div className="max-w-screen-2xl mx-auto px-3 lg:px-6 py-8">
        <div className="flex gap-4 items-start">

          {/* Skyscraper gauche */}
          <div className="hidden xl:block shrink-0 sticky top-20">
            <AdUnit size="skyscraper" seed={10} category={cat || undefined} />
          </div>

          {/* Contenu central */}
          <ProfessionnelsUI
            pros={pros}
            cat={cat ?? ''}
            city={city ?? ''}
            activeCatLabel={activeCat?.label}
          />

          {/* Skyscraper droit */}
          <div className="hidden xl:block shrink-0 sticky top-20">
            <AdUnit size="skyscraper" seed={12} category={cat || undefined} />
          </div>

        </div>
      </div>
    </div>
  )
}
