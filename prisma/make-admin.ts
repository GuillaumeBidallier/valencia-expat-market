import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  const user = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email: 'admin@vendo.es' } },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'Admin', email: 'admin@vendo.es', passwordHash, role: 'ADMIN', siteId: site.id },
  })
  console.log(`✅ Admin créé : ${user.email} / Admin1234!`)
}

main().finally(() => prisma.$disconnect())
