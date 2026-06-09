export interface Listing {
  id: string
  title: string
  description: string
  price: number | null
  categorySlug: string
  city: string
  neighborhood: string
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'DELETED'
  userId: string
  user?: { name: string }
  images: { id: string; url: string; order: number }[]
  isPremium: boolean
  boostExpiresAt: string | null
  featuredAt: string | null
  publishedAt: string
  updatedAt: string
  // Champs de compatibilité frontend
  category?: string
  whatsapp?: string
  phone?: string
  userName?: string
}

export interface NewListing {
  title: string
  categorySlug: string
  price: number | null
  description: string
  neighborhood: string
  whatsapp?: string
}

export interface User {
  id: string
  name: string
  email: string
  subscriptionStatus: 'active' | 'expired'
  subscriptionRenewal: string
}

export interface Category {
  label: string
  slug: string
  icon: string
}
