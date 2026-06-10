'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Props = {
  listingId: string
  initialFavorited?: boolean
  showLabel?: boolean
  className?: string
  iconSize?: number
}

export default function FavoriteButton({ listingId, initialFavorited = false, showLabel = false, className = '', iconSize = 14 }: Props) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { router.push('/connexion'); return }
    setLoading(true)
    const next = !favorited
    setFavorited(next)
    const res = await fetch(`/api/favorites/${listingId}`, {
      method: next ? 'POST' : 'DELETE',
    })
    if (!res.ok && res.status !== 409 && res.status !== 204) setFavorited(!next)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`transition-all disabled:opacity-60 ${className}`}
    >
      <Heart
        size={iconSize}
        className={`shrink-0 transition-colors duration-150 ${
          favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
        }`}
      />
      {showLabel && (
        <span className={`text-sm select-none ${favorited ? 'text-red-500' : 'text-gray-500'}`}>
          {favorited ? 'Annonce sauvegardée' : "Sauvegarder l'annonce"}
        </span>
      )}
    </button>
  )
}
