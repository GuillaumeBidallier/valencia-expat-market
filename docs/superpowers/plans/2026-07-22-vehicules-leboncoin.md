# Refonte Véhicules à l'identique de leboncoin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the invented `vehicules` category tree with leboncoin's real flat 9-subcategory structure, and add leboncoin-accurate attributes (marque, modèle, année, carburant, boîte de vitesses, kilométrage, crit'air, etc.) to vehicle listings — captured on post/edit, filterable on `/annonces`, displayed on the listing detail page.

**Architecture:** One new nullable `Listing.attributes Json` column stores category-specific key/value pairs. A single static config file (`lib/vehicleAttributes.ts`) declares which fields exist per vehicle subcategory slug and drives three consumers generically: the post/edit form, the search-filter sidebar, and the Prisma `where`-clause builder. Brand/model reference data (8,378 real leboncoin models across 222+171+63 brands) is generated once from leboncoin's public mobile-API constants and committed as static JSON.

**Tech Stack:** Next.js 15 App Router, Prisma 6.19 / MySQL, TypeScript, Tailwind CSS, React Client Components. No test framework in this repo — verification is `tsc --noEmit`, `next build`, and manual browser checks (established project convention).

**Design reference:** `docs/superpowers/specs/2026-07-22-vehicules-leboncoin-design.md`

## Global Constraints

- No new npm packages.
- UI language: French throughout (attribute labels/values are French-only; category *names* keep the existing 6-locale translation pattern in `seed-categories.ts`).
- `DATABASE_URL` in `.env.local` points directly at the production MySQL server (no separate dev DB exists for this project) — every migration/seed command in this plan runs against production. Take a fresh `mysqldump` backup before any schema or category-data change (see Task 1 and Task 3).
- Never run `prisma/seed.ts` — it unconditionally does `listing.deleteMany()`. Not needed for this plan.
- `prisma/seed-categories.ts` must never be run with `--force` — that path does `TRUNCATE ... CASCADE` on the entire `Category`/`CategoryTranslation` tables (all categories, not just vehicules). Always run it with no flags (27 existing listings ⇒ it already takes the safe upsert-only path).
- Commit after each task.

---

### Task 1: Schema — `Listing.attributes` column

**Files:**
- Modify: `prisma/schema.prisma`
- Auto-generated: `prisma/migrations/<timestamp>_add_listing_attributes/`

**Interfaces:**
- Produces: `Listing.attributes: Prisma.JsonValue | null` available on every Prisma `Listing` query/mutation from Task 6 onward.

- [ ] **Step 1: Back up the production database**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
mysqldump -h 51.75.116.192 -u vendo_user -p'Aa9_8ksG8qxStAjUhVr6gB6ThskE9C' vendo > db-backups/production-mysql-backup-$(date +%Y%m%d-%H%M%S)-pre-vehicule-attrs.sql
ls -la db-backups/ | tail -3
```
Expected: a new `.sql` file of non-trivial size (several hundred KB+) appears.

- [ ] **Step 2: Edit `prisma/schema.prisma`**

Find the `Listing` model and add `attributes` right after `blockedReason`:

```prisma
model Listing {
  id             String         @id @default(cuid())
  siteId         String
  site           Site           @relation(fields: [siteId], references: [id])
  title          String
  description    String         @db.Text
  price          Float?
  categorySlug   String
  city           String
  neighborhood   String
  status         ListingStatus  @default(ACTIVE)
  userId         String
  user           User           @relation(fields: [userId], references: [id])
  images         ListingImage[]
  favorites      Favorite[]
  messages       Message[]
  reports        Report[]
  phone          String?
  views          Int            @default(0)
  isPremium      Boolean        @default(false)
  boostExpiresAt DateTime?
  featuredAt     DateTime?
  publishedAt    DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  lat            Float?
  lng            Float?
  blockedReason  String?
  attributes     Json?

  @@index([siteId])
}
```

- [ ] **Step 3: Generate and apply the migration**

```bash
npx prisma migrate dev --name add_listing_attributes
```
Expected output: `The following migration(s) have been applied: migrations/<timestamp>_add_listing_attributes/migration.sql`. It should contain a single additive `ALTER TABLE Listing ADD COLUMN attributes JSON NULL;` — no data loss.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no new errors (the `Listing` Prisma type now includes `attributes: Prisma.JsonValue | null`).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Listing.attributes JSON column for category-specific listing data"
```

---

### Task 2: Generate vehicle brand/model reference data

**Files:**
- Create: `lib/vehicleData/carBrands.json`
- Create: `lib/vehicleData/motoBrands.json`
- Create: `lib/vehicleData/utilityBrands.json`

**Interfaces:**
- Produces: three JSON files, each an array of `{ brand: string, common: boolean, models: { value: string, label: string }[] }`, ordered "marques courantes" first (matching leboncoin's own ordering), then all other brands. `common: true` on exactly the leboncoin-designated common brands (10 for cars, 5 for utilities, 0 for motos — leboncoin has no "common" grouping for motos, all `common: false`).

- [ ] **Step 1: Download leboncoin's public mobile-API constants file**

This is the real source of leboncoin's category/brand/model taxonomy (public repo, MIT-style unofficial API wrapper — no leboncoin credentials involved, it's a static reference-data file).

```bash
mkdir -p /tmp/vehicle-data-gen
curl -sL "https://raw.githubusercontent.com/thomasync/leboncoin-api-search/main/src/constants.ts" -o /tmp/vehicle-data-gen/lbc-constants.ts
wc -l /tmp/vehicle-data-gen/lbc-constants.ts
```
Expected: a file of ~72,000 lines.

- [ ] **Step 2: Write the parser script**

Create `/tmp/vehicle-data-gen/parse_vehicle_brands.py` (this script is a one-off data-generation tool, not part of the app — it is not committed to the repo):

