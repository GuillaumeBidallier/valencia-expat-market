import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Clock, Calendar, User, ArrowLeft } from 'lucide-react'
import BlogContent from './BlogContent'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) return { title: 'Article introuvable' }
  const url = `${BASE}/blog/${slug}`
  return {
    title: `${post.title} — Vendo Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
      ...(post.coverImage && { images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] }),
    },
  }
}

function formatDate(d: Date | null) {
  if (!d) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const t = await getTranslations('Blog')

  const [post, related] = await Promise.all([
    prisma.blogPost.findUnique({ where: { slug, published: true } }),
    prisma.blogPost.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
  ])

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${BASE}/blog/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Vendo',
      url: BASE,
    },
    ...(post.coverImage && { image: post.coverImage }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#f7f8fa]">

        {/* Hero */}
        <div className="relative h-64 sm:h-96 bg-gradient-to-br from-navy to-indigo-800 overflow-hidden">
          {post.coverImage && (
            <Image src={post.coverImage} alt={post.title} fill sizes="100vw" className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          <div className="absolute top-4 left-4 sm:top-6 sm:left-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-colors">
              <ArrowLeft size={13} /> {t('back')}
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-8">
              <span className="inline-block bg-orange-primary text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                {t(`cat_${post.category}` as Parameters<typeof t>[0])}
              </span>
              <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight drop-shadow-lg">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(post.publishedAt)}</span>
            )}
            <span className="flex items-center gap-1.5"><Clock size={12} /> {t('read_time', { n: post.readTime })}</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
          <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 border-l-4 border-orange-primary pl-4">
            {post.excerpt}
          </p>
          <BlogContent content={post.content} />
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <p className="text-[11px] font-black text-orange-primary uppercase tracking-widest mb-6">{t('related')}</p>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group flex gap-4 items-start hover:opacity-80 transition-opacity">
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-navy/10">
                      {r.coverImage && (
                        <Image src={r.coverImage} alt={r.title} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy line-clamp-2 group-hover:text-orange-primary transition-colors leading-snug">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {t('read_time', { n: r.readTime })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
