import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import EditListingClient from './EditListingClient'

type Props = { params: Promise<{ id: string }> }

export default async function EditListingPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id, status: { not: 'DELETED' } },
    include: { images: { orderBy: { order: 'asc' } } },
  })

  if (!listing) notFound()
  if (listing.userId !== session.user.id) notFound()

  return (
    <EditListingClient
      listing={{
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price ?? null,
        categorySlug: listing.categorySlug,
        neighborhood: listing.neighborhood,
        phone: listing.phone ?? '',
        images: listing.images.map(img => ({ id: img.id, url: img.url })),
      }}
    />
  )
}
