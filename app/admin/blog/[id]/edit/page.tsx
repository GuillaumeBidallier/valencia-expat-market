import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import BlogEditor from '../../BlogEditor'

type Props = { params: Promise<{ id: string }> }

export default async function EditBlogPostPage({ params }: Props) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center gap-3">
          <a href="/admin/blog" className="text-white/60 hover:text-white text-sm transition-colors">← Blog</a>
          <span className="text-white/20">/</span>
          <h1 className="text-lg font-black truncate">{post.title || 'Modifier l\'article'}</h1>
        </div>
      </div>
      <BlogEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? '',
          category: post.category,
          author: post.author,
          readTime: post.readTime,
          lang: post.lang,
          published: post.published,
        }}
      />
    </div>
  )
}
