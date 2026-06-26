# Pro Click Statistics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track clicks on pro ad units and pro profile contact buttons, expose aggregated stats in the Premium+ dashboard, and remove all "(bientôt)" labels.

**Architecture:** Add a `ProClick` DB table, persist events from both the ad-unit click API and a new client-side tracking call on the pro profile page. A single authenticated `/api/pro/stats` route returns 30-day totals and daily breakdown. A new `ProStatsClient.tsx` widget renders KPIs + CSS bar chart inside the existing pro dashboard.

**Tech Stack:** Prisma (PostgreSQL), Next.js 16 App Router, TypeScript, Tailwind CSS (no chart library — CSS-only bars).

## Global Constraints

- No new npm dependencies
- All CSS animations via inline `style` or Tailwind; no Framer Motion
- Zod v4 for any input validation (`z.string()`, `z.enum()`, etc.)
- Authentication via `auth()` from `@/auth`
- Stats only visible to `PREMIUM_PLUS` tier
- Fire-and-forget tracking calls: never block navigation, always `.catch(() => {})`
- No test framework in project — skip test steps

---

### Task 1: Prisma Schema — add ProClick model

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `ProClick` Prisma model with fields `id`, `professionalId`, `type`, `createdAt`; `clicks` relation on `Professional`

- [ ] **Step 1: Add model to schema**

In `prisma/schema.prisma`, add after the `ProTier` enum:

```prisma
model ProClick {
  id             String       @id @default(cuid())
  professionalId String
  professional   Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  type           String       // 'ad_click' | 'phone' | 'whatsapp' | 'website' | 'profile_view'
  createdAt      DateTime     @default(now())

  @@index([professionalId, createdAt])
}
```

Also add to `Professional` model (after `updatedAt`):

```prisma
  clicks      ProClick[]
```

- [ ] **Step 2: Run migration**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
npx prisma migrate dev --name add_pro_click
```

Expected: migration created and applied, Prisma client regenerated.

- [ ] **Step 3: Verify client regenerated**

```bash
grep -n "ProClick" node_modules/.prisma/client/index.d.ts | head -5
```

Expected: lines containing `ProClick`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add ProClick model for click tracking"
```

---

### Task 2: Persist ad clicks in `/api/ads/click`

**Files:**
- Modify: `app/api/ads/click/route.ts`

**Interfaces:**
- Consumes: `prisma.proClick.create()` from Task 1
- Produces: same JSON response shape as before; click now also persisted to DB

- [ ] **Step 1: Update the route to persist the click**

Replace the full content of `app/api/ads/click/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const pro = await prisma.professional.findUnique({
      select: { id: true, website: true, whatsapp: true, slug: true },
      where: { id },
    })
    if (!pro) return NextResponse.json({ ok: false }, { status: 404 })

    // Persist click — fire and don't block the response
    prisma.proClick.create({
      data: { professionalId: pro.id, type: 'ad_click' },
    }).catch(() => {})

    const destination = pro.website
      ?? (pro.whatsapp ? `https://wa.me/${pro.whatsapp.replace(/\D/g, '')}` : `/professionnels/${pro.slug}`)

    return NextResponse.json({ ok: true, destination })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/ads/click/route.ts
git commit -m "feat: persist ad clicks to ProClick table"
```

---

### Task 3: Create `/api/pro/stats` route

**Files:**
- Create: `app/api/pro/stats/route.ts`

**Interfaces:**
- Consumes: `auth()` from `@/auth`, `prisma.proClick` from Task 1
- Produces: `GET /api/pro/stats` → `{ totals: Record<string, number>, daily: { date: string, count: number }[], period: '30d' }`

- [ ] **Step 1: Create the route**

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true, tier: true },
  })

  if (!pro) return NextResponse.json({ error: 'No professional profile' }, { status: 404 })
  if (pro.tier !== 'PREMIUM_PLUS') return NextResponse.json({ error: 'Premium+ required' }, { status: 403 })

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const clicks = await prisma.proClick.findMany({
    where: { professionalId: pro.id, createdAt: { gte: since } },
    select: { type: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Totals per type
  const totals: Record<string, number> = {}
  for (const c of clicks) {
    totals[c.type] = (totals[c.type] ?? 0) + 1
  }

  // Daily aggregation (last 30 days)
  const dailyMap: Record<string, number> = {}
  // Pre-fill all 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const c of clicks) {
    const day = c.createdAt.toISOString().slice(0, 10)
    if (day in dailyMap) dailyMap[day] = (dailyMap[day] ?? 0) + 1
  }

  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  return NextResponse.json({ totals, daily, period: '30d' })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/pro/stats/route.ts
git commit -m "feat: add GET /api/pro/stats endpoint for Premium+ click analytics"
```