```python
#!/usr/bin/env python3
"""
Parses leboncoin's public mobile-API constants file (src/constants.ts from
https://github.com/thomasync/leboncoin-api-search) into three flat JSON files:
carBrands.json, motoBrands.json, utilityBrands.json.

Usage: python3 parse_vehicle_brands.py <path-to-constants.ts> <output-dir>
"""
import sys
import re
import json


def extract_block(text, key, start_from=0):
    """Given `key: {` or `'key': {`, return the full brace-matched block text and the end offset."""
    try:
        idx = text.index(f"\n\t{key}: {{", start_from)
    except ValueError:
        idx = text.index(f"\n\t'{key}': {{", start_from)
    i = text.index('{', idx)
    depth = 1
    j = i + 1
    while depth > 0:
        if text[j] == '{':
            depth += 1
        elif text[j] == '}':
            depth -= 1
        j += 1
    return text[i:j], j


def parse_simple_list(block):
    """Parse a `simpleData: [ { value: '...', label: '...' }, ... ]` list into [(value,label), ...]."""
    pairs = re.findall(r"value:\s*'((?:[^'\\]|\\.)*)',\s*label:\s*'((?:[^'\\]|\\.)*)'", block)
    return [(v.replace("\\'", "'"), l.replace("\\'", "'")) for v, l in pairs]


def parse_brand_list(text, brand_key):
    """
    Parses `u_car_brand` / `u_moto_brand` / `u_utility_brand`.
    Returns [(brand_label, is_common), ...] in source order, common first.
    """
    block, _ = extract_block(text, brand_key)
    header_names = re.findall(r"header:\s*'([^']*)',\s*list:\s*\[", block)
    bodies = re.split(r"header:\s*'[^']*',\s*list:\s*\[", block)[1:]

    result = []
    seen = set()
    for header_name, list_body in zip(header_names, bodies):
        pairs = parse_simple_list(list_body)
        is_common = 'courante' in header_name.lower()
        for value, label in pairs:
            if value in seen:
                continue
            seen.add(value)
            result.append((label, is_common))
    return result


def parse_brand_fields(text, brand_fields_key):
    """
    Parses `u_car_brandFields` / `u_moto_brandFields` / `u_utility_brandFields`.
    Returns { brand_label: model_field_name }.
    """
    block, _ = extract_block(text, brand_fields_key)
    pairs = re.findall(r"(?:^|\n)\t\t'?([^'\n:]+?)'?:\s*\[\s*\{\s*type:\s*'feature',\s*name:\s*'([^']+)'", block)
    return {brand.strip(): model_key for brand, model_key in pairs}


def parse_model_values(text, model_key):
    """Parses a `u_car_model_<brand>: { values: { simpleData: [...] } }` block into [(value,label), ...]."""
    try:
        block, _ = extract_block(text, model_key)
    except ValueError:
        return None
    return parse_simple_list(block)


def build_dataset(text, brand_key, brand_fields_key):
    brands = parse_brand_list(text, brand_key)
    fields_map = parse_brand_fields(text, brand_fields_key)
    out = []
    for label, is_common in brands:
        model_key = fields_map.get(label)
        models = parse_model_values(text, model_key) if model_key else None
        out.append({
            'brand': label,
            'common': is_common,
            'models': [{'value': v, 'label': l} for v, l in models] if models else [],
        })
    return out


def main():
    src_path, out_dir = sys.argv[1], sys.argv[2]
    text = open(src_path, encoding='utf-8').read()

    datasets = [
        ('carBrands.json', 'u_car_brand', 'u_car_brandFields'),
        ('motoBrands.json', 'u_moto_brand', 'u_moto_brandFields'),
        ('utilityBrands.json', 'u_utility_brand', 'u_utility_brandFields'),
    ]

    for filename, brand_key, brand_fields_key in datasets:
        data = build_dataset(text, brand_key, brand_fields_key)
        total_models = sum(len(b['models']) for b in data)
        empty = sum(1 for b in data if not b['models'])
        print(f"{filename}: {len(data)} brands, {total_models} models, {empty} brands with no model list")
        with open(f"{out_dir}/{filename}", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
```

- [ ] **Step 3: Run the parser**

```bash
python3 /tmp/vehicle-data-gen/parse_vehicle_brands.py /tmp/vehicle-data-gen/lbc-constants.ts /tmp/vehicle-data-gen
```
Expected output (counts may vary by a handful if leboncoin has updated their list since this plan was written — that's fine, this is real live reference data):
```
carBrands.json: 222 brands, 5843 models, 1 brands with no model list
motoBrands.json: 171 brands, 1918 models, 1 brands with no model list
utilityBrands.json: 63 brands, 616 models, 1 brands with no model list
```
Only brand `"Autre"` should have an empty model list in each file — verify with:
```bash
python3 -c "
import json
for f in ['carBrands.json','motoBrands.json','utilityBrands.json']:
    d = json.load(open(f'/tmp/vehicle-data-gen/{f}'))
    empties = [b['brand'] for b in d if not b['models']]
    print(f, 'empty:', empties)
"
```
Expected: `empty: ['Autre']` for each of the three files.

- [ ] **Step 4: Copy the generated files into the repo**

```bash
mkdir -p lib/vehicleData
cp /tmp/vehicle-data-gen/carBrands.json /tmp/vehicle-data-gen/motoBrands.json /tmp/vehicle-data-gen/utilityBrands.json lib/vehicleData/
ls -la lib/vehicleData/
```

- [ ] **Step 5: Commit**

```bash
git add lib/vehicleData/
git commit -m "feat: add leboncoin vehicle brand/model reference data (car, moto, utility)"
```

---

### Task 3: Flatten the `vehicules` category tree

**Files:**
- Modify: `prisma/seed-categories.ts`

**Interfaces:**
- Produces: 9 flat categories under `vehicules` in the DB: `voitures`, `motos`, `caravaning`, `utilitaires`, `nautisme`, `equipement_auto`, `equipement_moto`, `equipement_caravaning`, `equipement_nautisme` — each a leaf (no children).
- Consumes: nothing new (uses the existing upsert-by-`siteId_slug` logic already in the file).

- [ ] **Step 1: Replace the `// ── 1. Véhicules ──` block**

In `prisma/seed-categories.ts`, replace the entire first array entry (currently lines 16-69, from `slug: 'vehicules', label: 'Véhicules', icon: '🚗',` through its closing `},` before `// ── 2. Immobilier ──`) with:

```typescript
  // ── 1. Véhicules ──────────────────────────────────────────────────────────
  {
    slug: 'vehicules', label: 'Véhicules', icon: '🚗',
    t: { en: 'Vehicles', es: 'Vehículos', de: 'Fahrzeuge', nl: "Voertuigen", uk: 'Транспорт', ru: 'Транспорт' },
    children: [
      { slug: 'voitures', label: 'Voitures', t: { en: 'Cars', es: 'Coches', de: 'Autos', nl: "Auto's", uk: 'Автомобілі', ru: 'Автомобили' } },
      { slug: 'motos', label: 'Motos', t: { en: 'Motorcycles', es: 'Motos', de: 'Motorräder', nl: 'Motoren', uk: 'Мотоцикли', ru: 'Мотоциклы' } },
      { slug: 'caravaning', label: 'Caravaning', t: { en: 'Caravanning', es: 'Caravaning', de: 'Caravaning', nl: 'Caravaning', uk: 'Кемпінг', ru: 'Кемпинг' } },
      { slug: 'utilitaires', label: 'Utilitaires', t: { en: 'Vans & Trucks', es: 'Furgonetas y Camiones', de: 'Nutzfahrzeuge', nl: 'Bedrijfswagens', uk: 'Комерційний транспорт', ru: 'Коммерческий транспорт' } },
      { slug: 'nautisme', label: 'Nautisme', t: { en: 'Nautical', es: 'Náutica', de: 'Nautik', nl: 'Watersport', uk: 'Водний транспорт', ru: 'Водный транспорт' } },
      { slug: 'equipement_auto', label: 'Équipement auto', t: { en: 'Car Equipment', es: 'Equipamiento de coche', de: 'Auto-Zubehör', nl: 'Auto-uitrusting', uk: 'Автообладнання', ru: 'Автооборудование' } },
      { slug: 'equipement_moto', label: 'Équipement moto', t: { en: 'Motorcycle Equipment', es: 'Equipamiento de moto', de: 'Motorrad-Zubehör', nl: 'Motoruitrusting', uk: 'Мотообладнання', ru: 'Мотооборудование' } },
      { slug: 'equipement_caravaning', label: 'Équipement caravaning', t: { en: 'Caravanning Equipment', es: 'Equipamiento de caravaning', de: 'Camping-Zubehör', nl: 'Camping-uitrusting', uk: 'Кемпінгове спорядження', ru: 'Кемпинговое снаряжение' } },
      { slug: 'equipement_nautisme', label: 'Équipement nautisme', t: { en: 'Nautical Equipment', es: 'Equipamiento náutico', de: 'Nautik-Zubehör', nl: 'Watersportuitrusting', uk: 'Спорядження для водного транспорту', ru: 'Снаряжение для водного транспорта' } },
    ],
  },
```

Note this drops the `children` nesting on every entry (all 9 are now `Cat2` with no `children` field, i.e. leaves) — matches the existing `Cat2` type (`children?: Cat3[]`, optional).

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "seed-categories" | head -10
```
Expected: no output (no errors).

- [ ] **Step 3: Run the reseed (no `--force` flag)**

```bash
npx tsx prisma/seed-categories.ts
```
Expected: log lines showing `⚠️  27 annonce(s) existent en base...` (safe upsert path, not truncate), then `✓ 🚗 Véhicules (9 sous-cat.)`, and a final summary. This upserts the 9 new/renamed leaves — `voitures` is unchanged, `motos`/`caravaning`/`nautisme`/`utilitaires` get their `parentId` updated to point directly at the `vehicules` root (reassigned from their old nested position), and the 4 `equipement_*` slugs are newly created.

- [ ] **Step 4: Verify in Prisma Studio**

```bash
npx prisma studio
```
Open `http://localhost:5555`, `Category` table, filter by the site's vehicules tree: confirm exactly 9 rows have `parentId` = the `vehicules` category's id, and each of those 9 has zero children of its own.

- [ ] **Step 5: Clean up orphaned sub-sub-categories**

The upsert in Step 3 does not delete categories no longer present in the array. These slugs are now orphaned (no longer reachable from `vehicules`) and were confirmed to have **zero listings** referencing them (checked directly against production before writing this plan): `scooters`, `quads-buggy`, `camping-cars`, `caravanes`, `vans-amenages`, `bateaux`, `jet-skis`, `pieces-detachees`, `jantes-pneus`, `accessoires-auto`, `berlines-citadines`, `suv-4x4`, `breaks-monospaces`, `cabriolets-coupes`, `voitures-collection`, plus the two now-childless parents `motos-scooters` and `pieces-auto`.

Create `/tmp/vehicle-data-gen/cleanup_orphan_categories.js` (one-off script, not committed):

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const LEAF_SLUGS = [
  'scooters', 'quads-buggy', 'camping-cars', 'caravanes', 'vans-amenages',
  'bateaux', 'jet-skis', 'pieces-detachees', 'jantes-pneus', 'accessoires-auto',
  'berlines-citadines', 'suv-4x4', 'breaks-monospaces', 'cabriolets-coupes', 'voitures-collection',
]
const PARENT_SLUGS = ['motos-scooters', 'pieces-auto']
const ALL_SLUGS = [...LEAF_SLUGS, ...PARENT_SLUGS]

async function main() {
  const inUse = await prisma.listing.groupBy({
    by: ['categorySlug'],
    where: { categorySlug: { in: ALL_SLUGS } },
    _count: { id: true },
  })
  if (inUse.length > 0) {
    console.error('ABORT — these slugs are still in use by listings:', inUse)
    process.exit(1)
  }

  const leafResult = await prisma.category.deleteMany({ where: { slug: { in: LEAF_SLUGS } } })
  console.log('Deleted leaf categories:', leafResult.count)

  const parentResult = await prisma.category.deleteMany({ where: { slug: { in: PARENT_SLUGS } } })
  console.log('Deleted parent categories:', parentResult.count)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
```

Run it from the repo root (so it resolves `@prisma/client` and picks up `.env.local`):

```bash
cp /tmp/vehicle-data-gen/cleanup_orphan_categories.js ./cleanup_orphan_categories_tmp.js
node -r dotenv/config ./cleanup_orphan_categories_tmp.js dotenv_config_path=.env.local
rm -f ./cleanup_orphan_categories_tmp.js
```
Expected: `Deleted leaf categories: 15` then `Deleted parent categories: 2`. If it instead prints `ABORT`, stop and re-investigate — do not proceed until the listing counts are re-verified.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed-categories.ts
git commit -m "feat: flatten vehicules category tree to match leboncoin's real 9 subcategories"
```

---

### Task 4: Vehicle attribute schema config

**Files:**
- Create: `lib/vehicleAttributes.ts`

**Interfaces:**
- Produces:
  - `type AttrFieldDef = BrandModelFieldDef | SelectFieldDef | RangeFieldDef`
  - `VEHICLE_ATTRIBUTES: Record<string, AttrFieldDef[]>` keyed by category slug (`voitures`, `motos`, `caravaning`, `utilitaires`, `nautisme`; the 4 `equipement_*` slugs are deliberately absent — no extra attributes, matching leboncoin)
  - `isVehicleCategory(slug: string): boolean`

- [ ] **Step 1: Create `lib/vehicleAttributes.ts`**

```typescript
export interface AttrOption {
  value: string
  label: string
}

export interface BrandModelFieldDef {
  type: 'brand-model'
  vehicleType: 'car' | 'moto' | 'utility'
  brandKey: string
  modelKey: string
  label: string
}

export interface SelectFieldDef {
  type: 'select'
  key: string
  label: string
  options: AttrOption[]
}

export interface RangeFieldDef {
  type: 'range'
  key: string
  label: string
  unit?: string
}

export type AttrFieldDef = BrandModelFieldDef | SelectFieldDef | RangeFieldDef

const FUEL: AttrOption[] = [
  { value: '1', label: 'Essence' },
  { value: '2', label: 'Diesel' },
  { value: '6', label: 'Hybride' },
  { value: '4', label: 'Electrique' },
  { value: '3', label: 'GPL' },
  { value: '5', label: 'Autre' },
]

const GEARBOX: AttrOption[] = [
  { value: '1', label: 'Manuelle' },
  { value: '2', label: 'Automatique' },
]

const CRITAIR: AttrOption[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
]

const DOORS: AttrOption[] = [
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '999999', label: '6 ou plus' },
]

const SEATS: AttrOption[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '999999', label: '7 ou plus' },
]

const VEHICLE_TYPE: AttrOption[] = [
  { value: '4x4', label: '4x4, Suv' },
  { value: 'berline', label: 'Berline' },
  { value: 'break', label: 'Break' },
  { value: 'cabriolet', label: 'Cabriolet' },
  { value: 'citadine', label: 'Citadine' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'pickup', label: 'Pick-up' },
  { value: 'voituresociete', label: 'Voiture société, commerciale' },
  { value: 'autre', label: 'Autre' },
]

const VEHICULE_COLOR: AttrOption[] = [
  { value: 'argent', label: 'Argent' },
  { value: 'beige', label: 'Beige' },
  { value: 'blanc', label: 'Blanc' },
  { value: 'bleu', label: 'Bleu' },
  { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'gris', label: 'Gris' },
  { value: 'ivoire', label: 'Ivoire' },
  { value: 'jaune', label: 'Jaune' },
  { value: 'marron', label: 'Marron' },
  { value: 'noir', label: 'Noir' },
  { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' },
  { value: 'rouge', label: 'Rouge' },
  { value: 'vert', label: 'Vert' },
  { value: 'violet', label: 'Violet' },
  { value: 'autre', label: 'Autre' },
]

const MOTO_TYPE: AttrOption[] = [
  { value: 'moto', label: 'Moto' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'quad', label: 'Quad' },
  { value: 'autre', label: 'Autre' },
]

const CYCLE_LICENCE: AttrOption[] = [
  { value: 'permisa', label: 'Permis A' },
  { value: 'permisal', label: 'Permis AL' },
  { value: 'sanspermis', label: 'Sans permis' },
]

const BOAT_TYPE: AttrOption[] = [
  { value: 'barques', label: 'Barques' },
  { value: 'bateauxamoteur', label: 'Bateaux à moteur' },
  { value: 'jetsskiscooters', label: 'Jets skis, scooters' },
  { value: 'pneumatiquessemirigides', label: 'Pneumatiques, semi-rigides' },
  { value: 'voiliermonocoque', label: 'Voiliers monocoques' },
  { value: 'voiliermulticoques', label: 'Voiliers multicoques' },
  { value: 'yacht', label: 'Yachts' },
  { value: 'autre', label: 'Autre' },
]

export const VEHICLE_ATTRIBUTES: Record<string, AttrFieldDef[]> = {
  voitures: [
    { type: 'brand-model', vehicleType: 'car', brandKey: 'brand', modelKey: 'model', label: 'Marque' },
    { type: 'range', key: 'regdate', label: 'Année' },
    { type: 'select', key: 'vehicle_type', label: 'Type de véhicule', options: VEHICLE_TYPE },
    { type: 'select', key: 'fuel', label: 'Carburant', options: FUEL },
    { type: 'select', key: 'gearbox', label: 'Boîte de vitesses', options: GEARBOX },
    { type: 'range', key: 'mileage', label: 'Kilométrage', unit: 'km' },
    { type: 'select', key: 'critair', label: "Crit'air", options: CRITAIR },
    { type: 'range', key: 'horse_power_din', label: 'Puissance DIN', unit: 'ch' },
    { type: 'range', key: 'horsepower', label: 'Puissance fiscale', unit: 'cv' },
    { type: 'select', key: 'doors', label: 'Portes', options: DOORS },
    { type: 'select', key: 'seats', label: 'Places', options: SEATS },
    { type: 'select', key: 'vehicule_color', label: 'Couleur', options: VEHICULE_COLOR },
  ],
  motos: [
    { type: 'brand-model', vehicleType: 'moto', brandKey: 'brand', modelKey: 'model', label: 'Marque' },
    { type: 'range', key: 'cubic_capacity', label: 'Cylindrée', unit: 'cm³' },
    { type: 'range', key: 'regdate', label: 'Année' },
    { type: 'select', key: 'moto_type', label: 'Type', options: MOTO_TYPE },
    { type: 'range', key: 'mileage', label: 'Kilométrage', unit: 'km' },
    { type: 'select', key: 'vehicule_color', label: 'Couleur', options: VEHICULE_COLOR },
    { type: 'select', key: 'cycle_licence', label: 'Permis', options: CYCLE_LICENCE },
    { type: 'select', key: 'critair', label: "Crit'air", options: CRITAIR },
  ],
  utilitaires: [
    { type: 'brand-model', vehicleType: 'utility', brandKey: 'brand', modelKey: 'model', label: 'Marque' },
    { type: 'range', key: 'regdate', label: 'Année' },
    { type: 'select', key: 'fuel', label: 'Carburant', options: FUEL },
    { type: 'range', key: 'mileage', label: 'Kilométrage', unit: 'km' },
    { type: 'range', key: 'horse_power_din', label: 'Puissance DIN', unit: 'ch' },
    { type: 'range', key: 'horsepower', label: 'Puissance fiscale', unit: 'cv' },
    { type: 'select', key: 'doors', label: 'Portes', options: DOORS },
    { type: 'select', key: 'seats', label: 'Places', options: SEATS },
    { type: 'select', key: 'vehicule_color', label: 'Couleur', options: VEHICULE_COLOR },
    { type: 'select', key: 'gearbox', label: 'Boîte de vitesses', options: GEARBOX },
    { type: 'select', key: 'critair', label: "Crit'air", options: CRITAIR },
  ],
  caravaning: [
    { type: 'range', key: 'regdate', label: 'Année' },
    { type: 'range', key: 'mileage', label: 'Kilométrage', unit: 'km' },
  ],
  nautisme: [
    { type: 'select', key: 'boat_type', label: 'Type de bateau', options: BOAT_TYPE },
  ],
}

export function isVehicleCategory(slug: string): boolean {
  return slug in VEHICLE_ATTRIBUTES
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "vehicleAttributes" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/vehicleAttributes.ts
git commit -m "feat: add vehicle attribute schema config (voitures, motos, utilitaires, caravaning, nautisme)"
```

---

### Task 5: `BrandModelPicker` component

**Files:**
- Create: `components/ui/BrandModelPicker.tsx`

**Interfaces:**
- Consumes: `lib/vehicleData/{car,moto,utility}Brands.json` (Task 2)
- Produces: `<BrandModelPicker vehicleType={'car'|'moto'|'utility'} brandLabel={string} brand={string} model={string} onBrandChange={(b: string) => void} onModelChange={(m: string) => void} />` — a two-column brand select + model select (or free-text input when the chosen brand has no model list, i.e. only `"Autre"`).

- [ ] **Step 1: Create `components/ui/BrandModelPicker.tsx`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "BrandModelPicker" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/ui/BrandModelPicker.tsx
git commit -m "feat: add BrandModelPicker cascading brand/model selector"
```

---

### Task 6: `VehicleAttributesFields` (post/edit form fields)

**Files:**
- Create: `components/listings/VehicleAttributesFields.tsx`

**Interfaces:**
- Consumes: `VEHICLE_ATTRIBUTES` (Task 4), `BrandModelPicker` (Task 5)
- Produces: `<VehicleAttributesFields categorySlug={string} value={Record<string, string|number>} onChange={(attrs: Record<string, string|number>) => void} />`. Renders nothing (`null`) when `categorySlug` has no entry in `VEHICLE_ATTRIBUTES` (furniture, electronics, `equipement_*`, etc.).
- `BrandModelPicker` is loaded via `next/dynamic({ ssr: false })` so its ~500KB+161KB+55KB JSON data files are only fetched when a vehicle category with a brand/model field is actually selected — not on every visit to the post-ad page.

- [ ] **Step 1: Create `components/listings/VehicleAttributesFields.tsx`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "VehicleAttributesFields" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/listings/VehicleAttributesFields.tsx
git commit -m "feat: add VehicleAttributesFields dynamic form fields for vehicle listings"
```

---

### Task 7: Persist `attributes` — types + API routes

**Files:**
- Modify: `types/index.ts`
- Modify: `app/api/listings/route.ts`
- Modify: `app/api/listings/[id]/route.ts`

**Interfaces:**
- Produces: `NewListing.attributes?: Record<string, string | number>`, `Listing.attributes?: Record<string, string | number> | null`. `POST /api/listings` and `PUT /api/listings/:id` both accept and persist `attributes`.

- [ ] **Step 1: Update `types/index.ts`**

```typescript
export interface Listing {
  id: string
  title: string
  description: string
  price: number | null
  categorySlug: string
  city: string
  neighborhood: string
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'DELETED' | 'PENDING' | 'REJECTED'
  userId: string
  user?: { name: string }
  images: { id: string; url: string; order: number }[]
  isPremium: boolean
  boostExpiresAt: string | null
  featuredAt: string | null
  publishedAt: string
  updatedAt: string
  phone?: string | null
  lat?: number | null
  lng?: number | null
  attributes?: Record<string, string | number> | null
  // Champs de compatibilité frontend
  category?: string
  userName?: string
}

export interface NewListing {
  title: string
  categorySlug: string
  price: number | null
  description: string
  neighborhood: string
  lat?: number
  lng?: number
  phone?: string
  attributes?: Record<string, string | number>
}
```
(Only the two interfaces change — leave `User`, `Category`, `CategoryTree` as-is.)

- [ ] **Step 2: Update `app/api/listings/route.ts`**

In `createSchema`, add the `attributes` field:

```typescript
const createSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().nullable(),
  categorySlug: z.string().min(1),
  city: z.string().min(1),
  neighborhood: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  attributes: z.record(z.union([z.string(), z.number()])).optional(),
})
```
No other change needed in this file — `listingData` (built via `const { lat: _lat, lng: _lng, ...listingData } = parsed.data`) already spreads every remaining `parsed.data` key, including `attributes`, straight into `prisma.listing.create({ data: { ...listingData, ... } })`.

- [ ] **Step 3: Update `app/api/listings/[id]/route.ts`**

In `updateSchema`, add `attributes` and `categorySlug` (the edit form's `CategoryPicker` already lets the user change category client-side, but the PUT body never sent it — a pre-existing gap that must be fixed here since vehicle attributes are meaningless without a correct, persisted `categorySlug`):

```typescript
const updateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'EXPIRED']).optional(),
  neighborhood: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  attributes: z.record(z.union([z.string(), z.number()])).nullable().optional(),
})
```
No further change needed — the `PUT` handler already does `data: { ...parsed.data, ...(coords && { lat: coords.lat, lng: coords.lng }) }`, so both new fields pass through.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -iE "types/index|api/listings" | head -20
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts app/api/listings/route.ts "app/api/listings/[id]/route.ts"
git commit -m "feat: accept and persist Listing.attributes + categorySlug on create/update"
```

---

### Task 8: Wire attributes into the post-ad form

**Files:**
- Modify: `app/deposer-annonce/page.tsx`

**Interfaces:**
- Consumes: `VehicleAttributesFields` (Task 6), `NewListing.attributes` (Task 7)

- [ ] **Step 1: Add attribute state and render `VehicleAttributesFields`**

Add the import at the top of `app/deposer-annonce/page.tsx`:
```typescript
import VehicleAttributesFields from '@/components/listings/VehicleAttributesFields'
```

Add attribute state right after the existing `form` state (~line 40):
```typescript
  const [attributes, setAttributes] = useState<Record<string, string | number>>({})
```

Reset attributes whenever the category changes (find the `CategoryPicker` block ~line 206-211 and change its `onChange`):
```typescript
            <CategoryPicker
              value={form.categorySlug}
              onChange={slug => { setForm(f => ({ ...f, categorySlug: slug })); setAttributes({}) }}
              error={errors.categorySlug}
            />
```

Render the fields right after that same block (still inside the "Infos" section, before the price input):
```typescript
          <VehicleAttributesFields
            categorySlug={form.categorySlug}
            value={attributes}
            onChange={setAttributes}
          />
```

Include `attributes` in the `addListing` call (~line 133-142):
```typescript
      const { id, pendingReview } = await addListing({
        title:        form.title,
        categorySlug: form.categorySlug,
        price:        form.price ? Number(form.price) : null,
        description:  form.description,
        neighborhood: location.name,
        lat:          location.lat,
        lng:          location.lng,
        phone:        form.phone || undefined,
        attributes:   Object.keys(attributes).length > 0 ? attributes : undefined,
      })
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "deposer-annonce" | head -10
```
Expected: no output.

- [ ] **Step 3: Manual browser verification**

```bash
npm run dev
```
Navigate to `http://localhost:3000/deposer-annonce` (logged in). Select category "Véhicules" → "Voitures". Confirm a "Caractéristiques du véhicule" section appears below the category picker with: Marque/Modèle, Année, Type de véhicule, Carburant, Boîte de vitesses, Kilométrage, Crit'air, Puissance DIN, Puissance fiscale, Portes, Places, Couleur. Pick a brand (e.g. PEUGEOT) and confirm the model dropdown populates with real Peugeot models (106, 205, 206, 207, 208…). Switch category to "Motos" and confirm the field set changes to the motos set. Switch to a non-vehicle category (e.g. "Maison & Mobilier") and confirm the section disappears entirely. Fill out a full "Voitures" ad and submit; confirm no console errors and the ad is created.

- [ ] **Step 4: Commit**

```bash
git add app/deposer-annonce/page.tsx
git commit -m "feat: capture vehicle attributes on the post-ad form"
```

---

### Task 9: Wire attributes into the edit-listing form

**Files:**
- Modify: `app/annonces/[id]/modifier/EditListingClient.tsx`
- Modify: `app/annonces/[id]/modifier/page.tsx` (whichever server file loads `listing` and passes it to `EditListingClient` — confirm exact path/shape with `grep -n "EditListingClient" app/annonces/[id]/modifier/page.tsx` before editing; it must select `attributes` in its Prisma query if it uses an explicit `select`, otherwise no change needed there)

**Interfaces:**
- Consumes: `VehicleAttributesFields` (Task 6)
- Produces: `PUT /api/listings/:id` body now includes `categorySlug` and `attributes`.

- [ ] **Step 1: Check how the edit page fetches the listing**

```bash
cat "app/annonces/[id]/modifier/page.tsx"
```
If it uses `prisma.listing.findUnique({ where: { id } })` with no `select`, `attributes` and `categorySlug` are already included — skip to Step 2. If it uses an explicit `select: {...}`, add `attributes: true` to that select object and add `attributes` to the `listing` prop type/mapping passed to `EditListingClient`.

- [ ] **Step 2: Update `EditListingClient.tsx` props type**

```typescript
type Props = {
  listing: {
    id: string; title: string; description: string
    price: number | null; categorySlug: string
    neighborhood: string; phone: string
    images: ExistingImage[]
    attributes: Record<string, string | number> | null
  }
}
```

- [ ] **Step 3: Add attribute state, render fields, reset on category change**

Add import:
```typescript
import VehicleAttributesFields from '@/components/listings/VehicleAttributesFields'
```

Add state after the existing `form` state:
```typescript
  const [attributes, setAttributes] = useState<Record<string, string | number>>(listing.attributes ?? {})
```

Update the `CategoryPicker` block:
```typescript
            <CategoryPicker
              value={form.categorySlug}
              onChange={slug => { setForm(f => ({ ...f, categorySlug: slug })); setAttributes({}) }}
              error={errors.categorySlug}
            />
```

Render fields right after that block:
```typescript
          <VehicleAttributesFields
            categorySlug={form.categorySlug}
            value={attributes}
            onChange={setAttributes}
          />
```

- [ ] **Step 4: Send `categorySlug` and `attributes` on save**

Update the PUT call in `handleSubmit` (~lines 86-95):
```typescript
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        form.title.trim(),
          description:  form.description.trim(),
          price:        form.price ? Number(form.price) : null,
          neighborhood: form.neighborhood,
          categorySlug: form.categorySlug,
          attributes:   Object.keys(attributes).length > 0 ? attributes : null,
        }),
      })
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -iE "modifier" | head -10
```
Expected: no output.

- [ ] **Step 6: Manual browser verification**

Open an existing "Voitures" listing you created in Task 8's verification, go to its edit page (`/annonces/<id>/modifier`), confirm the vehicle attribute fields are pre-filled with the values you entered, change one (e.g. kilométrage), save, and confirm the change persists after reload.

- [ ] **Step 7: Commit**

```bash
git add "app/annonces/[id]/modifier/EditListingClient.tsx" "app/annonces/[id]/modifier/page.tsx"
git commit -m "feat: edit vehicle attributes and persist categorySlug on listing edit"
```

---

### Task 10: Search-filter sidebar for vehicle attributes

**Files:**
- Create: `components/listings/VehicleAttributesFilters.tsx`
- Modify: `app/annonces/AnnoncesFilters.tsx`

**Interfaces:**
- Consumes: `VEHICLE_ATTRIBUTES` (Task 4), `BrandModelPicker` (Task 5)
- Produces: `<VehicleAttributesFilters cat={string} searchParams={SearchParamsLike} onUpdate={(key: string, value: string) => void} />`. URL params: `attr_<key>` for single-select fields storing a comma-separated list of selected option values (OR semantics); `attr_<brandKey>` / `attr_<modelKey>` for brand/model; `attr_<key>_min` / `attr_<key>_max` for range fields.

- [ ] **Step 1: Create `components/listings/VehicleAttributesFilters.tsx`**

```typescript
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
```

- [ ] **Step 2: Wire into `AnnoncesFilters.tsx`**

Add the import:
```typescript
import VehicleAttributesFilters from '@/components/listings/VehicleAttributesFilters'
```

In the `filtersContent` block, right after `<CategoryFilterPanel cat={cat} categories={categories} onUpdate={update} />` (~line 212), add:
```typescript
      {cat && <VehicleAttributesFilters cat={cat} searchParams={searchParams} onUpdate={update} />}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -iE "VehicleAttributesFilters|AnnoncesFilters" | head -10
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/listings/VehicleAttributesFilters.tsx app/annonces/AnnoncesFilters.tsx
git commit -m "feat: add vehicle attribute filters to the annonces search sidebar"
```

---

### Task 11: Query logic — filter listings by vehicle attributes

**Files:**
- Create: `lib/vehicleAttributesQuery.ts`
- Modify: `app/annonces/page.tsx`

**Interfaces:**
- Produces: `buildVehicleAttributeClauses(cat: string, params: Record<string, string | undefined>): Prisma.ListingWhereInput[]` — one clause per populated attribute filter, meant to be spread into an `AND` array.

- [ ] **Step 1: Create `lib/vehicleAttributesQuery.ts`**

```typescript
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
```

- [ ] **Step 2: Wire into `app/annonces/page.tsx`**

Add the import:
```typescript
import { buildVehicleAttributeClauses } from '@/lib/vehicleAttributesQuery'
```

Widen the `Props` type to accept arbitrary `attr_*` keys (find the `searchParams: Promise<{...}>` type ~line 29-33):
```typescript
type Props = {
  searchParams: Promise<{
    q?: string; cat?: string; ville?: string
    priceMin?: string; priceMax?: string; sort?: string; page?: string
    lat?: string; lng?: string; radius?: string; geoLabel?: string
    [key: string]: string | undefined
  }>
}
```

In `AnnoncesContent`, right after `const where = {...}` is fully built (after its closing `}` around line 112), add:
```typescript
  const vehicleClauses = cat ? buildVehicleAttributeClauses(cat, params) : []
  const whereWithAttrs = vehicleClauses.length > 0
    ? { ...where, AND: vehicleClauses }
    : where
```
Then replace every remaining use of `where` in the `prisma.listing.findMany` / `prisma.listing.count` calls (~lines 122-134) with `whereWithAttrs`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -iE "annonces/page|vehicleAttributesQuery" | head -20
```
Expected: no output. If Prisma's generated types reject `gte`/`lte` on a JSON field path for the `mysql` provider, `tsc` will surface it here — if so, replace the `range` branch in `buildVehicleAttributeClauses` with a raw SQL fallback using `Prisma.sql` + `JSON_EXTRACT(attributes, '$.mileage')` inside a `prisma.$queryRaw` pre-pass that collects matching listing IDs, then filter `where: { id: { in: matchingIds } }` — but attempt the direct JSON path filter first, since it is expected to work on Prisma 6.19.

- [ ] **Step 4: Manual browser verification**

```bash
npm run dev
```
Navigate to `http://localhost:3000/annonces?cat=voitures`. Confirm the vehicle filter fields appear in the sidebar. Filter by "Diesel" — confirm the listing you created in Task 8 (if Diesel) still appears, or disappears if you pick a different fuel. Set an "Année" min/max range that includes/excludes your test listing and confirm the result count changes accordingly. Test a multi-select (click two colors) and confirm OR behavior (a listing matching either color appears).

- [ ] **Step 5: Commit**

```bash
git add lib/vehicleAttributesQuery.ts app/annonces/page.tsx
git commit -m "feat: filter annonces by vehicle attributes (JSON path queries)"
```

---

### Task 12: Display attributes on the listing detail page

**Files:**
- Modify: `app/annonces/[id]/ListingDetailClient.tsx`

**Interfaces:**
- Consumes: `listing.attributes` (already present via unfiltered `prisma.listing.findUnique` in `app/annonces/[id]/page.tsx` — no server-side change needed), `VEHICLE_ATTRIBUTES` (Task 4)

- [ ] **Step 1: Add a small label-lookup helper and render a summary line**

Add the import at the top of `app/annonces/[id]/ListingDetailClient.tsx`:
```typescript
import { VEHICLE_ATTRIBUTES } from '@/lib/vehicleAttributes'
```

Add this helper function above the component (or inside the file, outside the component body):
```typescript
function formatVehicleAttributes(categorySlug: string, attributes: Record<string, string | number> | null | undefined): string[] {
  const fields = VEHICLE_ATTRIBUTES[categorySlug]
  if (!fields || !attributes) return []

  const parts: string[] = []
  for (const field of fields) {
    if (field.type === 'brand-model') {
      const brand = attributes[field.brandKey]
      const model = attributes[field.modelKey]
      if (brand) parts.push([brand, model].filter(Boolean).join(' '))
    } else if (field.type === 'select') {
      const raw = attributes[field.key]
      if (raw !== undefined && raw !== '') {
        const opt = field.options.find(o => o.value === String(raw))
        if (opt) parts.push(field.key === 'critair' ? `Crit'air ${opt.label}` : opt.label)
      }
    } else {
      const raw = attributes[field.key]
      if (raw !== undefined && raw !== '') {
        parts.push(field.unit ? `${raw} ${field.unit}` : String(raw))
      }
    }
  }
  return parts
}
```

Find the details block (~lines 168-181, right after the price/title header, before the description `<div>`) and insert a summary chip row between the neighborhood/date row and the description:
```typescript
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.neighborhood}, {listing.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {t('published_on')} {publishDate}</span>
            </div>

            {(() => {
              const attrs = formatVehicleAttributes(listing.categorySlug, listing.attributes)
              return attrs.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {attrs.map((a, i) => (
                    <span key={i} className="text-xs font-semibold text-navy bg-gray-100 px-2.5 py-1 rounded-lg">{a}</span>
                  ))}
                </div>
              ) : null
            })()}

            <div>
              <h2 className="font-semibold text-navy mb-2">{t('description')}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -i "ListingDetailClient" | head -10
