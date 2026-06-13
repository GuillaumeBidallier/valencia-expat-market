import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'No professional profile' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null // 'logo' | 'banner' | 'photo'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Type non autorisé' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop lourd (max 5 Mo)' }, { status: 400 })

  const blob = await put(`pros/${pro.id}/${type ?? 'photo'}-${Date.now()}-${file.name}`, file, { access: 'public' })

  if (type === 'logo') {
    await prisma.professional.update({ where: { id: pro.id }, data: { logo: blob.url } })
  } else if (type === 'banner') {
    await prisma.professional.update({ where: { id: pro.id }, data: { banner: blob.url } })
  } else {
    await prisma.professional.update({ where: { id: pro.id }, data: { photos: { push: blob.url } } })
  }

  return NextResponse.json({ url: blob.url })
}
