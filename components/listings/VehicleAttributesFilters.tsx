'use client'
import dynamic from 'next/dynamic'
import { CATEGORY_ATTRIBUTES } from '@/lib/categoryAttributes'

const BrandModelPicker = dynamic(() => import('@/components/ui/BrandModelPicker'), { ssr: false })

interface SearchParamsLike {
  get(key: string): string | null
}

interface Props {
  cat: string
  searchParams: SearchParamsLike
  onUpdate: (key: string, value: string) => void
  /** 'brand' renders only the marque/modèle field, 'rest' renders everything else, 'all' renders both (default). */
  mode?: 'all' | 'brand' | 'rest'
}

export function hasBrandModelField(cat: string): boolean {
  return (CATEGORY_ATTRIBUTES[cat] ?? []).some(f => f.type === 'brand-model')
}

/** Parses the "min-max" / "min-" (open-ended) encoding used for stepper range filters. */
function parseStepperRange(raw: string): { min: number | null; max: number | null; hasValue: boolean } {
  if (!raw) return { min: null, max: null, hasValue: false }
  const [minStr, maxStr] = raw.split('-')
  return {
    min: minStr !== '' ? Number(minStr) : null,
    max: maxStr !== undefined && maxStr !== '' ? Number(maxStr) : null,
    hasValue: true,
  }
}

/** Count of populated non-brand attribute filters, for a "Filtres (n)" badge. */
export function countActiveVehicleFilters(cat: string, searchParams: SearchParamsLike): number {
  const fields = CATEGORY_ATTRIBUTES[cat]
  if (!fields) return 0
  let count = 0
  for (const field of fields) {
    if (field.type === 'brand-model') continue
    if (field.type === 'select') {
      if ((searchParams.get(`attr_${field.key}`) ?? '').split(',').filter(Boolean).length > 0) count++
    } else if (field.type === 'stepper') {
      if (searchParams.get(`attr_${field.key}`)) count++
    } else {
      if (searchParams.get(`attr_${field.key}_min`)) count++
      if (searchParams.get(`attr_${field.key}_max`)) count++
    }
  }
  return count
}

export default function VehicleAttributesFilters({ cat, searchParams, onUpdate, mode = 'all' }: Props) {
  const allFields = CATEGORY_ATTRIBUTES[cat]
  if (!allFields || allFields.length === 0) return null

  const fields = allFields.filter(f =>
    mode === 'all' ? true : mode === 'brand' ? f.type === 'brand-model' : f.type !== 'brand-model'
  )
  if (fields.length === 0) return null

  const toggleMulti = (key: string, value: string) => {
    const current = (searchParams.get(`attr_${key}`) ?? '').split(',').filter(Boolean)
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    onUpdate(`attr_${key}`, next.join(','))
  }

  return (
    <div className="space-y-4">
      {fields.map(field => {
        if (field.type === 'brand-model') {
          return (
            <BrandModelPicker
              key={field.brandKey}
              vehicleType={field.vehicleType}
              brandLabel={field.label}
              brand={searchParams.get(`attr_${field.brandKey}`) ?? ''}
              model={searchParams.get(`attr_${field.modelKey}`) ?? ''}
              onBrandChange={b => { onUpdate(`attr_${field.brandKey}`, b); onUpdate(`attr_${field.modelKey}`, '') }}
              onModelChange={m => onUpdate(`attr_${field.modelKey}`, m)}
            />
          )
        }
        if (field.type === 'select') {
          const selected = (searchParams.get(`attr_${field.key}`) ?? '').split(',').filter(Boolean)
          return (
            <div key={field.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{field.label}</label>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleMulti(field.key, o.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                      selected.includes(o.value)
                        ? 'bg-orange-primary text-white border-orange-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-primary/40'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )
        }
        if (field.type === 'stepper') {
          const raw = searchParams.get(`attr_${field.key}`) ?? ''
          const { min, max, hasValue } = parseStepperRange(raw)
          const maxIsOpen = hasValue && raw.split('-')[1] === ''

          const handleClick = (optValue: number, openEnded?: boolean) => {
            if (!hasValue || min === null) {
              onUpdate(`attr_${field.key}`, openEnded ? `${optValue}-` : `${optValue}-${optValue}`)
              return
            }
            const isSameSingleSelection = optValue === min && (max === min || (maxIsOpen && openEnded))
            if (isSameSingleSelection) {
              onUpdate(`attr_${field.key}`, '')
              return
            }
            if (optValue < min) {
              onUpdate(`attr_${field.key}`, openEnded ? `${optValue}-` : `${optValue}-${optValue}`)
              return
            }
            onUpdate(`attr_${field.key}`, openEnded ? `${min}-` : `${min}-${optValue}`)
          }

          return (
            <div key={field.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">{field.label}</label>
              <p className="text-[11px] text-gray-400 mb-2">Sélectionnez un minimum et un maximum</p>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map(o => {
                  const inRange = hasValue && min !== null && o.value >= min && (maxIsOpen || o.value <= (max ?? min))
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => handleClick(o.value, o.openEnded)}
                      className={`w-9 h-9 rounded-full border text-sm font-semibold transition-colors ${
                        inRange
                          ? 'bg-orange-primary text-white border-orange-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-primary/40'
                      }`}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }
        const minVal = searchParams.get(`attr_${field.key}_min`) ?? ''
        const maxVal = searchParams.get(`attr_${field.key}_max`) ?? ''
        return (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              {field.label}{field.unit ? ` (${field.unit})` : ''}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minVal}
                key={`${field.key}-min-${minVal}`}
                onBlur={e => onUpdate(`attr_${field.key}_min`, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
              />
              <span className="text-gray-300 shrink-0">—</span>
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxVal}
                key={`${field.key}-max-${maxVal}`}
                onBlur={e => onUpdate(`attr_${field.key}_max`, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
