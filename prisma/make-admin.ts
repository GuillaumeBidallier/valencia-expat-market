import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

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
