import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

const CATEGORIES = [
  { slug: 'meubles', label: 'Maison & Mobilier', icon: '🛋️', order: 0 },
  { slug: 'electromenager', label: 'Électroménager', icon: '🏠', order: 1 },
  { slug: 'enfants', label: 'Enfants & Famille', icon: '👶', order: 2 },
  { slug: 'vehicules', label: 'Véhicules', icon: '🚗', order: 3 },
  { slug: 'mode', label: 'Mode & Vêtements', icon: '👗', order: 4 },
  { slug: 'services', label: 'Services', icon: '🔧', order: 5 },
  { slug: 'dons', label: 'Dons', icon: '🎁', order: 6 },
  { slug: 'livres', label: 'Livres & Loisirs', icon: '📚', order: 7 },
  { slug: 'deco', label: 'Déco & Jardin', icon: '🌿', order: 8 },
  { slug: 'autres', label: 'Autres', icon: '📦', order: 9 },
  { slug: 'animaux', label: 'Animaux', icon: '🐾', order: 10 },
]

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { label: c.label, icon: c.icon, order: c.order },
    })
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`)
}

main().finally(() => prisma.$disconnect())