---

### Task 4: Create `ContactCardClient.tsx` for the pro profile page

**Files:**
- Create: `app/professionnels/[slug]/ContactCardClient.tsx`

**Interfaces:**
- Consumes: pro fields: `id`, `name`, `phone`, `phoneHidden`, `whatsapp`, `website`, `verified`, `slug`; booleans `isPremium`; strings `waLink`, `accentFrom`, `accentTo`; `strings` object with 4 labels
- Produces: `<ContactCardClient>` replaces server-only `ContactCard` in `page.tsx`; fires `POST /api/pro/track` on mount (profile_view) and on each CTA click

**Note:** The tracking endpoint used here is `/api/pro/track` (created in Task 5).

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useEffect } from 'react'
import { CheckCircle, Phone, Globe, ExternalLink } from 'lucide-react'

type ContactCardClientProps = {
  proId: string
  name: string
  phone: string | null
  phoneHidden: boolean
  whatsapp: string | null
  website: string | null
  verified: boolean
  isPremium: boolean
  waLink: string | null
  accentFrom: string
  accentTo: string
  strings: {
    contact_label: string
    verified_badge: string
    visit_website: string
    mention_vendo: string
  }
}

function track(proId: string, type: string) {
  fetch('/api/pro/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proId, type }),
  }).catch(() => {})
}

export default function ContactCardClient({
  proId, name, phone, phoneHidden, whatsapp, website, verified,
  isPremium, waLink, accentFrom, accentTo, strings,
}: ContactCardClientProps) {

  useEffect(() => {
    track(proId, 'profile_view')
  }, [proId])

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200/60">
      {/* Card header */}
      <div
        className="px-5 py-5 text-white"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
      >
        <p className="text-white/60 text-xs font-medium mb-1">{strings.contact_label}</p>
        <p className="font-black text-lg leading-snug">{name}</p>
        {verified && (
          <p className="text-white/70 text-xs flex items-center gap-1 mt-2">
            <CheckCircle size={11} /> {strings.verified_badge}
          </p>
        )}
      </div>

      {/* CTAs */}
      <div className="bg-white p-4 flex flex-col gap-2.5">
        {phone && !phoneHidden && (
          <a
            href={`tel:${phone}`}
            onClick={() => track(proId, 'phone')}
            className="flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-navy/90 transition-colors"
          >
            <Phone size={15} aria-hidden="true" /> {phone}
          </a>
        )}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(proId, 'whatsapp')}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        )}
        {isPremium && website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(proId, 'website')}
            className="flex items-center justify-center gap-2 border-2 border-gray-100 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-colors"
          >
            <Globe size={14} aria-hidden="true" /> {strings.visit_website}
            <ExternalLink size={12} className="ml-auto opacity-40" aria-hidden="true" />
          </a>
        )}
        <p className="text-[11px] text-gray-400 text-center pt-1">
          {strings.mention_vendo}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/professionnels/[slug]/ContactCardClient.tsx
git commit -m "feat: add ContactCardClient with phone/WA/website/profile_view tracking"
```

---

### Task 5: Create `/api/pro/track` endpoint

**Files:**
- Create: `app/api/pro/track/route.ts`

**Interfaces:**
- Consumes: `{ proId: string, type: 'phone' | 'whatsapp' | 'website' | 'profile_view' }` in request body
- Produces: `{ ok: true }` — no auth required (public tracking)

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_TYPES = ['phone', 'whatsapp', 'website', 'profile_view'] as const

export async function POST(req: NextRequest) {
  try {
    const { proId, type } = await req.json() as { proId?: string; type?: string }
    if (!proId || !type || !(ALLOWED_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Verify pro exists — fire and forget, never block the response
    prisma.professional.findUnique({ where: { id: proId }, select: { id: true } })
      .then(pro => {
        if (pro) {
          return prisma.proClick.create({ data: { professionalId: proId, type } })
        }
      })
      .catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/pro/track/route.ts
git commit -m "feat: add POST /api/pro/track for profile contact click tracking"
```

---

### Task 6: Update pro detail page to use ContactCardClient

**Files:**
- Modify: `app/professionnels/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ContactCardClient` from Task 4 (same props shape as old `ContactCard`)
- Produces: pro detail page uses client contact card with tracking

