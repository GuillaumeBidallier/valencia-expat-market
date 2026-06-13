'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface Props {
  photos: string[]
  name: string
}

export default function ProGallery({ photos, name }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => (i !== null ? (i - 1 + photos.length) % photos.length : null)), [photos.length])
  const next = useCallback(() => setLightbox(i => (i !== null ? (i + 1) % photos.length : null)), [photos.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [lightbox, close, prev, next])

  const gridClass = photos.length === 1
    ? 'grid-cols-1'
    : photos.length === 2
    ? 'grid-cols-2'
    : photos.length === 3
    ? 'grid-cols-2 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-3'

  return (
    <>
      <div className={`grid ${gridClass} gap-3`}>
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            aria-label={`Voir la photo ${i + 1} de ${name} en grand`}
            className={`group relative overflow-hidden rounded-xl bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary ${
              photos.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/3]'
            } ${i === 0 && photos.length >= 4 ? 'col-span-2 aspect-video sm:col-span-1 sm:aspect-[4/3]' : ''}`}
          >
            <Image
              src={url}
              alt={`${name} — photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightbox + 1} sur ${photos.length} — ${name}`}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Fermer la galerie"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
          >
            <X size={22} aria-hidden="true" />
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              aria-label="Photo précédente"
              className="absolute left-3 sm:left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-10"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 sm:mx-20"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox]}
              alt={`${name} — photo ${lightbox + 1}`}
              fill
              sizes="(max-width: 768px) 90vw, 800px"
              className="object-contain"
              priority
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              aria-label="Photo suivante"
              className="absolute right-3 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-10"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {photos.length <= 8 ? (
              photos.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={i === lightbox}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightbox ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))
            ) : (
              <span className="text-white/70 text-sm">{lightbox + 1} / {photos.length}</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
