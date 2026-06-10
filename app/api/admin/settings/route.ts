import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', autoPublish: true },
    update: {},
  })
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { autoPublish } = await req.json()
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', autoPublish },
    update: { autoPublish },
  })
  return NextResponse.json(settings)
}
