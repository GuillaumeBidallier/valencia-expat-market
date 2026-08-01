'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, LocateFixed, Loader2, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { neighborhoods } from '@/lib/neighborhoods'
import { useCategories } from '@/hooks/useCategories'
import type { CategoryTree } from '@/types'
import FilterDropdown from '@/components/ui/FilterDropdown'
import VehicleAttributesFilters, { hasBrandModelField, countActiveVehicleFilters } from '@/components/listings/VehicleAttributesFilters'

const RADII = [
  { label: '5 km',  value: '5'  },
  { label: '10 km', value: '10' },
  { label: '20 km', value: '20' },
  { label: '50 km', value: '50' },
]

function findCategoryLabel(categories: CategoryTree[], slug: string): string | null {
  for (const root of categories) {
    if (root.slug === slug) return root.label
    for (const sub of root.children) {
      if (sub.slug === slug) return sub.label
      const subsub = sub.children.find(c => c.slug === slug)
      if (subsub) return subsub.label
    }
  }
  return null
}

function CategoryPickerPanel({
  cat,
  categories,
  onUpdate,
  onClose,
}: {
  cat: string
  categories: CategoryTree[]
  onUpdate: (key: string, value: string) => void
  onClose?: () => void
}) {
  const t = useTranslations('Filters')
  const activeRoot = categories.find(r =>
    r.slug === cat || r.children.some(c => c.slug === cat || c.children.some(g => g.slug === cat))
  ) ?? null
  const activeSub = activeRoot?.children.find(c => c.slug === cat || c.children.some(g => g.slug === cat)) ?? null
  const [openRootSlug, setOpenRootSlug] = useState<string | null>(activeRoot?.slug ?? null)
  const [openSubSlug, setOpenSubSlug] = useState<string | null>(activeSub?.slug ?? null)

  const handleRootClick = (root: CategoryTree) => {
    if (root.children.length === 0) {
      onUpdate('cat', root.slug === cat ? '' : root.slug)
      setOpenRootSlug(root.slug === openRootSlug ? null : root.slug)
      if (root.slug !== cat) onClose?.()
    } else {
      if (openRootSlug === root.slug) {
        setOpenRootSlug(null)
        setOpenSubSlug(null)
        onUpdate('cat', '')
      } else {
        setOpenRootSlug(root.slug)
        setOpenSubSlug(null)
        if (activeRoot?.slug !== root.slug) onUpdate('cat', '')
      }
    }
  }

  const handleSubClick = (sub: CategoryTree) => {
    if (sub.children.length === 0) {
      onUpdate('cat', sub.slug === cat ? '' : sub.slug)
      onClose?.()
      return
    }
    if (openSubSlug === sub.slug) {
      setOpenSubSlug(null)
      onUpdate('cat', '')
    } else {
      setOpenSubSlug(sub.slug)
      onUpdate('cat', sub.slug)
    }
  }

  const handleSubSubClick = (subSubSlug: string) => {
    onUpdate('cat', subSubSlug === cat ? '' : subSubSlug)
    onClose?.()
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <button
        onClick={() => { onUpdate('cat', ''); setOpenRootSlug(null); setOpenSubSlug(null); onClose?.() }}
        className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1.5 font-medium transition-colors ${
          !cat ? 'bg-orange-soft text-orange-primary font-bold' : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        {t('all_categories')}
      </button>

      <div className="space-y-1">
        {categories.map(root => {
          const isOpen     = openRootSlug === root.slug
          const rootActive = root.slug === cat
          const subActive  = root.children.some(c => c.slug === cat || c.children.some(g => g.slug === cat))
          const anyActive  = rootActive || subActive

          return (
            <div key={root.slug}>
              <button
                onClick={() => handleRootClick(root)}
                className={`w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                  anyActive ? 'bg-orange-soft text-orange-primary font-bold' : 'text-navy hover:bg-gray-50'
                }`}
              >
                <span className="shrink-0">{root.icon}</span>
                <span className="flex-1 truncate">{root.label}</span>
                {root.children.length > 0 && (
                  <ChevronRight size={12} className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                )}
              </button>

              {isOpen && root.children.length > 0 && (
                <div className="pl-6 mt-0.5 space-y-0.5">
                  {root.children.map(sub => {
                    const isSubOpen = openSubSlug === sub.slug
                    const subActiveHere = sub.slug === cat || sub.children.some(g => g.slug === cat)
                    return (
                      <div key={sub.slug}>
                        <button
                          onClick={() => handleSubClick(sub)}
                          className={`w-full flex items-center gap-1.5 text-left text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                            subActiveHere ? 'bg-orange-primary text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{sub.icon}</span>
                          <span className="flex-1 truncate">{sub.label}</span>
                          {sub.children.length > 0 && (
                            <ChevronRight size={11} className={`shrink-0 transition-transform ${isSubOpen ? 'rotate-90' : ''}`} />
                          )}
                        </button>

                        {isSubOpen && sub.children.length > 0 && (
                          <div className="pl-5 mt-0.5 space-y-0.5">
                            {sub.children.map(subsub => (
                              <button
                                key={subsub.slug}
                                onClick={() => handleSubSubClick(subsub.slug)}
                                className={`w-full flex items-center gap-1.5 text-left text-[11px] px-2 py-1.5 rounded-lg font-medium transition-colors ${
                                  subsub.slug === cat ? 'bg-orange-primary text-white font-bold' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <span>{subsub.icon}</span>
                                <span className="truncate">{subsub.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnnoncesFilters() {
  const t = useTranslations('Filters')
  const categories = useCategories()
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const brand    = searchParams.get('attr_brand') ?? ''

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

  const categoryLabel = cat ? (findCategoryLabel(categories, cat) ?? cat) : t('all_categories')
  const locationLabel = hasLocation ? t('position_active') : ville || t('my_position')
  const priceLabel = priceMin || priceMax
    ? `${priceMin || '0'}€ - ${priceMax || '∞'}€`
    : t('price')
  const sortLabel = sort === 'distance' ? t('sort_nearest')
    : sort === 'price_asc' ? t('sort_price_asc')
    : sort === 'price_desc' ? t('sort_price_desc')
    : t('sort_by')

  const showBrandButton = cat && hasBrandModelField(cat)
  const vehicleFilterCount = cat ? countActiveVehicleFilters(cat, searchParams) : 0

  const locationPanel = (
    <div className="space-y-4">
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
    </div>
  )

  const pricePanel = (
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
  )

  const sortPanel = (
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
  )

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown label={categoryLabel} active={Boolean(cat)}>
          <CategoryPickerPanel cat={cat} categories={categories} onUpdate={update} />
        </FilterDropdown>

        <FilterDropdown label={locationLabel} active={Boolean(ville || hasLocation)}>
          {locationPanel}
        </FilterDropdown>

        <FilterDropdown label={priceLabel} active={Boolean(priceMin || priceMax)}>
          {pricePanel}
        </FilterDropdown>

        {showBrandButton && (
          <FilterDropdown label={brand ? brand.replace(/-/g, ' ') : t('brand')} active={Boolean(brand)} panelClassName="w-[28rem]">
            <VehicleAttributesFilters cat={cat} searchParams={searchParams} onUpdate={update} mode="brand" />
          </FilterDropdown>
        )}

        {cat && (
          <FilterDropdown label={t('title')} badge={vehicleFilterCount} align="right" panelClassName="w-80">
            <VehicleAttributesFilters cat={cat} searchParams={searchParams} onUpdate={update} mode="rest" />
          </FilterDropdown>
        )}

        <FilterDropdown label={sortLabel} active={Boolean(sort)} align="right">
          {sortPanel}
        </FilterDropdown>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-red-500 font-semibold px-3 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors ml-auto"
          >
            <X size={12} /> {t('clear_filters', { count: activeCount })}
          </button>
        )}
      </div>
    </div>
  )
}
