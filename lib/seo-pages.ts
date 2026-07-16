export type VilleSEO = {
  slug: string
  labelFr: string
  dbTerms: string[]
}

export const VILLES: VilleSEO[] = [
  { slug: 'madrid',          labelFr: 'Madrid',           dbTerms: ['Madrid'] },
  { slug: 'barcelone',       labelFr: 'Barcelone',         dbTerms: ['Barcelona', 'Barcelone'] },
  { slug: 'valence',         labelFr: 'Valence',           dbTerms: ['Valencia', 'Valence'] },
  { slug: 'seville',         labelFr: 'Séville',           dbTerms: ['Sevilla', 'Seville', 'Séville'] },
  { slug: 'malaga',          labelFr: 'Malaga',            dbTerms: ['Malaga', 'Málaga'] },
  { slug: 'alicante',        labelFr: 'Alicante',          dbTerms: ['Alicante', 'Alacant'] },
  { slug: 'murcie',          labelFr: 'Murcie',            dbTerms: ['Murcia', 'Murcie'] },
  { slug: 'bilbao',          labelFr: 'Bilbao',            dbTerms: ['Bilbao'] },
  { slug: 'saragosse',       labelFr: 'Saragosse',         dbTerms: ['Zaragoza', 'Saragosse'] },
  { slug: 'palma',           labelFr: 'Palma de Majorque', dbTerms: ['Palma', 'Palma de Mallorca'] },
  { slug: 'ibiza',           labelFr: 'Ibiza',             dbTerms: ['Ibiza', 'Eivissa'] },
  { slug: 'majorque',        labelFr: 'Majorque',          dbTerms: ['Mallorca', 'Majorque'] },
  { slug: 'minorque',        labelFr: 'Minorque',          dbTerms: ['Menorca', 'Minorque'] },
  { slug: 'tenerife',        labelFr: 'Tenerife',          dbTerms: ['Tenerife'] },
  { slug: 'grande-canarie',  labelFr: 'Grande Canarie',    dbTerms: ['Gran Canaria', 'Las Palmas', 'Grande Canarie'] },
  { slug: 'lanzarote',       labelFr: 'Lanzarote',         dbTerms: ['Lanzarote', 'Arrecife'] },
  { slug: 'fuerteventura',   labelFr: 'Fuerteventura',     dbTerms: ['Fuerteventura'] },
  { slug: 'la-palma',        labelFr: 'La Palma',          dbTerms: ['La Palma'] },
  { slug: 'la-gomera',       labelFr: 'La Gomera',         dbTerms: ['La Gomera'] },
  { slug: 'el-hierro',       labelFr: 'El Hierro',         dbTerms: ['El Hierro'] },
]

export type CategorieSEO = {
  seoSlug: string
  categorySlug: string
  label: string
  h1: string
  intro: string
  metaDesc: string
}