```
Expected: no output.

- [ ] **Step 3: Manual browser verification**

Open the "Voitures" test listing's detail page (`/annonces/<id>`). Confirm a row of chips appears above the description showing the brand+model, año, fuel, gearbox, mileage, etc. you entered — e.g. "PEUGEOT 208", "2019", "Diesel", "Manuelle", "45000 km".

- [ ] **Step 4: Commit**

```bash
git add "app/annonces/[id]/ListingDetailClient.tsx"
git commit -m "feat: display vehicle attributes summary on listing detail page"
```

---

### Task 13: Full build verification

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

```bash
npx tsc --noEmit
```
Expected: no errors anywhere in the project (not just the files touched by this plan).

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: build succeeds (`✓ Compiled successfully`). Pay attention to the reported First Load JS for `/deposer-annonce` and `/annonces` — the vehicle brand/model JSON should NOT show up in their shared chunk (it should appear as a separate on-demand chunk, confirming the `next/dynamic` lazy-loading from Tasks 5/6/10 is working).

```bash
npm run lint
```
Expected: no new lint errors.

- [ ] **Step 3: End-to-end browser walkthrough**

```bash
npm run dev
```
Repeat, in one pass: post a "Motos" ad (confirm cylindrée/type/permis fields), post a "Caravaning" ad (confirm only année/kilométrage appear, no brand), post an "Équipement auto" ad (confirm zero extra fields — just the standard title/price/description). For each, verify on `/annonces?cat=<slug>` that the category filter list still shows exactly the 9 flat vehicules entries with no nested chevron/expansion arrows (since none have children anymore).

- [ ] **Step 4: Commit** (only if any fixes were needed in this task; otherwise skip)

```bash
git add -A
git commit -m "fix: address build/lint issues found during verification"
```

---

### Task 14: Deploy

**Files:** none (deployment only)

- [ ] **Step 1: Push to `main`**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
git log --oneline origin/main..HEAD
git push origin main
```
This repo is linked to Vercel via GitHub integration (`.vercel/project.json` present, no local Vercel CLI) — pushing to `main` triggers an automatic production build + deploy.

