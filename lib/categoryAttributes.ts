import type { AttrFieldDef } from './vehicleAttributes'
import { VEHICLE_ATTRIBUTES } from './vehicleAttributes'
import { REAL_ESTATE_ATTRIBUTES } from './realEstateAttributes'

export type {
  AttrOption, AttrFieldDef, BrandModelFieldDef, SelectFieldDef, RangeFieldDef,
  StepperFieldDef, StepperOption,
} from './vehicleAttributes'

/** Per-category attribute field definitions, merged across all attribute-driven domains. */
export const CATEGORY_ATTRIBUTES: Record<string, AttrFieldDef[]> = {
  ...VEHICLE_ATTRIBUTES,
  ...REAL_ESTATE_ATTRIBUTES,
}

export function hasCategoryAttributes(slug: string): boolean {
  return slug in CATEGORY_ATTRIBUTES
}
