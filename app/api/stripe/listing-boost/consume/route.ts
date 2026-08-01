import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { LISTING_BOOST_DAYS } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ ok: false }, { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing || listing.userId !== session.user.id) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const boost = await prisma.listingBoost.findFirst({
    where: { userId: session.user.id, paid: true, used: false },
    orderBy: { createdAt: 'desc' },
  })
  if (!boost) return NextResponse.json({ ok: false })

  const boostExpiresAt = new Date(Date.now() + LISTING_BOOST_DAYS * 24 * 60 * 60 * 1000)

  await prisma.$transaction([
    prisma.listingBoost.update({ where: { id: boost.id }, data: { used: true } }),
    prisma.listing.update({ where: { id: listingId }, data: { isPremium: true, boostExpiresAt } }),
  ])

  return NextResponse.json({ ok: true })
}
