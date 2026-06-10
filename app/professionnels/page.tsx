import { prisma } from '@/lib/prisma'
import { proCategories } from '@/lib/proCategories'
import ProsFilters from './ProsFilters'
import ProCard from './ProCard'
import AdUnit from '@/components/ads/AdUnit'

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
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-black text-navy mb-2">
            ⭐ Professionnels recommandés
          </h1>
          <p className="text-gray-500 text-sm">
            Des professionnels francophones de confiance en Espagne
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-3 lg:px-6 py-8">
        <div className="flex gap-4 items-start">

          {/* Skyscraper gauche */}
          <div className="hidden xl:block shrink-0 sticky top-20">
            <AdUnit size="skyscraper" seed={10} />
          </div>

          {/* Contenu central */}
          <div className="flex-1 min-w-0">
            {/* Catégories */}
            <div className="flex gap-2 flex-wrap mb-6">
              <a
                href="/professionnels"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  !cat ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy'
                }`}
              >
                Tous
              </a>
              {proCategories.map(c => (
                <a
                  key={c.slug}
                  href={`/professionnels?cat=${c.slug}${city ? `&city=${city}` : ''}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    cat === c.slug
                      ? 'bg-navy text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-navy'
                  }`}
                >
                  {c.icon} {c.label}
                </a>
              ))}
            </div>

            {/* Filtre ville */}
            <ProsFilters currentCat={cat ?? ''} currentCity={city ?? ''} />

            {/* Titre résultats */}
            <p className="text-sm text-gray-500 mb-5">
              <strong className="text-navy">{pros.length}</strong> professionnel{pros.length !== 1 ? 's' : ''}
              {activeCat ? ` · ${activeCat.label}` : ''}
              {city ? ` · ${city}` : ''}
            </p>

            {/* Bannière pub */}
            <AdUnit size="banner" seed={11} className="mb-5" />

            {pros.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-navy text-lg">Aucun professionnel trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Essayez une autre catégorie ou ville.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pros.map(pro => (
                  <ProCard key={pro.id} pro={pro} />
                ))}
              </div>
            )}

            {/* CTA inscription */}
            <div className="mt-12 bg-navy rounded-2xl p-6 sm:p-8 text-center text-white">
              <h2 className="text-xl font-black mb-2">Vous êtes professionnel ?</h2>
              <p className="text-white/70 text-sm mb-5">
                Référencez votre activité et touchez des milliers d&apos;expatriés francophones en Espagne.
              </p>
              <a
                href="mailto:bidallierguillaume@gmail.com?subject=Référencement professionnel Vendo"
                className="inline-block bg-orange-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
              >
                Nous contacter →
              </a>
            </div>
          </div>

          {/* Skyscraper droit */}
          <div className="hidden xl:block shrink-0 sticky top-20">
            <AdUnit size="skyscraper" seed={12} />
          </div>

        </div>
      </div>
    </div>
  )
}
