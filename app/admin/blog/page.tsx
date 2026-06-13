import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminBlogClient from './AdminBlogClient'

export default async function AdminBlogPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })

  return <AdminBlogClient posts={posts} />
}
