import type { AttrFieldDef, AttrOption } from './vehicleAttributes'
import { stepperUpTo } from './vehicleAttributes'

const TYPE_BIEN: AttrOption[] = [
  { value: 'maison', label: 'Maison' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'parking', label: 'Parking' },
  { value: 'programme_neuf', label: 'Programme neuf' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'chateau', label: 'Château' },
  { value: 'loft_atelier', label: 'Loft / Atelier / Surface' },
]

const TYPE_VENTE: AttrOption[] = [
  { value: 'classique', label: 'Vente classique' },
  { value: 'encheres', label: 'Vente aux enchères' },
  { value: 'viager', label: 'Viager' },
  { value: 'adjudication', label: 'Adjudication' },
]

const EXTERIEUR: AttrOption[] = [
  { value: 'balcon', label: 'Balcon' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'jardin', label: 'Jardin' },
  { value: 'cour', label: 'Cour' },
]

const ETAGE: AttrOption[] = [
  { value: '0', label: 'Rez-de-chaussée' },
  { value: '1', label: '1er étage' },
  { value: '2', label: '2e étage' },
  { value: '3', label: '3e étage' },
  { value: '4', label: '4e étage' },
  { value: '5', label: '5e étage et plus' },
  { value: 'dernier', label: 'Dernier étage' },
]

const OUI_NON: AttrOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
]

const EXPOSITION: AttrOption[] = [
  { value: 'nord', label: 'Nord' },
  { value: 'sud', label: 'Sud' },
  { value: 'est', label: 'Est' },
  { value: 'ouest', label: 'Ouest' },
  { value: 'nord-est', label: 'Nord-Est' },
  { value: 'nord-ouest', label: 'Nord-Ouest' },
  { value: 'sud-est', label: 'Sud-Est' },
  { value: 'sud-ouest', label: 'Sud-Ouest' },
]

const CARACTERISTIQUES: AttrOption[] = [
  { value: 'cave', label: 'Cave' },
  { value: 'parking_garage', label: 'Parking / Garage' },
  { value: 'piscine', label: 'Piscine' },
  { value: 'climatisation', label: 'Climatisation' },
  { value: 'cheminee', label: 'Cheminée' },
  { value: 'interphone_digicode', label: 'Interphone / Digicode' },
  { value: 'alarme', label: 'Alarme' },
  { value: 'gardien', label: 'Gardien' },
  { value: 'meuble', label: 'Meublé' },
  { value: 'cuisine_equipee', label: 'Cuisine équipée' },
  { value: 'cuisine_americaine', label: 'Cuisine américaine' },
  { value: 'acces_handicape', label: 'Accès handicapé' },
  { value: 'fibre_optique', label: 'Fibre optique' },
  { value: 'wifi', label: 'Wifi' },
]

const CARACTERISTIQUES_COMMERCE: AttrOption[] = [
  { value: 'climatisation', label: 'Climatisation' },
  { value: 'parking', label: 'Parking' },
  { value: 'vitrine', label: 'Vitrine' },
  { value: 'alarme', label: 'Alarme' },
  { value: 'acces_handicape', label: 'Accès handicapé' },
  { value: 'fibre_optique', label: 'Fibre optique' },
]

const CARACTERISTIQUES_TERRAIN: AttrOption[] = [
  { value: 'viabilise', label: 'Viabilisé' },
  { value: 'constructible', label: 'Constructible' },
  { value: 'non_constructible', label: 'Non constructible' },
  { value: 'plat', label: 'Plat' },
  { value: 'en_pente', label: 'En pente' },
]

const ETAT_BIEN: AttrOption[] = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'a_rafraichir', label: 'À rafraîchir' },
  { value: 'a_renover', label: 'À rénover' },
  { value: 'a_restaurer', label: 'À restaurer' },
]

const CLASSE_ENERGIE: AttrOption[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: 'vierge', label: 'Vierge (non soumis au DPE)' },
]

const pieces    = (): AttrFieldDef => ({ type: 'stepper', key: 'pieces',    label: 'Pièces',   unit: 'pièces',   options: stepperUpTo(8) })
const chambres  = (): AttrFieldDef => ({ type: 'stepper', key: 'chambres', label: 'Chambres', unit: 'chambres', options: stepperUpTo(8) })

const typeBien = (options: AttrOption[] = TYPE_BIEN): AttrFieldDef =>
  ({ type: 'select', key: 'type_bien', label: 'Type de bien', options, multi: true })

/** Full residential set: appartements (sale or rent), with floor/lift specifics. */
function residentialAppart(withTypeVente: boolean): AttrFieldDef[] {
  return [
    typeBien(),
    { type: 'range', key: 'surface_habitable', label: 'Surface habitable', unit: 'm²' },
    ...(withTypeVente ? [{ type: 'select', key: 'type_vente', label: 'Type de vente', options: TYPE_VENTE } as AttrFieldDef] : []),
    pieces(),
    chambres(),
    { type: 'select', key: 'etage', label: "Étage de l'appartement", options: ETAGE },
    { type: 'select', key: 'ascenseur', label: 'Avec ascenseur', options: OUI_NON },
    { type: 'select', key: 'exterieur', label: 'Extérieur', options: EXTERIEUR, multi: true },
    { type: 'select', key: 'exposition', label: 'Exposition', options: EXPOSITION, multi: true },
    { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES, multi: true },
    { type: 'select', key: 'etat_bien', label: 'État du bien', options: ETAT_BIEN },
    { type: 'select', key: 'classe_energie', label: 'Classe énergie (DPE)', options: CLASSE_ENERGIE },
  ]
}

