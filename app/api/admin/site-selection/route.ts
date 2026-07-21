import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ siteId: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const site = await prisma.site.findUnique({ where: { id: parsed.data.siteId } })
  if (!site) return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('vem_admin_site', site.id, {
    path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax',
  })
  return response
}
