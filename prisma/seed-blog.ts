import { PrismaClient } from '@prisma/client'
import type { BlogSeedPost } from './blog-belgique/types'
import { POSTS as FR } from './blog-belgique/fr'
import { POSTS as EN } from './blog-belgique/en'
import { POSTS as ES } from './blog-belgique/es'
import { POSTS as DE } from './blog-belgique/de'
import { POSTS as NL } from './blog-belgique/nl'

// Seeds the Belgium blog (5 languages). Upserts by slug, so re-running it
// refreshes the articles. With --replace, every post NOT in this list is
// deleted — that is how the old Spain-era articles were removed.
//
//   npx tsx --env-file=.env.local prisma/seed-blog.ts [--replace]

const prisma = new PrismaClient()

const COVERS: Record<BlogSeedPost['topic'], string> = {
  installation: '/brussels-hero.png',
  location: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  sante: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
  ecole: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
  voiture: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80',
  'cout-de-la-vie': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  'seconde-main': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  langues: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
}

const AUTHORS: Record<BlogSeedPost['lang'], string> = {
  fr: 'Équipe 1000Click',
  en: '1000Click Team',
  es: 'Equipo 1000Click',
  de: '1000Click-Team',
  nl: '1000Click-team',
}

const POSTS = [...FR, ...EN, ...ES, ...DE, ...NL]

async function main() {
  const slugs = POSTS.map(p => p.slug)
  if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate slug in blog-belgique')

  for (const { topic, publishedAt, ...post } of POSTS) {
    const data = {
      ...post,
      coverImage: COVERS[topic],
      author: AUTHORS[post.lang],
      published: true,
      publishedAt: new Date(publishedAt),
    }
    await prisma.blogPost.upsert({ where: { slug: post.slug }, create: data, update: data })
    console.log(`✅ ${post.lang} ${post.slug}`)
  }

  if (process.argv.includes('--replace')) {
    const { count } = await prisma.blogPost.deleteMany({ where: { slug: { notIn: slugs } } })
    console.log(`🗑  ${count} ancien(s) article(s) supprimé(s)`)
  }

  console.log(`\nBlog : ${POSTS.length} articles`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
