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
  /** When true, listings can have several values at once (stored as a string[]). */
  multi?: boolean
}

export interface RangeFieldDef {
  type: 'range'
  key: string
  label: string
  unit?: string
}

export interface StepperOption {
  value: number
  label: string
  /** Last option in the row acts as "N or more" — filters omit the upper bound. */
  openEnded?: boolean
}

export interface StepperFieldDef {
  type: 'stepper'
  key: string
  label: string
  unit?: string
  options: StepperOption[]
}

export type AttrFieldDef = BrandModelFieldDef | SelectFieldDef | RangeFieldDef | StepperFieldDef

/** Builds the 1..N-1, "N+" stepper options used for room/bedroom counts. */
export function stepperUpTo(max: number): StepperOption[] {
  return Array.from({ length: max }, (_, i) => i + 1).map(n => ({
    value: n,
    label: n === max ? `${n}+` : String(n),
    openEnded: n === max,
  }))
}

export const FUEL: AttrOption[] = [
  { value: '1', label: 'Essence' },
  { value: '2', label: 'Diesel' },
  { value: '6', label: 'Hybride' },
  { value: '4', label: 'Electrique' },
  { value: '3', label: 'GPL' },
  { value: '5', label: 'Autre' },
]

export const GEARBOX: AttrOption[] = [
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

const TRUCK_TYPE: AttrOption[] = [
  { value: 'camion', label: 'Camion' },
  { value: 'bus', label: 'Bus' },
  { value: 'tracteurroutier', label: 'Tracteur routier' },
  { value: 'remorque', label: 'Remorque' },
  { value: 'semiremorque', label: 'Semi remorque' },
  { value: 'autres', label: 'Autres' },
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
    { type: 'select', key: 'fuel', label: 'Carburant', options: FUEL },
    { type: 'select', key: 'gearbox', label: 'Boîte de vitesses', options: GEARBOX },
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
  camions: [
    { type: 'brand-model', vehicleType: 'utility', brandKey: 'brand', modelKey: 'model', label: 'Marque' },
    { type: 'select', key: 'truck_type', label: 'Type', options: TRUCK_TYPE },
    { type: 'range', key: 'regdate', label: 'Année' },
    { type: 'select', key: 'fuel', label: 'Carburant', options: FUEL },
    { type: 'range', key: 'mileage', label: 'Kilométrage', unit: 'km' },
    { type: 'range', key: 'horse_power_din', label: 'Puissance DIN', unit: 'ch' },
    { type: 'range', key: 'horsepower', label: 'Puissance fiscale', unit: 'cv' },
    { type: 'select', key: 'gearbox', label: 'Boîte de vitesses', options: GEARBOX },
    { type: 'select', key: 'vehicule_color', label: 'Couleur', options: VEHICULE_COLOR },
    { type: 'select', key: 'critair', label: "Crit'air", options: CRITAIR },
  ],
}

export function isVehicleCategory(slug: string): boolean {
  return slug in VEHICLE_ATTRIBUTES
}
