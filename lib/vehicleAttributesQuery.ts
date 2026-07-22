import type { Prisma } from '@prisma/client'
import { VEHICLE_ATTRIBUTES } from '@/lib/vehicleAttributes'

/**
 * Builds Prisma where-clauses for vehicle attribute filters from `attr_*` URL params.
 * MySQL JSON path filtering requires a string path (e.g. '$.fuel'), not the
 * array-of-keys form Postgres uses.
 */
export function buildVehicleAttributeClauses(
  cat: string,
  params: Record<string, string | undefined>
): Prisma.ListingWhereInput[] {
  const fields = VEHICLE_ATTRIBUTES[cat]
  if (!fields) return []

  const clauses: Prisma.ListingWhereInput[] = []

  for (const field of fields) {
    if (field.type === 'brand-model') {
      const brand = params[`attr_${field.brandKey}`]
      const model = params[`attr_${field.modelKey}`]
      if (brand) clauses.push({ attributes: { path: `$.${field.brandKey}`, equals: brand } })
      if (model) clauses.push({ attributes: { path: `$.${field.modelKey}`, equals: model } })
    } else if (field.type === 'select') {
      const raw = params[`attr_${field.key}`]
      const values = raw ? raw.split(',').filter(Boolean) : []
      if (values.length > 0) {
        clauses.push({
          OR: values.map(v => ({ attributes: { path: `$.${field.key}`, equals: v } })),
        })
      }
    } else {
      const min = params[`attr_${field.key}_min`]
      const max = params[`attr_${field.key}_max`]
      if (min) clauses.push({ attributes: { path: `$.${field.key}`, gte: Number(min) } })
      if (max) clauses.push({ attributes: { path: `$.${field.key}`, lte: Number(max) } })
    }
  }

  return clauses
}
