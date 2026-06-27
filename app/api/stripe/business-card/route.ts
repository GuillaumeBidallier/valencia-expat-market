import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export const BUSINESS_CARD_PLANS = {
  monthly: { amount: 399, label: 'Carte de visite numérique — 3,99 €/mois', mode: 'subscription' as const },
}

export type BusinessCardPlan = keyof typeof BUSINESS_CARD_PLANS

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { plan } = await req.json() as { plan: BusinessCardPlan }
  if (!BUSINESS_CARD_PLANS[plan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { businessCard: true },
  })
  if (!pro) return NextResponse.json({ error: 'Fiche professionnelle introuvable' }, { status: 404 })

  // Already active?
  if (pro.businessCard?.active) {
    return NextResponse.json({ error: 'Carte de visite déjà active' }, { status: 400 })
  }

  const planInfo = BUSINESS_CARD_PLANS[plan]
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const stripe = getStripe()

  type CheckoutParams = Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0]

  const lineItem = {
    price_data: {
      currency: 'eur',
      product_data: { name: planInfo.label },
      unit_amount: planInfo.amount,
      recurring: { interval: 'month' as const },
    },
    quantity: 1,
  }

  const checkoutParams: CheckoutParams = {
    mode: 'subscription' as const,
    line_items: [lineItem],
    success_url: `${baseUrl}/mon-compte/profil-pro?carte=success`,
    cancel_url: `${baseUrl}/mon-compte/profil-pro`,
    locale: 'fr',
    metadata: {
      type: 'business_card',
      professionalId: pro.id,
      plan,
    },
  }

  // Reuse existing Stripe customer if available
  const customerId = pro.stripeCustomerId ?? pro.businessCard?.stripeCustomerId
  if (customerId) {
    checkoutParams.customer = customerId
  } else {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    checkoutParams.customer_email = user?.email ?? undefined
  }

  const checkout = await stripe.checkout.sessions.create(checkoutParams)
  return NextResponse.json({ url: checkout.url })
}
