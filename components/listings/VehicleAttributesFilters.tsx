'use client'
import dynamic from 'next/dynamic'
import { VEHICLE_ATTRIBUTES } from '@/lib/vehicleAttributes'

const BrandModelPicker = dynamic(() => import('@/components/ui/BrandModelPicker'), { ssr: false })

interface SearchParamsLike {
  get(key: string): string | null
}

interface Props {
  cat: string
  searchParams: SearchParamsLike
  onUpdate: (key: string, value: string) => void
}

export default function VehicleAttributesFilters({ cat, searchParams, onUpdate }: Props) {
  const fields = VEHICLE_ATTRIBUTES[cat]
  if (!fields || fields.length === 0) return null

  const toggleMulti = (key: string, value: string) => {
    const current = (searchParams.get(`attr_${key}`) ?? '').split(',').filter(Boolean)
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    onUpdate(`attr_${key}`, next.join(','))
  }

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-gray-100">
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
