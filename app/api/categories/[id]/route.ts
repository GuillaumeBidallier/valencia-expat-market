import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null
  return session
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: { select: { locale: true, label: true } } },
  })
  if (!category) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(
    Object.fromEntries(category.translations.map(t => [t.locale, t.label]))
  )
}
