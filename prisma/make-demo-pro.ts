import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = 'demo.pro@1000click.es'
  const password = 'DemoPro2026!'

  const passwordHash = await bcrypt.hash(password, 12)

  // 1. User
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'PREMIUM' },
    create: { name: 'Sophie Martin', email, passwordHash, role: 'PREMIUM' },
  })

  // 2. Professional profile (PREMIUM_PLUS, recommended)
  const pro = await prisma.professional.upsert({
    where: { slug: 'sophie-martin-architecte' },
    update: {},
    create: {
      slug: 'sophie-martin-architecte',
      name: 'Sophie Martin Architecte',
      category: 'Architecture & Design',
      city: 'Valencia',
      description:
        'Architecte DPLG avec 12 ans d\'expérience, je vous accompagne dans vos projets de rénovation, construction et décoration intérieure à Valencia et dans toute la Communauté Valencienne. ' +
        'Spécialisée dans la transformation de logements anciens en espaces modernes et lumineux, je propose une approche sur-mesure alliant exigence esthétique et respect des budgets.',
      phone: '+34 612 345 678',
      whatsapp: '+34612345678',
      website: 'https://sophiemartinarchi.es',
      logo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&q=80&fit=crop',
      banner: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80',
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      ],
      tier: 'PREMIUM_PLUS',
      verified: true,
      featured: true,
      recommended: true,
      zones: ['Valencia', 'Valence', 'Barcelone', 'Alicante'],
      userId: user.id,
      subscriptionStatus: 'active',
      subscriptionPeriod: 'annual',
      subscriptionCurrentPeriodEnd: new Date('2027-06-27'),
    },
  })

  // 3. Listings (annonces) — 3 annonces postées par cet utilisateur
  const listings = [
    {
      title: 'Canapé d\'angle en lin beige — excellent état',
      description:
        'Magnifique canapé d\'angle en tissu lin beige acheté chez Zara Home. Utilisé 1 an dans un appartement sans animaux ni enfants. Très bon état général, quelques micro-usures invisibles. ' +
        'Dimensions : 270 x 180 cm. Couleur : beige naturel. Vendu car déménagement. À emporter uniquement.',
      price: 450,
      categorySlug: 'meubles',
      city: 'Valencia',
      neighborhood: 'Ruzafa',
      status: 'ACTIVE' as const,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    },
    {
      title: 'Table basse design scandinave en chêne massif',
      description:
        'Table basse style scandinave en chêne massif huilé. Pieds en métal noir mat. Achetée 680 € chez un artisan valencien. 2 ans d\'utilisation, toujours impeccable. ' +
        'Dimensions : 120 x 60 x 42 cm. Idéale avec un canapé bas. Quelques traces d\'usage sur le plateau, rien de visible avec un verre dessus.',
      price: 280,
      categorySlug: 'meubles',
      city: 'Valencia',
      neighborhood: 'El Carmen',
      status: 'ACTIVE' as const,
      images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80'],
    },
    {
      title: 'Vélo électrique Xiaomi Pro 2 — 600 km au compteur',
      description:
        'Vélo électrique pliable Xiaomi Mi Electric Scooter Pro 2. Autonomie réelle 40 km, vitesse max 25 km/h. Acheté en janvier 2024, 600 km parcourus seulement. ' +
        'Vendu avec chargeur d\'origine et antivol. Parfait pour les trajets domicile-travail à Valencia. Batterie 100% santé selon l\'appli Xiaomi Home.',
      price: 380,
      categorySlug: 'vehicules',
      city: 'Valencia',
      neighborhood: 'Benimaclet',
      status: 'ACTIVE' as const,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    },
  ]

  for (const listing of listings) {
    const existing = await prisma.listing.findFirst({
      where: { userId: user.id, title: listing.title },
    })
    if (!existing) {
      const { images, ...rest } = listing
      const created = await prisma.listing.create({
        data: {
          ...rest,
          userId: user.id,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 80) + 10,
        },
      })
      await prisma.listingImage.create({
        data: { listingId: created.id, url: images[0], order: 0 },
      })
    }
  }

  // 4. Some simulated ProClick stats
  const clickTypes = ['profile_view', 'phone', 'whatsapp', 'website']
  const existingClicks = await prisma.proClick.count({ where: { professionalId: pro.id } })
  if (existingClicks === 0) {
    const clicks = []
    for (let i = 0; i < 60; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      clicks.push({
        professionalId: pro.id,
        type: clickTypes[Math.floor(Math.random() * clickTypes.length)],
        createdAt: date,
      })
    }
    await prisma.proClick.createMany({ data: clicks })
  }

  console.log('\n✅ Compte professionnel de démonstration créé !')
  console.log('─────────────────────────────────────────────')
  console.log(`  Email    : ${email}`)
  console.log(`  Mot de passe : ${password}`)
  console.log(`  Profil pro   : /professionnels/sophie-martin-architecte`)
  console.log(`  Dashboard    : /mon-compte/profil-pro`)
  console.log('─────────────────────────────────────────────\n')
}

main().finally(() => prisma.$disconnect())
