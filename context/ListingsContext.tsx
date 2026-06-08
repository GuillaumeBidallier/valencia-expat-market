'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Listing, NewListing } from '@/types'
import { mockListings } from '@/data/listings'
import { useAuth } from './AuthContext'

interface ListingsContextType {
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  addListing: (data: NewListing) => string
}

const ListingsContext = createContext<ListingsContextType | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const { user } = useAuth()

  const getListing = (id: string) => listings.find(l => l.id === id)

  const addListing = (data: NewListing): string => {
    const id = `new-${Date.now()}`
    const newListing: Listing = {
      ...data,
      id,
      city: 'Valencia',
      images: ['https://picsum.photos/seed/new1/800/600'],
      phone: data.whatsapp,
      publishedAt: new Date().toISOString(),
      status: 'active',
      userId: user?.id || 'demo',
      userName: user?.name || 'Utilisateur',
    }
    setListings(prev => [newListing, ...prev])
    return id
  }

  return (
    <ListingsContext.Provider value={{ listings, getListing, addListing }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
