import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminCategoriesClient from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  const counts = await prisma.listing.groupBy({ by: ['categorySlug'], _count: { id: true } })
  const countBySlug = Object.fromEntries(counts.map(c => [c.categorySlug, c._count.id]))

  return (
    <AdminCategoriesClient
      initialCategories={categories.map(c => ({
        id: c.id, slug: c.slug, label: c.label, icon: c.icon, order: c.order,
        listingCount: countBySlug[c.slug] ?? 0,
      }))}
    />
  )
}
