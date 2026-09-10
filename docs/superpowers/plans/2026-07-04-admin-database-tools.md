# Admin Database Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two admin buttons — reset all professional accounts and export the full database as JSON.

**Architecture:** Two new API routes under `/app/api/admin/database/`, one UI section added to `SettingsClient.tsx`. ProClick + BusinessCard cascade automatically when Professional is deleted.

**Tech Stack:** Next.js 15 App Router, Prisma (Neon/PostgreSQL), NextAuth, TypeScript, Tailwind, Lucide.

## Global Constraints
- Auth check: `(session?.user as { role?: string })?.role !== 'ADMIN'` → 403
- Import prisma from `@/lib/prisma`
- Import auth from `@/auth`
- Tailwind only — no external UI libs
- No passwordHash in export

---

### Task 1: API — Reset Professionals

**Files:**
- Create: `app/api/admin/database/reset-professionals/route.ts`

- [ ] Create the route:
```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const result = await prisma.professional.deleteMany({})
    return NextResponse.json({ success: true, deleted: result.count })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la réinitialisation' }, { status: 500 })
  }
}
```

---

### Task 2: API — Export Database

**Files:**
- Create: `app/api/admin/database/export/route.ts`

- [ ] Create the route (excludes passwordHash, includes all key tables):
```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const [users, professionals, listings, categories, messages, reports, settings, blogPosts] =
      await Promise.all([
        prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, blocked: true, createdAt: true } }),
        prisma.professional.findMany(),
        prisma.listing.findMany(),
        prisma.category.findMany(),
        prisma.message.findMany(),
        prisma.report.findMany(),
        prisma.siteSettings.findFirst(),
        prisma.blogPost.findMany(),
      ])
    const payload = { exportedAt: new Date().toISOString(), tables: { users, professionals, listings, categories, messages, reports, settings, blogPosts } }
    const date = new Date().toISOString().split('T')[0]
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-1000click-${date}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
```

---

### Task 3: UI — Database section in SettingsClient

**Files:**
- Modify: `app/admin/parametres/SettingsClient.tsx`

- [ ] Add `Database`, `RotateCcw`, `Download` to lucide imports
- [ ] Add state: `resetting`, `resetStep`, `resetCount`, `resetError`, `exporting`
- [ ] Add handler functions `handleExport` and `handleReset`
- [ ] Add section before the save button

---

### Task 4: Commit & Push

- [ ] `git add` the 3 files
- [ ] `git commit` with meaningful message
- [ ] `git push origin main`
