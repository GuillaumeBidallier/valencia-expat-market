import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const pro = await prisma.professional.findUnique({
      select: { id: true, website: true, whatsapp: true, slug: true },
      where: { id },
    })
    if (!pro) return NextResponse.json({ ok: false }, { status: 404 })

    const destination = pro.website
      ?? (pro.whatsapp ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}` : `/professionnels/${pro.slug}`)

    return NextResponse.json({ ok: true, destination })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
