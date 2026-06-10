export interface Listing {
  id: string
  title: string
  description: string
  price: number | null
  categorySlug: string
  city: string
  neighborhood: string
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'DELETED' | 'PENDING' | 'REJECTED'
  userId: string
  user?: { name: string }
  images: { id: string; url: string; order: number }[]
  isPremium: boolean
  boostExpiresAt: string | null
  featuredAt: string | null
  publishedAt: string
  updatedAt: string
  phone?: string | null
  lat?: number | null
  lng?: number | null
  // Champs de compatibilité frontend
  category?: string
  userName?: string
}

export interface NewListing {
  title: string
  categorySlug: string
  price: number | null
  description: string
  neighborhood: string
  lat?: number
  lng?: number
  phone?: string
}

export interface User {
  id: string
  name: string
  email: string
  role?: string
  subscriptionStatus: 'active' | 'expired'
  subscriptionRenewal: string
}

export interface Category {
  label: string
  slug: string
  icon: string
}
