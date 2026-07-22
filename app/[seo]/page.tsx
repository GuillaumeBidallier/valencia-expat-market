import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { VILLES, CATEGORIES_SEO, type VilleSEO, type CategorieSEO } from '@/lib/seo-pages'
import ListingRow from '@/components/listings/ListingRow'
import type { Listing } from '@/types'
import type { Prisma } from '@prisma/client'

export const revalidate = 3600
export const dynamicParams = false

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://1000clic.fr').replace(/\/$/, '')
const PER_PAGE = 20

type Props = {
  params: Promise<{ seo: string }>
  searchParams: Promise<{ page?: string }>
}

type Resolved =
  | { type: 'ville'; data: VilleSEO }
  | { type: 'categorie'; data: CategorieSEO }

function resolve(seo: string): Resolved | null {
  if (seo.startsWith('petites-annonces-')) {
    const villeSlug = seo.slice('petites-annonces-'.length)
    const data = VILLES.find(v => v.slug === villeSlug)
    if (data) return { type: 'ville', data }
  }
  const data = CATEGORIES_SEO.find(c => c.seoSlug === seo)
  if (data) return { type: 'categorie', data }
  return null
}

export function generateStaticParams() {
  return [
    ...VILLES.map(v => ({ seo: `petites-annonces-${v.slug}` })),
    ...CATEGORIES_SEO.map(c => ({ seo: c.seoSlug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seo } = await params
  const r = resolve(seo)
  if (!r) return {}

  let title: string, description: string, url: string

  if (r.type === 'ville') {
    const v = r.data
    title = `Petites annonces ${v.labelFr} — 1000Click`
    description = `Annonces de particuliers et expatriés francophones à ${v.labelFr}. Immobilier, véhicules, mobilier, électronique et plus entre particuliers.`
    url = `${BASE}/petites-annonces-${v.slug}`
  } else {
    const c = r.data
    title = `${c.label} — 1000Click`
    description = c.metaDesc
    url = `${BASE}/${c.seoSlug}`
  }

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: '1000Click',
      type: 'website',
      locale: 'fr_FR',
    },
  }
}

async function getCategorySlugs(rootSlug: string): Promise<string[]> {
  const allCats = await prisma.category.findMany({
    select: { slug: true, parent: { select: { slug: true } } },
  })
  const byParent = new Map<string, string[]>()
  for (const cat of allCats) {
    const parentSlug = cat.parent?.slug
    if (parentSlug) {
      const arr = byParent.get(parentSlug) ?? []
      arr.push(cat.slug)
      byParent.set(parentSlug, arr)
    }
  }
  const collect = (slug: string): string[] => {
    const children = byParent.get(slug) ?? []
    return [slug, ...children.flatMap(collect)]
  }
  return collect(rootSlug)
}

export default async function SeoPage({ params, searchParams }: Props) {
  const { seo } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))

  const r = resolve(seo)
  if (!r) notFound()

  let where: Prisma.ListingWhereInput
  let h1: string
  let intro: string
  let urlBase: string

  if (r.type === 'ville') {
    const v = r.data
    h1 = `Petites annonces ${v.labelFr}`
    intro = `Parcourez les annonces de la communauté francophone à ${v.labelFr}. Immobilier, véhicules, mobilier, électronique, mode et services entre particuliers.`
    urlBase = `/petites-annonces-${v.slug}`
    where = {
      status: 'ACTIVE' as const,
      OR: v.dbTerms.map(t => ({ city: { equals: t } })),
    }
  } else {
    const c = r.data
    h1 = c.h1
    intro = c.intro
    urlBase = `/${c.seoSlug}`
    const slugs = await getCategorySlugs(c.categorySlug)
    where = {
      status: 'ACTIVE' as const,
      categorySlug: { in: slugs },
    }
  }

  const [rawListings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.listing.count({ where }),
  ])

  const pages = Math.ceil(total / PER_PAGE)

  const listings: Listing[] = rawListings.map(l => ({
    ...l,
    price: l.price ?? null,
    boostExpiresAt: l.boostExpiresAt?.toISOString() ?? null,
    featuredAt: l.featuredAt?.toISOString() ?? null,
    publishedAt: l.publishedAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    attributes: l.attributes as Record<string, string | number> | null,
  }))

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Annonces', item: `${BASE}/annonces` },
      { '@type': 'ListItem', position: 3, name: h1, item: `${BASE}${urlBase}` },
    ],
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
    description: intro,
    numberOfItems: total,
    itemListElement: listings.slice(0, 10).map((l, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * PER_PAGE + i + 1,
      url: `${BASE}/annonces/${l.id}`,
      name: l.title,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* En-tête */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Fil d'Ariane" className="text-sm text-gray-400 mb-3">
              <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
              <span className="mx-2" aria-hidden>›</span>
              <Link href="/annonces" className="hover:text-orange-500 transition-colors">Annonces</Link>
              <span className="mx-2" aria-hidden>›</span>
              <span className="text-gray-600">{h1}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{h1}</h1>
            <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">{intro}</p>
            <p className="mt-3 text-xs text-gray-400 font-medium">
              {total.toLocaleString('fr-FR')} annonce{total !== 1 ? 's' : ''}
              {pages > 1 && ` — page ${page} sur ${pages}`}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {listings.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-semibold text-gray-600">Aucune annonce pour le moment</p>
              <p className="text-sm mt-1">Soyez le premier à publier dans cette catégorie !</p>
              <Link
                href="/deposer-annonce"
                className="mt-5 inline-block bg-orange-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
              >
                Déposer une annonce
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map(l => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <nav aria-label="Pagination" className="flex justify-center items-center gap-3 mt-10">
              {page > 1 && (
                <Link
                  href={`${urlBase}?page=${page - 1}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  ← Précédent
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {page} / {pages}
              </span>
              {page < pages && (
                <Link
                  href={`${urlBase}?page=${page + 1}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  Suivant →
                </Link>
              )}
            </nav>
          )}

          {/* Liens internes — villes */}
          {r.type === 'ville' && (
            <section className="mt-10 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">
                Petites annonces dans d'autres villes
              </h2>
              <div className="flex flex-wrap gap-2">
                {VILLES.filter(v => v.slug !== r.data.slug).map(v => (
                  <Link
                    key={v.slug}
                    href={`/petites-annonces-${v.slug}`}
                    className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    {v.labelFr}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Liens internes — catégories */}
          {r.type === 'categorie' && (
            <section className="mt-10 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">
                Explorer d'autres catégories en Espagne
              </h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_SEO.filter(c => c.seoSlug !== r.data.seoSlug).map(c => (
                  <Link
                    key={c.seoSlug}
                    href={`/${c.seoSlug}`}
                    className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Liens croisés ville → catégories */}
          {r.type === 'ville' && (
            <section className="mt-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">
                Catégories populaires en Espagne
              </h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_SEO.map(c => (
                  <Link
                    key={c.seoSlug}
                    href={`/${c.seoSlug}`}
                    className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
