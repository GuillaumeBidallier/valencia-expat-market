import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@vendo.es' },
    update: {},
    create: { name: 'Marie Dupont', email: 'demo@vendo.es', passwordHash },
  })

  await prisma.listing.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-1',
        title: 'Canapé 3 places IKEA Kivik',
        description: 'Canapé 3 places IKEA Kivik en très bon état. Housse lavable gris clair. Vendu car déménagement.',
        price: 150,
        categorySlug: 'meubles',
        city: 'Valencia',
        neighborhood: 'Ruzafa',
        userId: user.id,
      },
      {
        id: 'seed-2',
        title: 'Vélo enfant 4-6 ans',
        description: 'Vélo rouge pour enfant 4-6 ans avec stabilisateurs. Casque inclus.',
        price: 40,
        categorySlug: 'enfants',
        city: 'Valencia',
        neighborhood: 'Benimaclet',
        userId: user.id,
      },
      {
        id: 'seed-3',
        title: 'Lave-linge Bosch 7kg',
        description: 'Lave-linge Bosch Serie 4 7kg, 3 ans, parfait état. Départ uniquement.',
        price: 200,
        categorySlug: 'electromenager',
        city: 'Valencia',
        neighborhood: 'Alboraya',
        userId: user.id,
      },
    ],
  })

  console.log('✅ Seed terminé — demo@vendo.es / demo1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
