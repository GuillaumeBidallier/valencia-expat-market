'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, LocateFixed, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { neighborhoods } from '@/lib/categories'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  totalCount: number
}

const RADII = [
  { label: '5 km',  value: '5'  },
  { label: '10 km', value: '10' },
  { label: '20 km', value: '20' },
  { label: '50 km', value: '50' },
]

export default function AnnoncesFilters({ totalCount }: Props) {
  const t = useTranslations('Filters')
  const categories = useCategories()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobile, setShowMobile] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  const cat      = searchParams.get('cat')      ?? ''
  const ville    = searchParams.get('ville')    ?? ''
  const priceMin = searchParams.get('priceMin') ?? ''
  const priceMax = searchParams.get('priceMax') ?? ''
  const sort     = searchParams.get('sort')     ?? ''
  const lat      = searchParams.get('lat')      ?? ''
  const lng      = searchParams.get('lng')      ?? ''
  const radius   = searchParams.get('radius')   ?? '10'

  const hasLocation = Boolean(lat && lng)
  const activeCount = [cat, ville, priceMin, priceMax, hasLocation ? 'loc' : ''].filter(Boolean).length

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    params.delete('page')
    router.push(`/annonces?${params.toString()}`)
  }, [router, searchParams])

  const applyPrice = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString())
    min ? params.set('priceMin', min) : params.delete('priceMin')
    max ? params.set('priceMax', max) : params.delete('priceMax')
    params.delete('page')
    router.push(`/annonces?${params.toString()}`)
  }

  const clearLocation = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
    params.delete('page')
    router.push(`/annonces?${params.toString()}`)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoError(t('geo_not_supported')); return }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('lat', pos.coords.latitude.toFixed(5))
        params.set('lng', pos.coords.longitude.toFixed(5))
        params.set('radius', radius || '10')
        params.set('geoLabel', t('my_position'))
        params.delete('page')
        router.push(`/annonces?${params.toString()}`)
        setGeoLoading(false)
      },
      () => {
        setGeoError(t('geo_denied'))
        setGeoLoading(false)
      }
    )
  }

  const clearAll = () => {
    const q = searchParams.get('q')
    router.push(q ? `/annonces?q=${encodeURIComponent(q)}` : '/annonces')
  }

  const filtersContent = (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('category')}</label>
        <select
          value={cat}
          onChange={e => update('cat', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
        >
          <option value="">{t('all_categories')}</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('neighborhood')}</label>
        <select
          value={ville}
          onChange={e => update('ville', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
        >
          <option value="">{t('all_neighborhoods')}</option>
          {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Localisation */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('my_position')}</label>
        {hasLocation ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-orange-soft px-3 py-2 rounded-lg">
              <LocateFixed size={13} className="text-orange-primary shrink-0" />
              <span className="text-xs text-orange-primary font-semibold flex-1">{t('position_active')}</span>
              <button onClick={clearLocation} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={13} />
              </button>
            </div>
            <select
              value={radius}
              onChange={e => update('radius', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
            >
              {RADII.map(r => <option key={r.value} value={r.value}>{t('radius_in', { label: r.label })}</option>)}
            </select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={useMyLocation}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 border border-orange-primary/40 text-orange-primary text-xs font-semibold py-2.5 rounded-lg hover:bg-orange-soft transition-colors disabled:opacity-50"
            >
              {geoLoading
                ? <><Loader2 size={13} className="animate-spin" /> {t('locating')}</>
                : <><LocateFixed size={13} /> {t('locate_btn')}</>
              }
            </button>
            {geoError && <p className="text-[11px] text-red-500">{geoError}</p>}
          </div>
        )}
      </div>

      {/* Price range */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('price')}</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={priceMin}
            key={`min-${priceMin}`}
            onBlur={e => applyPrice(e.target.value, priceMax)}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
          />
          <span className="text-gray-300 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={priceMax}
            key={`max-${priceMax}`}
            onBlur={e => applyPrice(priceMin, e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('sort_by')}</label>
        <select
          value={sort}
          onChange={e => update('sort', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
        >
          <option value="">{t('sort_recent')}</option>
          {hasLocation && <option value="distance">{t('sort_nearest')}</option>}
          <option value="price_asc">{t('sort_price_asc')}</option>
          <option value="price_desc">{t('sort_price_desc')}</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-red-500 font-semibold py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
        >
          <X size={12} /> {t('clear_filters', { count: activeCount })}
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-32 shadow-sm">
          <h3 className="font-bold text-navy text-sm mb-4">{t('title')}</h3>
          {filtersContent}
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 font-medium">
            <strong className="text-navy">{totalCount !== 1 ? t('listing_count_plural', { count: totalCount }) : t('listing_count', { count: totalCount })}</strong>
          </span>
          <button
            onClick={() => setShowMobile(v => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-orange-primary border border-orange-primary/30 bg-orange-soft px-3 py-1.5 rounded-lg"
          >
            <SlidersHorizontal size={13} />
            {t('title')}
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-orange-primary text-white rounded-full text-[10px] flex items-center justify-center">{activeCount}</span>
            )}
          </button>
        </div>

        {showMobile && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-navy text-sm">{t('title')}</span>
              <button onClick={() => setShowMobile(false)}><X size={15} className="text-gray-400" /></button>
            </div>
            {filtersContent}
          </div>
        )}
      </div>
    </>
  )
}
