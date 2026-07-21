# `Site.publiclyLive` Tripwire — Design

## Context

Plan 2's final whole-branch review (`.superpowers/sdd/progress-plan2.md`, range `9109628..0fd9c99`) flagged an Important, non-blocking finding: Plan 2's `/admin/sites` panel now makes it possible to create and activate a second `Site` with real public-facing data (listings, professional profiles), but the public read paths (`app/annonces`, `app/professionnels`, `app/page.tsx`) are still fully unscoped by `siteId` — that scoping work is deliberately deferred to a future "Plan 3". Today this is harmless because only one site exists in production. The moment a second site accumulates real public data, its rows would render mixed in with the default site's on every public page, since the read queries don't filter by site at all.

`Site.active` defaults to `true` with no intermediate "not yet public" state, so the only thing preventing this today is a sentence in a planning document — not code.

## Goal

Prevent a newly created site from *silently* accumulating public-facing data before an operator has deliberately decided it's ready to go live. This converts the risk from "accidental side effect of normal admin activity" into "an operator has to explicitly flip a switch to allow it" — it does **not** eliminate the underlying leak once that switch is flipped. Plan 3 (scoping the actual public read paths) remains the real fix and is still required before genuinely running two public-facing countries at once. This tripwire only buys a deliberate checkpoint.

## Changes

### 1. Schema

Add to `Site` in `prisma/schema.prisma`:
```prisma
publiclyLive Boolean @default(true)
```
Additive-only migration (`prisma migrate dev`). `@default(true)` means the migration backfills the existing default (Spain) site to `true` — matching its current, already-public reality. No behavior change for the existing site.

### 2. Site creation (`app/api/admin/sites/route.ts`, `POST`)

New sites explicitly get `publiclyLive: false` in the `prisma.site.create()` call — the schema default only exists to keep today's single production site working; application-level creation of any *new* site always starts non-live.

### 3. Admin UI (`app/admin/sites/AdminSitesClient.tsx`, `app/api/admin/sites/[id]/route.ts`)

A second toggle button next to the existing "Actif/Inactif" pill: "Publié au public" (green) / "Pas encore public" (gray), calling the same `PUT /api/admin/sites/[id]` endpoint with `{ publiclyLive: !site.publiclyLive }`. The existing `updateSchema` in `[id]/route.ts` already needs a `publiclyLive: z.boolean().optional()` field added.

### 4. Gated public-creation endpoints

- `app/api/listings/route.ts` (`POST` — public "post an ad" form)
- `app/api/pro/profile/route.ts` (`POST` — public professional self-registration)

Both already resolve `const siteId = await getCurrentSiteId()`. After that line, fetch the site and check `publiclyLive`:
```ts
const site = await prisma.site.findUnique({ where: { id: siteId }, select: { publiclyLive: true } })
if (!site?.publiclyLive) {
  return NextResponse.json({ error: 'Ce site n\'est pas encore ouvert au public.' }, { status: 403 })
}
```

### 5. Explicitly NOT gated

- Admin-created listings/professionals (`app/api/admin/annonces`, `app/api/admin/professionnels`) — admins are trusted and may need to seed test data (as Task 10 of Plan 2 already did) before flipping a site live.
- `POST /api/auth/register` (public user account creation) — an account alone renders nothing on public pages; no leak risk from allowing signups on a not-yet-live site.

## Out of scope

Scoping the actual public read paths (`app/annonces`, `app/professionnels`, `app/page.tsx`, sitemap, exports) by `siteId` — that remains "Plan 3", not part of this change. This tripwire is a stopgap, not a substitute.