- [ ] **Step 1: Replace ContactCard with ContactCardClient**

At top of file add import:
```ts
import ContactCardClient from './ContactCardClient'
```

Remove the old inline `ContactCard` function (the server component at the bottom of the file, from `/* ════════════════════════════════════════` down to the closing `}`).

Replace both `<ContactCard ...>` usages:
```tsx
// Mobile contact
<div className="lg:hidden pb-10">
  <ContactCardClient
    proId={pro.id}
    name={pro.name}
    phone={pro.phone}
    phoneHidden={pro.phoneHidden}
    whatsapp={pro.whatsapp}
    website={pro.website}
    verified={pro.verified}
    isPremium={isPremium}
    waLink={waLink}
    accentFrom={accentFrom}
    accentTo={accentTo}
    strings={ccStrings}
  />
</div>

// Desktop aside
<aside className="hidden lg:block self-start sticky top-24 pb-10">
  <ContactCardClient
    proId={pro.id}
    name={pro.name}
    phone={pro.phone}
    phoneHidden={pro.phoneHidden}
    whatsapp={pro.whatsapp}
    website={pro.website}
    verified={pro.verified}
    isPremium={isPremium}
    waLink={waLink}
    accentFrom={accentFrom}
    accentTo={accentTo}
    strings={ccStrings}
  />
</aside>
```

Also remove the `ContactCardProps` and `ContactCardStrings` type definitions (no longer needed in this file) and `ccStrings` object can remain since it feeds `ContactCardClient`.

- [ ] **Step 2: Commit**

```bash
git add app/professionnels/[slug]/page.tsx
git commit -m "feat: use ContactCardClient on pro detail page for click tracking"
```

---

### Task 7: Create `ProStatsClient.tsx` widget

**Files:**
- Create: `app/mon-compte/profil-pro/ProStatsClient.tsx`

**Interfaces:**
- Consumes: `GET /api/pro/stats` from Task 3
- Produces: `<ProStatsClient />` — React component showing KPIs + CSS bar chart

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { BarChart2, MousePointerClick, Phone, Globe, Eye } from 'lucide-react'

type Stats = {
  totals: Record<string, number>
  daily: { date: string; count: number }[]
  period: '30d'
}

