export interface Listing {
  id: string
  title: string
  category: string
  categorySlug: string
  price: number | null
  description: string
  images: string[]
  neighborhood: string
  city: string
  whatsapp: string
  phone: string
  publishedAt: string
  status: 'active' | 'sold' | 'expired'
  userId: string
  userName: string
}

export interface NewListing {
  title: string
  category: string
  categorySlug: string
  price: number | null
  description: string
  neighborhood: string
  whatsapp: string
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
