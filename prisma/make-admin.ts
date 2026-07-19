import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@vendo.es' },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'Admin', email: 'admin@vendo.es', passwordHash, role: 'ADMIN' },
  })
  console.log(`✅ Admin créé : ${user.email} / Admin1234!`)
}

main().finally(() => prisma.$disconnect())
