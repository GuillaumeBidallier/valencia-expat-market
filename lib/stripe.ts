import Stripe from 'stripe'

export const PHOTO_UPGRADE_PRICE_CENTS = 799
export const PHOTO_UPGRADE_EXTRA = 9
export const FREE_MAX_PHOTOS = 3
export const UPGRADED_MAX_PHOTOS = FREE_MAX_PHOTOS + PHOTO_UPGRADE_EXTRA
/** Soft cap used for VIP pros' "unlimited" photos, in their own trade's listings. */
export const VIP_UNLIMITED_PHOTOS = 100

export type ProPlan = 'smart_annual' | 'pro_annual' | 'vip_annual'

export const PRO_PLANS: Record<ProPlan, {
  priceEnvKey: string
  tier: 'PREMIUM' | 'PREMIUM_PLUS' | 'VIP'
  period: 'monthly' | 'annual'
  label: string
  amount: number
}> = {
  smart_annual: { priceEnvKey: 'STRIPE_PRICE_SMART_ANNUAL', tier: 'PREMIUM',      period: 'annual', label: 'Smart', amount: 9900  },
  pro_annual:   { priceEnvKey: 'STRIPE_PRICE_PRO_ANNUAL',   tier: 'PREMIUM_PLUS', period: 'annual', label: 'Pro',   amount: 29900 },
  vip_annual:   { priceEnvKey: 'STRIPE_PRICE_VIP_ANNUAL',   tier: 'VIP',          period: 'annual', label: 'VIP',   amount: 49900 },
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
