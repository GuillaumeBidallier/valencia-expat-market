'use client'
import dynamic from 'next/dynamic'
import { CATEGORY_ATTRIBUTES } from '@/lib/categoryAttributes'
import { isRealEstateCategory } from '@/lib/realEstateAttributes'

const BrandModelPicker = dynamic(() => import('@/components/ui/BrandModelPicker'), { ssr: false })

interface Props {
  categorySlug: string
  value: Record<string, string | number | string[]>
  onChange: (attrs: Record<string, string | number | string[]>) => void
}

const inputClass = 'border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition'

export default function VehicleAttributesFields({ categorySlug, value, onChange }: Props) {
  const fields = CATEGORY_ATTRIBUTES[categorySlug]
  if (!fields || fields.length === 0) return null

  const set = (key: string, v: string | number) => onChange({ ...value, [key]: v })

  const toggleMultiValue = (key: string, option: string) => {
    const current = Array.isArray(value[key]) ? (value[key] as string[]) : []
    const next = current.includes(option) ? current.filter(v => v !== option) : [...current, option]
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-navy">{isRealEstateCategory(categorySlug) ? 'Caractéristiques du bien' : 'Caractéristiques du véhicule'}</h2>
      {fields.map(field => {
        if (field.type === 'brand-model') {
          return (
            <BrandModelPicker
              key={field.brandKey}
              vehicleType={field.vehicleType}
              brandLabel={field.label}
              brand={String(value[field.brandKey] ?? '')}
              model={String(value[field.modelKey] ?? '')}
              onBrandChange={b => onChange({ ...value, [field.brandKey]: b, [field.modelKey]: '' })}
              onModelChange={m => set(field.modelKey, m)}
            />
          )
        }
        if (field.type === 'select' && field.multi) {
          const selected = Array.isArray(value[field.key]) ? (value[field.key] as string[]) : []
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy">{field.label}</label>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleMultiValue(field.key, o.value)}
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
        if (field.type === 'select') {
          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">{field.label}</label>
              <select
                value={String(value[field.key] ?? '')}
                onChange={e => set(field.key, e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )
        }
        if (field.type === 'stepper') {
          const current = value[field.key]
          const selected = typeof current === 'number' ? current : Number(current) || null
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy">{field.label}</label>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set(field.key, selected === o.value ? '' : o.value)}
                    className={`w-9 h-9 rounded-full border text-sm font-semibold transition-colors ${
                      selected === o.value
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
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">{field.label}{field.unit ? ` (${field.unit})` : ''}</label>
            <input
              type="number"
              value={value[field.key] as string | number ?? ''}
              onChange={e => set(field.key, e.target.value ? Number(e.target.value) : '')}
              className={inputClass}
            />
          </div>
        )
      })}
    </div>
  )
}
