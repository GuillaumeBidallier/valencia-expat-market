import Stripe from 'stripe'

export const PHOTO_UPGRADE_PRICE_CENTS = 799
export const PHOTO_UPGRADE_EXTRA = 9
export const FREE_MAX_PHOTOS = 3
export const UPGRADED_MAX_PHOTOS = FREE_MAX_PHOTOS + PHOTO_UPGRADE_EXTRA

export type ProPlan = 'premium_monthly' | 'premium_annual' | 'premium_plus_monthly' | 'premium_plus_annual'

export const PRO_PLANS: Record<ProPlan, {
  priceEnvKey: string
  tier: 'PREMIUM' | 'PREMIUM_PLUS'
  period: 'monthly' | 'annual'
  label: string
  amount: number
}> = {
  premium_monthly:      { priceEnvKey: 'STRIPE_PRICE_PREMIUM_MONTHLY',     tier: 'PREMIUM',      period: 'monthly', label: 'Premium Mensuel',  amount: 4900  },
  premium_annual:       { priceEnvKey: 'STRIPE_PRICE_PREMIUM_ANNUAL',       tier: 'PREMIUM',      period: 'annual',  label: 'Premium Annuel',   amount: 49000 },
  premium_plus_monthly: { priceEnvKey: 'STRIPE_PRICE_PREMIUM_PLUS_MONTHLY', tier: 'PREMIUM_PLUS', period: 'monthly', label: 'Premium+ Mensuel', amount: 9900  },
  premium_plus_annual:  { priceEnvKey: 'STRIPE_PRICE_PREMIUM_PLUS_ANNUAL',  tier: 'PREMIUM_PLUS', period: 'annual',  label: 'Premium+ Annuel',  amount: 99000 },
}

export function getPriceId(plan: ProPlan): string {
  const key = PRO_PLANS[plan].priceEnvKey
  const id = process.env[key]
  if (!id) throw new Error(`Missing env var: ${key}`)
  return id
}

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}
