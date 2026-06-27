import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripe, PRO_PLANS, type ProPlan } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string

      // ── Business card subscription ────────────────────────
      if (session.metadata?.type === 'business_card') {
        const professionalId = session.metadata.professionalId
        if (!professionalId) break

        const subscriptionId = session.subscription as string
        const sub = await getStripe().subscriptions.retrieve(subscriptionId)
        const periodEnd = sub.items.data[0]?.current_period_end

        await prisma.businessCard.upsert({
          where: { professionalId },
          create: {
            professionalId,
            plan: 'monthly',
            active: true,
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: sub.status,
            subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
          update: {
            plan: 'monthly',
            active: true,
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: sub.status,
            subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        })
        break
      }

      // ── Pro subscription ──────────────────────────────────
      if (session.mode !== 'subscription') break

      const plan = session.metadata?.plan as ProPlan | undefined
      const professionalId = session.metadata?.professionalId
      if (!plan || !professionalId || !PRO_PLANS[plan]) break

      const planInfo = PRO_PLANS[plan]
      const subscriptionId = session.subscription as string

      // In API 2026-05-27.dahlia, current_period_end is on each SubscriptionItem
      const sub = await getStripe().subscriptions.retrieve(subscriptionId)
      const periodEnd = sub.items.data[0]?.current_period_end

      await prisma.professional.update({
        where: { id: professionalId },
        data: {
          tier: planInfo.tier,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: sub.status,
          subscriptionPeriod: planInfo.period,
          subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const pro = await prisma.professional.findFirst({
        where: { stripeSubscriptionId: sub.id },
      })
      if (!pro) break

      const priceId = sub.items.data[0]?.price.id
      const periodEnd = sub.items.data[0]?.current_period_end

      let tier: 'PREMIUM' | 'PREMIUM_PLUS' | 'FREE' = 'FREE'
      let period: 'monthly' | 'annual' | null = null

      for (const planInfo of Object.values(PRO_PLANS)) {
        if (process.env[planInfo.priceEnvKey] === priceId) {
          tier = planInfo.tier
          period = planInfo.period
          break
        }
      }

      await prisma.professional.update({
        where: { id: pro.id },
        data: {
          tier: sub.status === 'active' ? tier : 'FREE',
          subscriptionStatus: sub.status,
          subscriptionPeriod: period,
          subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      // Business card subscription cancelled
      const bcCancelled = await prisma.businessCard.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (bcCancelled) {
        await prisma.businessCard.update({
          where: { id: bcCancelled.id },
          data: { active: false, subscriptionStatus: 'canceled' },
        })
        break
      }

      // Pro subscription cancelled
      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          subscriptionStatus: 'canceled',
          subscriptionCurrentPeriodEnd: null,
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      // In API 2026-05-27.dahlia, subscription is accessed via invoice.parent.subscription_details
      const invoice = event.data.object as Stripe.Invoice
      const subRef = invoice.parent?.subscription_details?.subscription
      const subId = typeof subRef === 'string' ? subRef : subRef?.id
      if (!subId) break

      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: subId },
        data: { subscriptionStatus: 'past_due' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
