import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ slug: string }>

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const pro = await prisma.professional.findUnique({ where: { slug } })
  if (!pro) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(pro)
}
