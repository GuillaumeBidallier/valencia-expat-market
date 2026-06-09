import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const raw = process.env.DATABASE_URL!
  // Strip pgbouncer param — not needed with @neondatabase/serverless HTTP driver
  const url = new URL(raw)
  url.searchParams.delete('pgbouncer')
  const connectionString = url.toString()
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
