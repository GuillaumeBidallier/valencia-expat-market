export type VilleSEO = {
  slug: string
  labelFr: string
  dbTerms: string[]
}

export const VILLES: VilleSEO[] = [
  { slug: 'bruxelles',        labelFr: 'Bruxelles',         dbTerms: ['Brussels', 'Bruxelles', 'Brussel'] },
  { slug: 'anvers',           labelFr: 'Anvers',            dbTerms: ['Antwerpen', 'Anvers', 'Antwerp'] },
  { slug: 'gand',             labelFr: 'Gand',               dbTerms: ['Gent', 'Gand', 'Ghent'] },
  { slug: 'liege',            labelFr: 'Liège',              dbTerms: ['Liège', 'Luik', 'Liege'] },
  { slug: 'bruges',           labelFr: 'Bruges',             dbTerms: ['Brugge', 'Bruges'] },
  { slug: 'namur',            labelFr: 'Namur',              dbTerms: ['Namur'] },
  { slug: 'charleroi',        labelFr: 'Charleroi',          dbTerms: ['Charleroi'] },
  { slug: 'louvain',          labelFr: 'Louvain',            dbTerms: ['Leuven', 'Louvain'] },
  { slug: 'mons',             labelFr: 'Mons',                dbTerms: ['Mons', 'Bergen'] },
  { slug: 'ostende',          labelFr: 'Ostende',            dbTerms: ['Oostende', 'Ostende'] },
  { slug: 'malines',          labelFr: 'Malines',            dbTerms: ['Mechelen', 'Malines'] },
  { slug: 'courtrai',         labelFr: 'Courtrai',           dbTerms: ['Kortrijk', 'Courtrai'] },
  { slug: 'hasselt',          labelFr: 'Hasselt',            dbTerms: ['Hasselt'] },
  { slug: 'tournai',          labelFr: 'Tournai',            dbTerms: ['Tournai', 'Doornik'] },
  { slug: 'louvain-la-neuve', labelFr: 'Louvain-la-Neuve',   dbTerms: ['Louvain-la-Neuve'] },
  { slug: 'waterloo',         labelFr: 'Waterloo',           dbTerms: ['Waterloo'] },
  { slug: 'wavre',            labelFr: 'Wavre',               dbTerms: ['Wavre'] },
  { slug: 'verviers',         labelFr: 'Verviers',           dbTerms: ['Verviers'] },
  { slug: 'genk',             labelFr: 'Genk',                dbTerms: ['Genk'] },
  { slug: 'seraing',          labelFr: 'Seraing',            dbTerms: ['Seraing'] },
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
    seoSlug: 'immobilier-belgique',
    categorySlug: 'immobilier',
    label: 'Immobilier en Belgique',
    h1: 'Immobilier en Belgique — Vente & Location',
    intro: "Trouvez votre bien immobilier en Belgique parmi des centaines d'annonces entre particuliers francophones. Appartements, maisons, villas, terrains et locaux commerciaux à vendre ou à louer partout en Belgique.",
    metaDesc: "Annonces immobilières en Belgique entre particuliers. Appartements, maisons et villas à vendre ou louer. Communauté francophone en Belgique.",
  },
  {
    seoSlug: 'voitures-occasion-belgique',
    categorySlug: 'voitures',
    label: 'Voitures occasion en Belgique',
    h1: 'Voitures occasion en Belgique',
    intro: "Achetez ou vendez une voiture d'occasion en Belgique entre particuliers. Berlines, SUV, breaks, cabriolets et utilitaires — des centaines d'annonces publiées par des francophones.",
    metaDesc: "Voitures occasion en Belgique entre particuliers. Achetez ou vendez sans intermédiaire. Annonces de la communauté francophone.",
  },
  {
    seoSlug: 'emploi-belgique',
    categorySlug: 'services',
    label: 'Emploi en Belgique',
    h1: 'Emploi & Travail en Belgique',
    intro: "Offres d'emploi et opportunités professionnelles en Belgique pour francophones. Trouvez un job, proposez vos services ou recrutez dans la communauté française de Belgique.",
    metaDesc: "Emploi en Belgique pour francophones. Offres d'emploi, jobs et opportunités professionnelles dans la communauté française.",
  },
  {
    seoSlug: 'animaux-belgique',
    categorySlug: 'animaux',
    label: 'Animaux en Belgique',
    h1: 'Animaux — Adoptions & Accessoires en Belgique',
    intro: "Adoptez un chien, un chat ou d'autres animaux de compagnie en Belgique. Trouvez également des accessoires, aliments et services pour animaux entre particuliers francophones.",
    metaDesc: "Annonces animaux en Belgique : adoption chiens, chats, rongeurs. Accessoires et soins. Communauté francophone.",
  },
  {
    seoSlug: 'maison-belgique',
    categorySlug: 'meubles',
    label: 'Maison & Mobilier en Belgique',
    h1: 'Maison & Mobilier occasion en Belgique',
    intro: "Meubles, électroménager, décoration et bricolage d'occasion en Belgique. Achetez ou vendez vos affaires de maison entre particuliers francophones partout en Belgique.",
    metaDesc: "Meubles, électroménager et décoration occasion en Belgique. Annonces entre particuliers francophones.",
  },
  {
    seoSlug: 'high-tech-belgique',
    categorySlug: 'multimedia',
    label: 'High-tech & Informatique en Belgique',
    h1: 'High-tech & Multimédia occasion en Belgique',
    intro: "Smartphones, ordinateurs, tablettes, jeux vidéo et appareils photo d'occasion en Belgique. Achetez ou vendez votre matériel high-tech entre particuliers francophones.",
    metaDesc: "High-tech occasion en Belgique : iPhone, MacBook, PS5, Nintendo Switch. Annonces entre particuliers de la communauté francophone.",
  },
  {
    seoSlug: 'mode-belgique',
    categorySlug: 'mode',
    label: 'Mode & Beauté en Belgique',
    h1: 'Mode, Vêtements & Beauté en Belgique',
    intro: "Vêtements, chaussures, sacs, bijoux et produits de beauté neufs ou d'occasion en Belgique. Achetez et vendez votre mode entre particuliers francophones.",
    metaDesc: "Mode occasion en Belgique : vêtements, chaussures, sacs et bijoux. Annonces entre particuliers francophones.",
  },
  {
    seoSlug: 'enfants-belgique',
    categorySlug: 'enfants',
    label: 'Enfants & Famille en Belgique',
    h1: 'Articles enfants & bébé en Belgique',
    intro: "Poussettes, jouets, vêtements bébé, sièges auto et jeux éducatifs d'occasion en Belgique. La communauté francophone pour acheter et vendre vos affaires de bébé et d'enfants.",
    metaDesc: "Articles enfants et bébé occasion en Belgique : poussettes, jouets, vêtements. Annonces entre particuliers francophones.",
  },
  {
    seoSlug: 'loisirs-sport-belgique',
    categorySlug: 'livres',
    label: 'Loisirs & Sport en Belgique',
    h1: 'Loisirs, Sport & Culture en Belgique',
    intro: "Vélos, équipements sportifs, instruments de musique, livres et jeux vidéo d'occasion en Belgique. Achetez et vendez vos loisirs entre particuliers francophones.",
    metaDesc: "Loisirs et sport occasion en Belgique : vélos, instruments, livres. Annonces entre particuliers francophones.",
  },
  {
    seoSlug: 'services-belgique',
    categorySlug: 'services',
    label: 'Services pour francophones en Belgique',
    h1: 'Services pour francophones en Belgique',
    intro: "Cours de langue, aide à domicile, artisans, déménagement et services informatiques proposés par des francophones en Belgique. La marketplace de services de la communauté francophone.",
    metaDesc: "Services pour francophones en Belgique : cours, aide à domicile, artisans, déménagement. Communauté francophone.",
  },
  {
    seoSlug: 'dons-belgique',
    categorySlug: 'dons',
    label: 'Dons & Objets gratuits en Belgique',
    h1: 'Dons gratuits en Belgique',
    intro: "Donnez ou récupérez des objets, meubles, vêtements et bien plus gratuitement en Belgique. La section dons de la communauté francophone.",
    metaDesc: "Dons gratuits en Belgique : meubles, vêtements, objets. Récupérez gratuitement entre particuliers francophones.",
  },
]
