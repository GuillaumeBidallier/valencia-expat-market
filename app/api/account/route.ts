import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = session.user.id

  // Cancel any active Stripe subscription before removing the Professional row,
  // otherwise Stripe keeps billing with no dashboard left to manage it from.
  const professional = await prisma.professional.findUnique({ where: { userId } })
  if (professional?.stripeSubscriptionId) {
    await getStripe().subscriptions.cancel(professional.stripeSubscriptionId).catch(() => {})
  }

  // Listings owned by the user — cascades ListingImage, Message, Favorite, Report tied to them
  await prisma.listing.deleteMany({ where: { userId } })
  // Favorites the user placed on other people's listings
  await prisma.favorite.deleteMany({ where: { userId } })
  await prisma.passwordResetToken.deleteMany({ where: { userId } })
  await prisma.photoUpgrade.deleteMany({ where: { userId } })
  await prisma.professional.deleteMany({ where: { userId } })

  // Anonymize rather than hard-delete the User row: Message.sender/receiver on threads
  // tied to OTHER users' listings still reference this id and have no cascade rule.
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: 'Utilisateur supprimé',
      email: `deleted-${userId}@deleted.vendo.es`,
      passwordHash: `deleted-${Math.random().toString(36).slice(2)}`,
      blocked: true,
    },
  })

  return NextResponse.json({ ok: true })
}
