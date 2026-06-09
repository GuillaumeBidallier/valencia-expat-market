import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { pusherServer } from '@/lib/pusher'

type Params = Promise<{ conversationId: string }>

function parse(conversationId: string) {
  const idx = conversationId.indexOf('_')
  if (idx === -1) return null
  return { listingId: conversationId.slice(0, idx), buyerId: conversationId.slice(idx + 1) }
}

export async function POST(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { conversationId } = await params
  const parsed = parse(conversationId)
  if (!parsed) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const { listingId } = parsed
  const userId = session.user.id
  const readAt = new Date()

  const updated = await prisma.message.updateMany({
    where: { listingId, receiverId: userId, readAt: null },
    data: { readAt },
  })

  if (updated.count > 0) {
    await pusherServer?.trigger(`conv-${conversationId}`, 'messages-read', {
      readAt: readAt.toISOString(),
    })
  }

  return NextResponse.json({ ok: true })
}
