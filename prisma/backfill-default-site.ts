import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })
  console.log(`Site par défaut : ${site.domain} (${site.id})`)

  const [categories, listings, professionals, users] = await Promise.all([
    prisma.category.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.listing.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.professional.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
    prisma.user.updateMany({ where: { siteId: null }, data: { siteId: site.id } }),
  ])

  console.log(`Rattachés au site par défaut : ${categories.count} catégories, ${listings.count} annonces, ${professionals.count} professionnels, ${users.count} utilisateurs`)

  const remaining = await Promise.all([
    prisma.category.count({ where: { siteId: null } }),
    prisma.listing.count({ where: { siteId: null } }),
    prisma.professional.count({ where: { siteId: null } }),
    prisma.user.count({ where: { siteId: null } }),
  ])
  if (remaining.some(n => n > 0)) {
    throw new Error(`Backfill incomplet — lignes encore sans siteId : ${JSON.stringify(remaining)}`)
  }
  console.log('✅ Backfill terminé, aucune ligne orpheline.')
}

main().catch((err) => { console.error(err); process.exit(1) }).finally(() => prisma.$disconnect())
