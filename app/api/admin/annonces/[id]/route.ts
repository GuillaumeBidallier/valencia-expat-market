import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendListingApprovedEmail, sendListingRejectedEmail } from '@/lib/email'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!['ACTIVE', 'REJECTED', 'PENDING', 'SOLD', 'DELETED'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: { status, ...(status === 'ACTIVE' ? { publishedAt: new Date() } : {}) },
    include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
  })

  if (listing.user?.email) {
    const { name, email } = listing.user
    if (status === 'ACTIVE') {
      sendListingApprovedEmail({
        to: email,
        name,
        listingTitle: listing.title,
        listingUrl: `${BASE}/annonces/${listing.id}`,
      }).catch(() => {})
    } else if (status === 'REJECTED') {
      sendListingRejectedEmail({
        to: email,
        name,
        listingTitle: listing.title,
      }).catch(() => {})
    }
  }

  return NextResponse.json(listing)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.listing.update({ where: { id }, data: { status: 'DELETED' } })
  return NextResponse.json({ ok: true })
}
