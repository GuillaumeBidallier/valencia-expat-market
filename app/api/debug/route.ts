import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const urlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@').substring(0, 80)
    : 'NOT SET'

  try {
    const count = await prisma.listing.count()
    return NextResponse.json({ ok: true, count, url: urlPreview })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e), url: urlPreview },
      { status: 500 },
    )
  }
}
