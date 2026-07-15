import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminCategoriesClient from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: { orderBy: { order: 'asc' } },
    },
  })

  // Count listings for each slug (roots and subs)
  const counts = await prisma.listing.groupBy({ by: ['categorySlug'], _count: { id: true } })
  const countBySlug = Object.fromEntries(counts.map(c => [c.categorySlug, c._count.id]))

  return (
    <AdminCategoriesClient
      initialTree={categories.map(cat => ({
        id:           cat.id,
        slug:         cat.slug,
        label:        cat.label,
        icon:         cat.icon,
        order:        cat.order,
        listingCount: countBySlug[cat.slug] ?? 0,
        children:     cat.children.map(sub => ({
          id:           sub.id,
          slug:         sub.slug,
          label:        sub.label,
          icon:         sub.icon,
          order:        sub.order,
          listingCount: countBySlug[sub.slug] ?? 0,
        })),
      }))}
    />
  )
}
