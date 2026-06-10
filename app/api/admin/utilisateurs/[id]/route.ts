import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const adminId = (session?.user as { id?: string; role?: string })
  if (adminId?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  // Prevent admin from demoting or blocking themselves
  if (id === adminId.id && (body.role === 'USER' || body.blocked === true)) {
    return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre accès admin.' }, { status: 400 })
  }

  const data: { blocked?: boolean; role?: Role } = {}
  if (typeof body.blocked === 'boolean') data.blocked = body.blocked
  if (['USER', 'PREMIUM', 'ADMIN'].includes(body.role)) data.role = body.role as Role

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, blocked: true },
  })

  return NextResponse.json(user)
}
