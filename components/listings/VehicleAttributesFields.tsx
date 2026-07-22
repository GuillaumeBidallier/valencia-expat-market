'use client'
import dynamic from 'next/dynamic'
import { VEHICLE_ATTRIBUTES } from '@/lib/vehicleAttributes'

const BrandModelPicker = dynamic(() => import('@/components/ui/BrandModelPicker'), { ssr: false })

interface Props {
  categorySlug: string
  value: Record<string, string | number>
  onChange: (attrs: Record<string, string | number>) => void
}

const inputClass = 'border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition'

export default function VehicleAttributesFields({ categorySlug, value, onChange }: Props) {
  const fields = VEHICLE_ATTRIBUTES[categorySlug]
  if (!fields || fields.length === 0) return null

  const set = (key: string, v: string | number) => onChange({ ...value, [key]: v })

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-navy">Caractéristiques du véhicule</h2>
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
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">{field.label}{field.unit ? ` (${field.unit})` : ''}</label>
            <input
              type="number"
              value={value[field.key] ?? ''}
              onChange={e => set(field.key, e.target.value ? Number(e.target.value) : '')}
              className={inputClass}
            />
          </div>
        )
      })}
    </div>
  )
}
