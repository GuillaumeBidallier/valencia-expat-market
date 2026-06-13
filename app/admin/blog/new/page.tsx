import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import BlogEditor from '../BlogEditor'

export default async function NewBlogPostPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center gap-3">
          <a href="/admin/blog" className="text-white/60 hover:text-white text-sm transition-colors">← Blog</a>
          <span className="text-white/20">/</span>
          <h1 className="text-lg font-black">Nouvel article</h1>
        </div>
      </div>
      <BlogEditor isNew />
    </div>
  )
}
