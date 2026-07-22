'use client'
import carBrands from '@/lib/vehicleData/carBrands.json'
import motoBrands from '@/lib/vehicleData/motoBrands.json'
import utilityBrands from '@/lib/vehicleData/utilityBrands.json'

type BrandEntry = { brand: string; common: boolean; models: { value: string; label: string }[] }

const DATASETS: Record<'car' | 'moto' | 'utility', BrandEntry[]> = {
  car: carBrands as BrandEntry[],
  moto: motoBrands as BrandEntry[],
  utility: utilityBrands as BrandEntry[],
}

interface Props {
  vehicleType: 'car' | 'moto' | 'utility'
  brandLabel: string
  brand: string
  model: string
  onBrandChange: (brand: string) => void
  onModelChange: (model: string) => void
}

const selectClass = 'border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition disabled:opacity-50 disabled:cursor-not-allowed'

export default function BrandModelPicker({ vehicleType, brandLabel, brand, model, onBrandChange, onModelChange }: Props) {
  const brands = DATASETS[vehicleType]
  const common = brands.filter(b => b.common)
  const others = brands.filter(b => !b.common)
  const selected = brands.find(b => b.brand === brand)
  const hasModelList = Boolean(selected && selected.models.length > 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-navy">{brandLabel}</label>
        <select
          value={brand}
          onChange={e => onBrandChange(e.target.value)}
          className={selectClass}
        >
          <option value="">—</option>
          {common.length > 0 && (
            <optgroup label="Marques courantes">
              {common.map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
            </optgroup>
          )}
          <optgroup label="Autres marques">
            {others.map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
          </optgroup>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-navy">Modèle</label>
        {hasModelList ? (
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            disabled={!brand}
            className={selectClass}
          >
            <option value="">—</option>
            {selected!.models.map(m => <option key={m.value} value={m.label}>{m.label}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={model}
            onChange={e => onModelChange(e.target.value)}
            disabled={!brand}
            placeholder="Modèle"
            className={selectClass}
          />
        )}
      </div>
    </div>
  )
}
