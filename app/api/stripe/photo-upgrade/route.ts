import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PHOTO_UPGRADE_PRICE_CENTS } from '@/lib/stripe'

// POST — create Stripe Checkout session
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { returnUrl } = await req.json()
  const origin = new URL(returnUrl).origin

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: PHOTO_UPGRADE_PRICE_CENTS,
        product_data: {
          name: '3 photos supplémentaires',
          description: 'Ajoutez jusqu\'à 3 photos de plus à votre annonce (6 au total)',
        },
      },
      quantity: 1,
    }],
    success_url: `${returnUrl}?upgrade_session={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    locale: 'fr',
  })

  await prisma.photoUpgrade.create({
    data: {
      userId: session.user.id,
      stripeSessionId: checkout.id,
    },
  })

  return NextResponse.json({ url: checkout.url })
}

// GET — check if current user has an active (paid, unused) upgrade
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ hasUpgrade: false })

  const upgrade = await prisma.photoUpgrade.findFirst({
    where: { userId: session.user.id, paid: true, used: false },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ hasUpgrade: !!upgrade, upgradeId: upgrade?.id ?? null })
}
