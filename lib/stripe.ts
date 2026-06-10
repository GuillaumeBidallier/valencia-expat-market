import Stripe from 'stripe'

export const PHOTO_UPGRADE_PRICE_CENTS = 799 // 7.99€
export const PHOTO_UPGRADE_EXTRA = 3
export const FREE_MAX_PHOTOS = 3
export const UPGRADED_MAX_PHOTOS = FREE_MAX_PHOTOS + PHOTO_UPGRADE_EXTRA

// Lazy init — safe at build time when env var is absent
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}
