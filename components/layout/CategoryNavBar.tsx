'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  transparent: boolean
}

export default function CategoryNavBar({ transparent }: Props) {
  const categories = useCategories()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveSlug(slug)
  }

  const close = () => {
    timeoutRef.current = setTimeout(() => setActiveSlug(null), 120)
  }

  const stay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const activeCategory = categories.find(c => c.slug === activeSlug)

  return (
    <div
      className={`hidden md:block border-b transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-white/10'
          : 'bg-white border-gray-100'
      }`}
      onMouseLeave={close}
    >
      {/* Category bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat, i) => (
            <span key={cat.slug} className="flex items-center shrink-0">
              {i > 0 && (
                <span
                  className={`mx-2.5 text-xs select-none ${transparent ? 'text-white/30' : 'text-gray-300'}`}
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
              <Link
                href={`/annonces?category=${cat.slug}`}
                className={`text-sm whitespace-nowrap py-2 border-b-2 transition-colors font-medium ${
                  activeSlug === cat.slug
                    ? 'text-orange-primary border-orange-primary'
                    : transparent
                    ? 'text-white/80 border-transparent hover:text-white hover:border-white/50'
                    : 'text-gray-700 border-transparent hover:text-orange-primary hover:border-orange-primary'
                }`}
                onMouseEnter={() => open(cat.slug)}
                onClick={() => setActiveSlug(null)}
              >
                {cat.label}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* Mega dropdown */}
      {activeCategory && (
        <div
          className="absolute left-0 right-0 bg-gray-50 border-b border-gray-200 shadow-xl z-40"
          onMouseEnter={stay}
          onMouseLeave={close}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-10">
              {/* Left: icon + name + "tout voir" */}
              <div className="shrink-0 w-44">
                <div className="flex items-center gap-2.5 border-l-4 border-orange-primary pl-3 mb-3">
                  <span className="text-2xl leading-none">{activeCategory.icon}</span>
                  <span className="font-black text-navy text-sm leading-tight">{activeCategory.label}</span>
                </div>
                <Link
                  href={`/annonces?category=${activeCategory.slug}`}
                  className="text-xs text-orange-primary font-semibold hover:underline"
                  onClick={() => setActiveSlug(null)}
                >
                  Tout {activeCategory.label}
                </Link>
              </div>

              {/* Right: subcategories in columns */}
              {activeCategory.children.length > 0 ? (
                <div
                  className="flex-1"
                  style={{ columns: Math.min(4, Math.ceil(activeCategory.children.length / 4)), columnGap: '2rem' }}
                >
                  {activeCategory.children.map(child => (
                    <Link
                      key={child.slug}
                      href={`/annonces?category=${child.slug}`}
                      className="block text-sm text-gray-800 font-semibold mb-3 hover:text-orange-primary transition-colors break-inside-avoid"
                      onClick={() => setActiveSlug(null)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-gray-400 italic">
                    Parcourir toutes les annonces · {activeCategory.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
