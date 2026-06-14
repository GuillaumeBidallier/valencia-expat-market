import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: ProPlan }
  if (!PRO_PLANS[plan]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })
  if (!pro) {
    return NextResponse.json({ error: 'Fiche professionnelle introuvable' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  type CheckoutParams = Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0]

  const checkoutParams: CheckoutParams = {
    mode: 'subscription',
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: `${baseUrl}/mon-compte?subscription=success`,
    cancel_url: `${baseUrl}/publicite`,
    locale: 'fr',
    metadata: {
      professionalId: pro.id,
      plan,
    },
  }

  if (pro.stripeCustomerId) {
    checkoutParams.customer = pro.stripeCustomerId
  } else {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    checkoutParams.customer_email = user?.email ?? undefined
  }

  const checkout = await getStripe().checkout.sessions.create(checkoutParams)

  return NextResponse.json({ url: checkout.url })
}