/** Full residential set: maisons & villas (sale or rent), with land surface instead of floor/lift. */
function residentialMaison(withTypeVente: boolean): AttrFieldDef[] {
  return [
    typeBien(),
    { type: 'range', key: 'surface_habitable', label: 'Surface habitable', unit: 'm²' },
    ...(withTypeVente ? [{ type: 'select', key: 'type_vente', label: 'Type de vente', options: TYPE_VENTE } as AttrFieldDef] : []),
    { type: 'range', key: 'surface_terrain', label: 'Surface du terrain', unit: 'm²' },
    pieces(),
    chambres(),
    { type: 'select', key: 'exterieur', label: 'Extérieur', options: EXTERIEUR, multi: true },
    { type: 'select', key: 'exposition', label: 'Exposition', options: EXPOSITION, multi: true },
    { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES, multi: true },
    { type: 'select', key: 'etat_bien', label: 'État du bien', options: ETAT_BIEN },
    { type: 'select', key: 'classe_energie', label: 'Classe énergie (DPE)', options: CLASSE_ENERGIE },
  ]
}

function commerce(withTypeVente: boolean): AttrFieldDef[] {
  return [
    typeBien([
      { value: 'local_commercial', label: 'Local commercial' },
      { value: 'bureaux', label: 'Bureaux' },
      { value: 'entrepot', label: 'Entrepôt' },
      { value: 'fonds_de_commerce', label: 'Fonds de commerce' },
    ]),
    { type: 'range', key: 'surface_habitable', label: 'Surface', unit: 'm²' },
    ...(withTypeVente ? [{ type: 'select', key: 'type_vente', label: 'Type de vente', options: TYPE_VENTE } as AttrFieldDef] : []),
    { type: 'select', key: 'etat_bien', label: 'État du bien', options: ETAT_BIEN },
    { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES_COMMERCE, multi: true },
  ]
}

const terrain: AttrFieldDef[] = [
  typeBien([{ value: 'terrain', label: 'Terrain' }]),
  { type: 'range', key: 'surface_terrain', label: 'Surface du terrain', unit: 'm²' },
  { type: 'select', key: 'type_vente', label: 'Type de vente', options: TYPE_VENTE },
  { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES_TERRAIN, multi: true },
]

const colocation: AttrFieldDef[] = [
  { type: 'range', key: 'surface_habitable', label: 'Surface habitable', unit: 'm²' },
  chambres(),
  { type: 'select', key: 'exterieur', label: 'Extérieur', options: EXTERIEUR, multi: true },
  { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES, multi: true },
  { type: 'select', key: 'etat_bien', label: 'État du bien', options: ETAT_BIEN },
]

const locationSaisonniere: AttrFieldDef[] = [
  { type: 'range', key: 'surface_habitable', label: 'Surface habitable', unit: 'm²' },
  pieces(),
  chambres(),
  { type: 'range', key: 'capacite', label: 'Capacité', unit: 'personnes' },
  { type: 'select', key: 'exterieur', label: 'Extérieur', options: EXTERIEUR, multi: true },
  { type: 'select', key: 'caracteristiques', label: 'Caractéristiques', options: CARACTERISTIQUES, multi: true },
]

const chambreBnb: AttrFieldDef[] = [
  { type: 'range', key: 'surface_habitable', label: 'Surface de la chambre', unit: 'm²' },
  { type: 'range', key: 'capacite', label: 'Capacité', unit: 'personnes' },
  {
    type: 'select', key: 'caracteristiques', multi: true, label: 'Caractéristiques',
    options: [
      { value: 'salle_de_bain_privee', label: 'Salle de bain privée' },
      { value: 'petit_dejeuner_inclus', label: 'Petit-déjeuner inclus' },
      { value: 'wifi', label: 'Wifi' },
      { value: 'climatisation', label: 'Climatisation' },
    ],
  },
]

export const REAL_ESTATE_ATTRIBUTES: Record<string, AttrFieldDef[]> = {
  // Root + section-level slugs: a broad, appartement-shaped set so filters/fields
  // are still available before the user drills into a specific property type.
  immobilier: residentialAppart(true),
  'vente-immo': residentialAppart(true),
  'location-immo': residentialAppart(false),
  'vacances-immo': locationSaisonniere,

  'vente-appartements': residentialAppart(true),
  'vente-maisons': residentialMaison(true),
  'vente-terrains': terrain,
  'vente-commerces': commerce(true),

  'location-appartements': residentialAppart(false),
  'location-maisons': residentialMaison(false),
  colocations: colocation,
  'location-commerces': commerce(false),

  'locations-saisonnieres': locationSaisonniere,
  'chambres-bnb': chambreBnb,
}

export function isRealEstateCategory(slug: string): boolean {
  return slug in REAL_ESTATE_ATTRIBUTES
}
