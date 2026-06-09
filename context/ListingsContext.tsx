'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Listing, NewListing } from '@/types'
import { useAuth } from './AuthContext'

interface ListingsContextType {
  listings: Listing[]
  loading: boolean
  getListing: (id: string) => Listing | undefined
  addListing: (data: NewListing) => Promise<string>
  refreshListings: () => Promise<void>
}

const ListingsContext = createContext<ListingsContextType | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth()

  const refreshListings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/listings?limit=50')
      const data = await res.json()
      setListings(data.listings ?? [])
    } catch (err) {
      console.error('Failed to fetch listings', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refreshListings() }, [refreshListings])

  const getListing = (id: string) => listings.find(l => l.id === id)

  const addListing = async (data: NewListing): Promise<string> => {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, city: 'Valencia' }),
    })
    if (!res.ok) throw new Error('Erreur lors de la création de l\'annonce')
    const listing = await res.json()
    await refreshListings()
    return listing.id
  }

  return (
    <ListingsContext.Provider value={{ listings, loading, getListing, addListing, refreshListings }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
