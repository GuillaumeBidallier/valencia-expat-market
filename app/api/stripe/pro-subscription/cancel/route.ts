import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })

  if (!pro?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  // L'accès reste actif jusqu'à la fin de la période payée
  await getStripe().subscriptions.update(pro.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  return NextResponse.json({ ok: true })
}
