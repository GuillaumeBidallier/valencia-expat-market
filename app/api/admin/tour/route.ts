import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Marks the admin onboarding tour as seen (finished or skipped), so it no
// longer starts on its own. It can still be replayed from the sidebar.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { adminTourCompletedAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
