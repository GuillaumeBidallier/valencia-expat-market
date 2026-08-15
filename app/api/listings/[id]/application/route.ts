import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const DOC_TYPES = ['id_document', 'income_proof', 'tax_notice', 'address_proof', 'rib', 'guarantor_document'] as const
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 8 * 1024 * 1024

type Params = Promise<{ id: string }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.status === 'DELETED') return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (listing.userId === session.user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const allowed = await checkRateLimit(`rental-app:${getClientIp(req)}`, 5, 30 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })

  const formData = await req.formData()
  const type = formData.get('type')
  const fullName = formData.get('fullName')
  const email = formData.get('email')
  const phone = formData.get('phone')

  if (type !== 'LOCATION' && type !== 'ACHAT') {
    return NextResponse.json({ error: 'Type de dossier invalide' }, { status: 400 })
  }
  if (typeof fullName !== 'string' || !fullName.trim() || typeof email !== 'string' || !email.trim() || typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const str = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() ? v.trim() : null
  }
  const bool = (key: string) => formData.get(key) === 'true'

  const application = await prisma.rentalApplication.create({
    data: {
      siteId: listing.siteId,
      listingId: id,
      userId: session.user.id,
      type,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      situation: str('situation'),
      income: str('income'),
      hasGuarantor: bool('hasGuarantor'),
      guarantorInfo: str('guarantorInfo'),
      hasPets: bool('hasPets'),
      petsDetails: str('petsDetails'),
      desiredDuration: str('desiredDuration'),
      message: str('message'),
    },
  })

  for (const docType of DOC_TYPES) {
    const file = formData.get(`doc_${docType}`)
    if (!(file instanceof File) || file.size === 0) continue
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Type de fichier non autorisé : ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 8 Mo)' }, { status: 400 })
    }
    const blob = await put(`rental-applications/${application.id}/${docType}-${Date.now()}-${file.name}`, file, { access: 'public' })
    await prisma.rentalApplicationDocument.create({
      data: { applicationId: application.id, type: docType, url: blob.url },
    })
  }

  return NextResponse.json({ ok: true, id: application.id }, { status: 201 })
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const listing = await prisma.listing.findUnique({ where: { id }, select: { userId: true } })
  if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const isOwner = listing.userId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const applications = await prisma.rentalApplication.findMany({
    where: { listingId: id },
    include: { documents: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(applications)
}
