import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [
      users,
      professionals,
      listings,
      categories,
      messages,
      reports,
      settings,
      blogPosts,
    ] = await Promise.all([
      // Exclude passwordHash for security
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          blocked: true,
          createdAt: true,
          showPhone: true,
          showWhatsapp: true,
        },
      }),
      prisma.professional.findMany(),
      prisma.listing.findMany(),
      prisma.category.findMany(),
      prisma.message.findMany(),
      prisma.report.findMany(),
      prisma.siteSettings.findFirst(),
      prisma.blogPost.findMany(),
    ])

    const payload = {
      exportedAt: new Date().toISOString(),
      tables: {
        users,
        professionals,
        listings,
        categories,
        messages,
        reports,
        settings,
        blogPosts,
      },
    }

    const date = new Date().toISOString().split('T')[0]
    const filename = `backup-1000click-${date}.json`

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    )
  }
}
