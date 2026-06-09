import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const raw = process.env.DATABASE_URL ?? ''
  let host = '', database = '', params = ''
  try {
    const u = new URL(raw)
    host = u.hostname
    database = u.pathname.replace(/^\//, '') || '(empty!)'
    params = u.search
  } catch {
    host = 'parse error'
  }

  try {
    const count = await prisma.listing.count()
    return NextResponse.json({ ok: true, count, host, database })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e), host, database, params },
      { status: 500 },
    )
  }
}