- [ ] **Step 2: Watch the deploy**

If the `vercel` CLI becomes available, `vercel ls` / the Vercel dashboard shows build progress; otherwise check `https://vercel.com` project dashboard directly, or wait ~2-3 minutes and verify the live site.

- [ ] **Step 3: Verify production**

Once deployed, check the live domain: `/annonces?cat=vehicules` should show the flat 9-subcategory filter list; `/deposer-annonce` with category "Voitures" should show the vehicle attribute fields with the real brand/model data loading correctly (this confirms the migration + reseed already applied in Tasks 1 and 3 against the same production DB took effect, and that the new code path reads it correctly).

- [ ] **Step 4: Report back**

Summarize to the user: what changed, the production deploy URL/commit, and remind them the two now-empty scratch scripts (`/tmp/vehicle-data-gen/*`, `cleanup_orphan_categories_tmp.js`) were never committed — only their JSON/data output was.

---

## Self-Review Checklist

**Spec coverage** (against `docs/superpowers/specs/2026-07-22-vehicules-leboncoin-design.md`):
- [x] Flat 9-subcategory tree — Task 3
- [x] `Listing.attributes` JSON column — Task 1
- [x] Attribute schema per subcategory (voitures/motos/utilitaires/caravaning/nautisme + no-op equipement_*) — Task 4
- [x] Full brand/model data generation (8,378 models) — Task 2
- [x] Post/edit form dynamic fields — Tasks 6, 8, 9
- [x] Search filters with full parity (all attributes, not a subset) — Tasks 10, 11
- [x] Listing detail display — Task 12
- [x] Translations for new/renamed categories (en/es/de/nl/uk/ru) — Task 3
- [x] No data migration needed / orphan cleanup guarded by a live re-check — Task 3 Step 5
- [x] Deploy — Task 14

**Placeholder scan:** none found — every step has complete code or an exact command with expected output.

**Type consistency:** `AttrFieldDef`/`VEHICLE_ATTRIBUTES` (Task 4) is consumed with identical shape by `VehicleAttributesFields` (Task 6), `VehicleAttributesFilters` (Task 10), `buildVehicleAttributeClauses` (Task 11), and `formatVehicleAttributes` (Task 12) — all four switch on the same three `type` tags (`brand-model`/`select`/`range`) and the same field key names (`brandKey`/`modelKey`/`key`/`options`/`unit`). `NewListing.attributes` (Task 7) matches the `Record<string, string | number>` shape produced by `VehicleAttributesFields`'s `onChange` (Task 6) and consumed by `addListing` (unchanged, already generic passthrough in `context/ListingsContext.tsx`).