export default function ProStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pro/stats')
      .then(r => r.json())
      .then((data: Stats) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const t = stats?.totals ?? {}
  const total = Object.values(t).reduce((a, b) => a + b, 0)

  const kpis = [
    { label: 'Vues du profil',   icon: <Eye size={16} />,               key: 'profile_view', color: 'text-indigo-primary bg-indigo-soft' },
    { label: 'Clics publicitaires', icon: <MousePointerClick size={16} />, key: 'ad_click',    color: 'text-orange-primary bg-orange-soft' },
    { label: 'Appels téléphone', icon: <Phone size={16} />,             key: 'phone',        color: 'text-navy bg-gray-100'              },
    { label: 'Clics WhatsApp',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, key: 'whatsapp', color: 'text-green-700 bg-green-50' },
    { label: 'Visites site web', icon: <Globe size={16} />,              key: 'website',      color: 'text-blue-600 bg-blue-50'           },
  ]

  const maxDay = Math.max(...(stats?.daily.map(d => d.count) ?? [1]), 1)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <section className="bg-white rounded-2xl border border-indigo-primary/20 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
          <BarChart2 size={18} className="text-indigo-primary" />
        </div>
        <div>
          <p className="font-black text-navy text-sm">Statistiques de clics</p>
          <p className="text-xs text-gray-400">30 derniers jours</p>
        </div>
        <span className="ml-auto text-xs font-bold bg-indigo-soft text-indigo-primary px-2.5 py-1 rounded-full">Premium+</span>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-primary border-t-transparent animate-spin" />
        </div>
      ) : !stats ? (
        <p className="text-sm text-gray-400 text-center py-8">Impossible de charger les stats.</p>
      ) : (
        <>
          {/* Total */}
          <p className="text-3xl font-black text-navy mb-1">{total}</p>
          <p className="text-xs text-gray-400 mb-5">interactions totales · 30 jours</p>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {kpis.map(kpi => (
              <div key={kpi.key} className="flex items-center gap-2.5 bg-[#f7f8fa] rounded-xl p-3 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-navy text-base leading-none">{t[kpi.key] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily bar chart — CSS only */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Activité quotidienne</p>
            <div className="flex items-end gap-0.5 h-20">
              {stats.daily.map(day => {
                const pct = Math.round((day.count / maxDay) * 100)
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-0.5 group relative"
                    title={`${formatDate(day.date)}: ${day.count}`}
                  >
                    <div
                      className="w-full rounded-t bg-indigo-primary/70 group-hover:bg-indigo-primary transition-colors"
                      style={{ height: `${Math.max(pct, day.count > 0 ? 4 : 1)}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                      <div className="bg-navy text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                        {day.count} · {formatDate(day.date)}
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-navy" />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-300">{stats.daily[0] ? formatDate(stats.daily[0].date) : ''}</span>
              <span className="text-[10px] text-gray-300">{stats.daily[29] ? formatDate(stats.daily[29].date) : ''}</span>
            </div>
          </div>

          {total === 0 && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Aucun clic enregistré pour le moment. Les statistiques apparaîtront dès que des visiteurs interagiront avec votre fiche.
            </p>
          )}
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/mon-compte/profil-pro/ProStatsClient.tsx
git commit -m "feat: add ProStatsClient widget with KPIs and CSS bar chart"
```

---

### Task 8: Integrate stats widget into the pro dashboard

**Files:**
- Modify: `app/mon-compte/profil-pro/ProDashboardClient.tsx`

**Interfaces:**
- Consumes: `ProStatsClient` from Task 7
- Produces: stats section visible at top of dashboard when `pro.tier === 'PREMIUM_PLUS'`

- [ ] **Step 1: Add import and render**

At top of `ProDashboardClient.tsx`, add import after existing imports:
```ts
import ProStatsClient from './ProStatsClient'
```

Inside `ProDashboardClient`, in the `<div className="space-y-5">` block, add after `<SubscriptionSection pro={pro} />`:
```tsx
{/* Stats — Premium+ only */}
{pro.tier === 'PREMIUM_PLUS' && <ProStatsClient />}
```

- [ ] **Step 2: Also fix prices in the PLANS constant** (prices were corrected elsewhere but not here)

Replace:
```ts
const PLANS: { id: ProPlan; label: string; price: string; period: string; highlight?: boolean }[] = [
  { id: 'premium_monthly',      label: 'Premium',  price: '49 €',  period: '/mois' },
  { id: 'premium_annual',       label: 'Premium',  price: '490 €', period: '/an — 2 mois offerts' },
  { id: 'premium_plus_monthly', label: 'Premium+', price: '99 €',  period: '/mois', highlight: true },
  { id: 'premium_plus_annual',  label: 'Premium+', price: '990 €', period: '/an — 2 mois offerts', highlight: true },
]
```

With:
```ts
const PLANS: { id: ProPlan; label: string; price: string; period: string; highlight?: boolean }[] = [
  { id: 'premium_annual',      label: 'Premium',  price: '49,99 €', period: '/an', },
  { id: 'premium_plus_annual', label: 'Premium+', price: '99,99 €', period: '/an', highlight: true },
]
```

- [ ] **Step 3: Commit**

```bash
git add app/mon-compte/profil-pro/ProDashboardClient.tsx
git commit -m "feat: show ProStatsClient in Premium+ dashboard; fix plan prices"
```

---

### Task 9: Remove "(bientôt)" everywhere

**Files:**
- Modify: `app/devenir-pro/page.tsx`
- Modify: `app/mon-compte/profil-pro/create/OnboardingWizard.tsx`
- Modify: `app/publicite/page.tsx`

- [ ] **Step 1: devenir-pro/page.tsx**

In `PREMIUM_PLUS_FEATURES` array, change:
```ts
'Statistiques de clics (bientôt)',
```
to:
```ts
'Statistiques de clics',
```

- [ ] **Step 2: OnboardingWizard.tsx**

In the `premium_plus_annual` plan's `features` array, change:
```ts
'Statistiques de clics (bientôt)'
```
to:
```ts
'Statistiques de clics'
```

- [ ] **Step 3: publicite/page.tsx**

In the Premium+ tier's features array, change:
```ts
{ ok: true,  label: 'Statistiques de clics (bientôt)' },
```
to:
```ts
{ ok: true,  label: 'Statistiques de clics' },
```

- [ ] **Step 4: Commit**

```bash
git add app/devenir-pro/page.tsx app/mon-compte/profil-pro/create/OnboardingWizard.tsx app/publicite/page.tsx
git commit -m "feat: remove (bientôt) — click stats are now live"
```

---

### Task 10: Push + verify

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Verify Prisma table exists**

```bash
npx prisma studio
```

Open browser → check `ProClick` table exists (empty is fine).
