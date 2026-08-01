import type { Prisma } from '@prisma/client'
import { CATEGORY_ATTRIBUTES } from '@/lib/categoryAttributes'

/**
 * Builds Prisma where-clauses for category attribute filters from `attr_*` URL params.
 * MySQL JSON path filtering requires a string path (e.g. '$.fuel'), not the
 * array-of-keys form Postgres uses.
 */
export function buildVehicleAttributeClauses(
  cat: string,
  params: Record<string, string | undefined>
): Prisma.ListingWhereInput[] {
  const fields = CATEGORY_ATTRIBUTES[cat]
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
          OR: values.map(v => (
            field.multi
              ? { attributes: { path: `$.${field.key}`, array_contains: v } }
              : { attributes: { path: `$.${field.key}`, equals: v } }
          )),
        })
      }
    } else if (field.type === 'stepper') {
      const raw = params[`attr_${field.key}`]
      if (raw) {
        const [minStr, maxStr] = raw.split('-')
        if (minStr) clauses.push({ attributes: { path: `$.${field.key}`, gte: Number(minStr) } })
        if (maxStr) clauses.push({ attributes: { path: `$.${field.key}`, lte: Number(maxStr) } })
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
