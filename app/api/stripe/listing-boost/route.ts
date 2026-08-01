import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, LISTING_BOOST_PRICE_CENTS, LISTING_BOOST_DAYS } from '@/lib/stripe'

// POST — create Stripe Checkout session
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { returnUrl } = await req.json()

  const checkout = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: LISTING_BOOST_PRICE_CENTS,
        product_data: {
          name: 'Annonce urgente',
          description: `Mise en avant "urgent" pendant ${LISTING_BOOST_DAYS} jours`,
        },
      },
      quantity: 1,
    }],
    success_url: `${returnUrl}?boost_session={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    locale: 'fr',
  })

  await prisma.listingBoost.create({
    data: {
      userId: session.user.id,
      stripeSessionId: checkout.id,
    },
  })

  return NextResponse.json({ url: checkout.url })
}

// GET — check if current user has an active (paid, unused) boost
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ hasBoost: false })

  const boost = await prisma.listingBoost.findFirst({
    where: { userId: session.user.id, paid: true, used: false },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ hasBoost: !!boost, boostId: boost?.id ?? null })
}
