import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

const LISTINGS: {
  id: string
  title: string
  description: string
  price: number | null
  categorySlug: string
  city: string
  neighborhood: string
  isPremium?: boolean
  images: string[]
}[] = [
  {
    id: 'seed-1',
    title: 'Canapé 3 places IKEA Kivik',
    description: 'Canapé 3 places IKEA Kivik en très bon état. Housse lavable gris clair. À vendre car déménagement en France.',
    price: 150,
    categorySlug: 'meubles',
    city: 'Valencia',
    neighborhood: 'Ruzafa',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
    ],
  },
  {
    id: 'seed-2',
    title: 'Vélo enfant 4-6 ans avec stabilisateurs',
    description: 'Vélo rouge pour enfant 4-6 ans avec stabilisateurs amovibles. Casque inclus, bon état général.',
    price: 40,
    categorySlug: 'enfants',
    city: 'Valencia',
    neighborhood: 'Benimaclet',
    images: [
      'https://images.unsplash.com/photo-1575585269294-7d28bb912db8?w=600&q=80',
    ],
  },
  {
    id: 'seed-3',
    title: 'Lave-linge Bosch Serie 4 7kg',
    description: "Lave-linge Bosch Serie 4, 7kg, 3 ans d'utilisation, parfait état. Classe A+++. Départ uniquement.",
    price: 200,
    categorySlug: 'electromenager',
    city: 'Valencia',
    neighborhood: 'Alboraya',
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80',
    ],
  },
  {
    id: 'seed-4',
    title: 'Table à manger extensible + 4 chaises',
    description: 'Table à manger extensible 140-180 cm en bois massif blanc + 4 chaises assorties. Très bon état, achetée chez IKEA il y a 2 ans.',
    price: 280,
    categorySlug: 'meubles',
    city: 'Valencia',
    neighborhood: 'El Cabanyal',
    isPremium: true,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80',
    ],
  },
  {
    id: 'seed-5',
    title: 'iPhone 14 Pro 256 Go — Space Black',
    description: 'iPhone 14 Pro 256 Go coloris Space Black. Acheté en France, débloqué tout opérateur. Parfait état, boîte et câble inclus.',
    price: 750,
    categorySlug: 'electromenager',
    city: 'Madrid',
    neighborhood: 'Malasaña',
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=80',
    ],
  },
  {
    id: 'seed-6',
    title: 'Vélo électrique Orbea Gain F30 — 2022',
    description: 'Vélo électrique Orbea Gain F30, 2022. Batterie 250 Wh, autonomie 80 km, Shimano 105. Quelques égratignures, fonctionne parfaitement.',
    price: 1800,
    categorySlug: 'vehicules',
    city: 'Barcelona',
    neighborhood: 'Gràcia',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    ],
  },
  {
    id: 'seed-7',
    title: 'MacBook Air M1 8 Go / 256 Go',
    description: 'MacBook Air M1 2020, 8 Go RAM, 256 Go SSD, gris sidéral. Batterie 92 %. Vendu avec chargeur et housse.',
    price: 850,
    categorySlug: 'electromenager',
    city: 'Barcelona',
    neighborhood: 'Eixample',
    isPremium: true,
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80',
    ],
  },
  {
    id: 'seed-8',
    title: 'Poussette Maclaren Quest Sport',
    description: "Poussette Maclaren Quest Sport noire, très bon état. Légère (5 kg), compacte. Jusqu'à 25 kg. Vendue avec housse de transport.",
    price: 120,
    categorySlug: 'enfants',
    city: 'Valencia',
    neighborhood: 'Ruzafa',
    images: [
      'https://images.unsplash.com/photo-1565687981296-535f09db714e?w=600&q=80',
    ],
  },
  {
    id: 'seed-9',
    title: 'Réfrigérateur Samsung No Frost 250 L',
    description: 'Réfrigérateur Samsung No Frost 250 L, 3 ans. Classe A++. Fonctionne parfaitement. À venir chercher sur place.',
    price: 300,
    categorySlug: 'electromenager',
    city: 'Alicante',
    neighborhood: 'Centro',
    images: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    ],
  },
  {
    id: 'seed-10',
    title: 'Armoire IKEA PAX 200 × 236 cm',
    description: 'Armoire IKEA PAX blanche 200 × 236 cm avec miroir et tiroirs intérieurs. Montée, très bon état. À démonter soi-même.',
    price: 180,
    categorySlug: 'meubles',
    city: 'Valencia',
    neighborhood: 'Patraix',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    ],
  },
  {
    id: 'seed-11',
    title: 'Raquettes de tennis Wilson x 2 + housse',
    description: 'Lot de 2 raquettes Wilson Blade 100. Cordage récent. Avec housse de transport. Parfait pour les courts de Valencia.',
    price: 80,
    categorySlug: 'sports',
    city: 'Valencia',
    neighborhood: 'Campanar',
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80',
    ],
  },
  {
    id: 'seed-12',
    title: 'Cours de français — professeur natif',
    description: 'Professeur de français natif (diplômé FLE) propose cours particuliers ou en groupe. Tous niveaux. 20 €/h individuel, 12 €/h groupe.',
    price: 20,
    categorySlug: 'services',
    city: 'Valencia',
    neighborhood: 'Benimaclet',
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    ],
  },
  {
    id: 'seed-13',
    title: 'Lit bébé 60 × 120 + matelas + tour de lit',
    description: "Lit bébé blanc 60 × 120 cm avec barrières amovibles. Matelas latex 10 cm + tour de lit étoiles inclus. Bon état, utilisé 18 mois.",
    price: 90,
    categorySlug: 'enfants',
    city: 'Malaga',
    neighborhood: 'Centro Histórico',
    images: [
      'https://images.unsplash.com/photo-1566454419290-57a64afe8c68?w=600&q=80',
    ],
  },
  {
    id: 'seed-14',
    title: 'Scooter Yamaha NMAX 125 — 2021 — 8 000 km',
    description: 'Yamaha NMAX 125, 2021, 8 000 km. Bon état général, entretien à jour. Idéal en ville. Carte grise espagnole.',
    price: 3200,
    categorySlug: 'vehicules',
    city: 'Valencia',
    neighborhood: 'Centro',
    isPremium: true,
    images: [
      'https://images.unsplash.com/photo-1558618047-f31e9c3f96f4?w=600&q=80',
    ],
  },
  {
    id: 'seed-15',
    title: 'Machine Nespresso Vertuo Plus + 50 capsules',
    description: 'Machine Nespresso Vertuo Plus noire, 1 an. Offerte en double. Très bon état. 50 capsules Vertuo incluses.',
    price: 55,
    categorySlug: 'electromenager',
    city: 'Barcelona',
    neighborhood: 'Gràcia',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    ],
  },
  {
    id: 'seed-16',
    title: 'Collection de 40 livres en français',
    description: 'Lot de 40 livres en français : romans, essais, BD. Parfait pour garder le lien avec la langue !',
    price: 30,
    categorySlug: 'livres',
    city: 'Seville',
    neighborhood: 'Triana',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
    ],
  },
  {
    id: 'seed-17',
    title: 'Grande cage perroquet + accessoires',
    description: 'Grande cage pour perroquet (80 × 60 × 150 cm). Inclus : mangeoires, perchoirs, jouets. Cause déménagement.',
    price: 70,
    categorySlug: 'animaux',
    city: 'Valencia',
    neighborhood: 'Benimaclet',
    images: [
      'https://images.unsplash.com/photo-1535338454770-8be927b5a00b?w=600&q=80',
    ],
  },
  {
    id: 'seed-18',
    title: 'Bureau IKEA Micke blanc + caisson 3 tiroirs',
    description: 'Bureau IKEA Micke 105 × 50 cm blanc + caisson 3 tiroirs assorti. Bon état. Idéal pour télétravail.',
    price: 60,
    categorySlug: 'meubles',
    city: 'Madrid',
    neighborhood: 'Lavapiés',
    images: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    ],
  },
  {
    id: 'seed-19',
    title: 'Manteau femme laine camel — taille 38',
    description: 'Manteau en laine couleur camel, taille 38 (M). Marque Zara. Acheté 89 €, porté 2 saisons. Très bon état.',
    price: 25,
    categorySlug: 'vetements',
    city: 'Valencia',
    neighborhood: 'El Carmen',
    images: [
      'https://images.unsplash.com/photo-1548712027-b6b73f130c7f?w=600&q=80',
    ],
  },
  {
    id: 'seed-20',
    title: 'Stand Up Paddle gonflable 10\'6"',
    description: "Stand Up Paddle gonflable 10'6\" × 32\" × 6\". Pompe, pagaie réglable, leash et sac inclus. Parfait pour l'Albufera !",
    price: 220,
    categorySlug: 'sports',
    city: 'Valencia',
    neighborhood: 'La Malvarrosa',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    ],
  },
  {
    id: 'seed-21',
    title: 'Chaussures randonnée Salomon — pointure 42',
    description: 'Salomon X Ultra 4 GTX, taille 42, gris/vert. Utilisées 3 fois. Imperméables GORE-TEX, très confortables.',
    price: 65,
    categorySlug: 'sports',
    city: 'Alicante',
    neighborhood: 'San Juan',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
  },
  {
    id: 'seed-22',
    title: 'Aspirateur sans fil Dyson V11 Animal',
    description: 'Dyson V11 Animal, autonomie 60 min, excellent pour animaux. Tous accessoires inclus. 2 ans, parfait état.',
    price: 280,
    categorySlug: 'electromenager',
    city: 'Valencia',
    neighborhood: 'Russafa',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    ],
  },
  {
    id: 'seed-23',
    title: 'Table basse verre trempé + pieds métal noir',
    description: 'Table basse design, plateau verre trempé + pieds métal noir. 120 × 60 × 40 cm. Très bon état, aucune rayure.',
    price: 85,
    categorySlug: 'meubles',
    city: 'Valencia',
    neighborhood: 'Eixample',
    images: [
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80',
    ],
  },
]

async function main() {
  // Clear all listings (cascades to ListingImage, Favorite, Message)
  await prisma.listing.deleteMany()

  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@vendo.es' },
    update: {},
    create: { name: 'Marie Dupont', email: 'demo@vendo.es', passwordHash },
  })

  for (const { images, isPremium, ...data } of LISTINGS) {
    await prisma.listing.create({
      data: {
        ...data,
        isPremium: isPremium ?? false,
        userId: user.id,
        images: {
          create: images.map((url, order) => ({ url, order })),
        },
      },
    })
  }

  console.log(`✅ Seed terminé — ${LISTINGS.length} annonces créées (demo@vendo.es / demo1234)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
