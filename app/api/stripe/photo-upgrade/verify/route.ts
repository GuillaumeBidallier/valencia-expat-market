import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const { stripeSessionId } = await req.json()
  if (!stripeSessionId) return NextResponse.json({ ok: false }, { status: 400 })

  const record = await prisma.photoUpgrade.findUnique({
    where: { stripeSessionId },
  })

  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  if (record.paid) {
    return NextResponse.json({ ok: true })
  }

  const checkout = await getStripe().checkout.sessions.retrieve(stripeSessionId)
  if (checkout.payment_status !== 'paid') {
    return NextResponse.json({ ok: false })
  }

  await prisma.photoUpgrade.update({
    where: { stripeSessionId },
    data: { paid: true },
  })

  return NextResponse.json({ ok: true })
}
