import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(2).max(100),
  slug:        z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  category:    z.string().min(1),
  city:        z.string().min(1),
  description: z.string().max(1000).optional().nullable(),
  phone:       z.string().optional().nullable(),
  whatsapp:    z.string().optional().nullable(),
  website:     z.string().url().optional().nullable().or(z.literal('')),
  logo:        z.string().url().optional().nullable().or(z.literal('')),
  photos:      z.array(z.string().url()).optional().default([]),
  tier:        z.enum(['FREE', 'PREMIUM', 'PREMIUM_PLUS']).default('FREE'),
  verified:    z.boolean().optional().default(false),
  featured:    z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const pro = await prisma.professional.create({ data: parsed.data })
  return NextResponse.json(pro, { status: 201 })
}
