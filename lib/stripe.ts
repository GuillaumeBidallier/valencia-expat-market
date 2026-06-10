import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PHOTO_UPGRADE_PRICE_CENTS = 199 // 1.99€
export const PHOTO_UPGRADE_EXTRA = 3
export const FREE_MAX_PHOTOS = 3
export const UPGRADED_MAX_PHOTOS = FREE_MAX_PHOTOS + PHOTO_UPGRADE_EXTRA
