import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminProsClient from './AdminProsClient'

export default async function AdminProsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  const pros = await prisma.professional.findMany({
    orderBy: [{ tier: 'desc' }, { name: 'asc' }],
  })

  return <AdminProsClient initialPros={pros} />
}
