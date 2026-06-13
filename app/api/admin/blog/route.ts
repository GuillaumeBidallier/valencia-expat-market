import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { title, slug, excerpt, content, coverImage, category, author, readTime, lang, published } = body
  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const post = await prisma.blogPost.create({
    data: {
      title, slug, excerpt, content,
      coverImage: coverImage || null,
      category: category || 'guide',
      author: author || 'Équipe Vendo',
      readTime: readTime ? Number(readTime) : 5,
      lang: lang || 'fr',
      published: !!published,
      publishedAt: published ? new Date() : null,
    },
  })
  return NextResponse.json(post, { status: 201 })
}
