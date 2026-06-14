import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Clock, ArrowRight } from 'lucide-react'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Blog — Vendo',
  description: 'Guides pratiques, conseils et actualités pour les expatriés francophones en Espagne.',
  alternates: { canonical: `${BASE}/blog` },
}

const CATEGORIES = ['guide', 'conseils', 'vie-pratique', 'actualites'] as const
type Cat = typeof CATEGORIES[number]

function formatDate(d: Date | null) {
  if (!d) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

type PageProps = { searchParams: Promise<{ cat?: string }> }

export default async function BlogPage({ searchParams }: PageProps) {
  const { cat } = await searchParams
  const [t, locale] = await Promise.all([getTranslations('Blog'), getLocale()])

  // Show posts in current language, fall back to French if none exist
  const langFilter = { published: true, lang: locale, ...(cat ? { category: cat } : {}) }
  let posts = await prisma.blogPost.findMany({ where: langFilter, orderBy: { publishedAt: 'desc' } })
  if (posts.length === 0 && locale !== 'fr') {
    posts = await prisma.blogPost.findMany({
      where: { published: true, lang: 'fr', ...(cat ? { category: cat } : {}) },
      orderBy: { publishedAt: 'desc' },
    })
  }

  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <div className="relative overflow-hidden min-h-[300px] sm:min-h-[360px]">
        <Image
          src="/valencia-hero.jpg"
          alt="Blog Vendo — expatriés en Espagne"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/92 via-hero-dark/65 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/60" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex flex-col justify-center min-h-[300px] sm:min-h-[360px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Vendo</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">{t('title')}</h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl">{t('subtitle')}</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          <Link href="/blog" className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!cat ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t('all')}
          </Link>
          {CATEGORIES.map(c => (
            <Link key={c} href={`/blog?cat=${c}`} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat === c ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t(`cat_${c}` as Parameters<typeof t>[0])}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-xl font-black text-navy mb-2">{t('empty_title')}</p>
            <p className="text-gray-400 text-sm">{t('empty_sub')}</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                <div className="grid sm:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 hover:shadow-xl transition-shadow">
                  <div className="relative h-56 sm:h-auto bg-gradient-to-br from-navy to-indigo-700">
                    {featured.coverImage && (
                      <Image src={featured.coverImage} alt={featured.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-4 left-4 bg-orange-primary text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      {t(`cat_${featured.category}` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <div className="bg-white p-6 sm:p-8 flex flex-col justify-center">
                    <h2 className="text-xl sm:text-2xl font-black text-navy leading-tight mb-3 group-hover:text-orange-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{t('read_time', { n: featured.readTime })}</span>
                      </div>
                      <span className="flex items-center gap-1 font-semibold text-orange-primary group-hover:gap-2 transition-all">
                        {t('read_more')} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative h-44 bg-gradient-to-br from-navy/80 to-indigo-700 shrink-0">
                      {post.coverImage && (
                        <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 bg-white/90 text-navy text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {t(`cat_${post.category}` as Parameters<typeof t>[0])}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-black text-navy text-sm leading-snug mb-2 line-clamp-2 group-hover:text-orange-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          {t('read_time', { n: post.readTime })}
                        </div>
                        <span className="text-gray-300">{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
