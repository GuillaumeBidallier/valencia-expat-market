import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { pusherServer } from '@/lib/pusher'

type Params = Promise<{ conversationId: string }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { conversationId } = await params
  const { isTyping } = await req.json()

  await pusherServer?.trigger(`conv-${conversationId}`, 'typing', {
    isTyping: Boolean(isTyping),
    userId: session.user.id,
    name: session.user.name ?? 'Quelqu\'un',
  })

  return NextResponse.json({ ok: true })
}