export const CATEGORIES_SEO: CategorieSEO[] = [
  {
    seoSlug: 'immobilier-espagne',
    categorySlug: 'immobilier',
    label: 'Immobilier en Espagne',
    h1: 'Immobilier en Espagne — Vente & Location',
    intro: "Trouvez votre bien immobilier en Espagne parmi des centaines d'annonces entre particuliers et expatriés francophones. Appartements, maisons, villas, terrains et locaux commerciaux à vendre ou à louer partout en Espagne.",
    metaDesc: "Annonces immobilières en Espagne entre particuliers. Appartements, maisons et villas à vendre ou louer. Communauté francophone expatriée en Espagne.",
  },
  {
    seoSlug: 'voitures-occasion-espagne',
    categorySlug: 'voitures',
    label: 'Voitures occasion en Espagne',
    h1: 'Voitures occasion en Espagne',
    intro: "Achetez ou vendez une voiture d'occasion en Espagne entre particuliers. Berlines, SUV, breaks, cabriolets et utilitaires — des centaines d'annonces publiées par des expatriés francophones.",
    metaDesc: "Voitures occasion en Espagne entre particuliers. Achetez ou vendez sans intermédiaire. Annonces de la communauté expatriée francophone.",
  },
  {
    seoSlug: 'emploi-espagne',
    categorySlug: 'services',
    label: 'Emploi en Espagne',
    h1: 'Emploi & Travail en Espagne',
    intro: "Offres d'emploi et opportunités professionnelles en Espagne pour francophones et expatriés. Trouvez un job, proposez vos services ou recrutez dans la communauté française d'Espagne.",
    metaDesc: "Emploi en Espagne pour francophones et expatriés. Offres d'emploi, jobs et opportunités professionnelles dans la communauté française.",
  },
  {
    seoSlug: 'animaux-espagne',
    categorySlug: 'animaux',
    label: 'Animaux en Espagne',
    h1: 'Animaux — Adoptions & Accessoires en Espagne',
    intro: "Adoptez un chien, un chat ou d'autres animaux de compagnie en Espagne. Trouvez également des accessoires, aliments et services pour animaux entre expatriés francophones.",
    metaDesc: "Annonces animaux en Espagne : adoption chiens, chats, rongeurs. Accessoires et soins. Communauté francophone expatriée.",
  },
  {
    seoSlug: 'maison-espagne',
    categorySlug: 'meubles',
    label: 'Maison & Mobilier en Espagne',
    h1: 'Maison & Mobilier occasion en Espagne',
    intro: "Meubles, électroménager, décoration et bricolage d'occasion en Espagne. Achetez ou vendez vos affaires de maison entre expatriés francophones partout en Espagne.",
    metaDesc: "Meubles, électroménager et décoration occasion en Espagne. Annonces entre expatriés francophones.",
  },
  {
    seoSlug: 'high-tech-espagne',
    categorySlug: 'multimedia',
    label: 'High-tech & Informatique en Espagne',
    h1: 'High-tech & Multimédia occasion en Espagne',
    intro: "Smartphones, ordinateurs, tablettes, jeux vidéo et appareils photo d'occasion en Espagne. Achetez ou vendez votre matériel high-tech entre expatriés francophones.",
    metaDesc: "High-tech occasion en Espagne : iPhone, MacBook, PS5, Nintendo Switch. Annonces entre particuliers de la communauté francophone.",
  },
  {
    seoSlug: 'mode-espagne',
    categorySlug: 'mode',
    label: 'Mode & Beauté en Espagne',
    h1: 'Mode, Vêtements & Beauté en Espagne',
    intro: "Vêtements, chaussures, sacs, bijoux et produits de beauté neufs ou d'occasion en Espagne. Achetez et vendez votre mode entre expatriés francophones.",
    metaDesc: "Mode occasion en Espagne : vêtements, chaussures, sacs et bijoux. Annonces entre expatriés francophones.",
  },
  {
    seoSlug: 'enfants-espagne',
    categorySlug: 'enfants',
    label: 'Enfants & Famille en Espagne',
    h1: 'Articles enfants & bébé en Espagne',
    intro: "Poussettes, jouets, vêtements bébé, sièges auto et jeux éducatifs d'occasion en Espagne. La communauté francophone pour acheter et vendre vos affaires de bébé et d'enfants.",
    metaDesc: "Articles enfants et bébé occasion en Espagne : poussettes, jouets, vêtements. Annonces entre expatriés francophones.",
  },
  {
    seoSlug: 'loisirs-sport-espagne',
    categorySlug: 'livres',
    label: 'Loisirs & Sport en Espagne',
    h1: 'Loisirs, Sport & Culture en Espagne',
    intro: "Vélos, équipements sportifs, instruments de musique, livres et jeux vidéo d'occasion en Espagne. Achetez et vendez vos loisirs entre expatriés francophones.",
    metaDesc: "Loisirs et sport occasion en Espagne : vélos, instruments, livres. Annonces entre expatriés francophones.",
  },
  {
    seoSlug: 'services-espagne',
    categorySlug: 'services',
    label: 'Services aux expatriés en Espagne',
    h1: 'Services aux expatriés en Espagne',
    intro: "Cours de langue, aide à domicile, artisans, déménagement et services informatiques proposés par des francophones en Espagne. La marketplace de services entre expatriés.",
    metaDesc: "Services entre expatriés en Espagne : cours, aide à domicile, artisans, déménagement. Communauté francophone.",
  },
  {
    seoSlug: 'dons-espagne',
    categorySlug: 'dons',
    label: 'Dons & Objets gratuits en Espagne',
    h1: 'Dons gratuits en Espagne',
    intro: "Donnez ou récupérez des objets, meubles, vêtements et bien plus gratuitement en Espagne. La section dons de la communauté francophone expatriée.",
    metaDesc: "Dons gratuits en Espagne : meubles, vêtements, objets. Récupérez gratuitement entre expatriés francophones.",
  },
]
