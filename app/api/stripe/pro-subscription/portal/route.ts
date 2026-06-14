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

  if (!pro?.stripeCustomerId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const portal = await getStripe().billingPortal.sessions.create({
    customer: pro.stripeCustomerId,
    return_url: `${baseUrl}/mon-compte`,
  })

  return NextResponse.json({ url: portal.url })
}
