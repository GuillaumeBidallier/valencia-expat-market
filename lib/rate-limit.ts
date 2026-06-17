import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Returns true if the request should be allowed, false if rate-limited. Logs the hit either way. */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs)
  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: since } } })
  if (count >= limit) return false

  await prisma.rateLimitHit.create({ data: { key } })
  // Best-effort cleanup of old rows for this key, non-blocking
  prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: since } } }).catch(() => {})
  return true
}
