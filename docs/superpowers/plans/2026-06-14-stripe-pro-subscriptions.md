# Stripe Pro Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter un système d'abonnement récurrent Stripe pour les offres Premium (49€/mois ou 490€/an) et Premium+ (99€/mois ou 990€/an) des professionnels sur Vendo.

**Architecture:** Stripe Checkout en mode `subscription` crée l'abonnement. Un webhook Stripe écoute les événements (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) et met à jour le `tier` du `Professional` en base. Le portail client Stripe gère les modifications/annulations.

**Tech Stack:** Next.js App Router, Prisma (PostgreSQL/Neon), Stripe SDK v22, TypeScript

---

## Pré-requis Stripe (manuel — à faire avant de coder)

Avant de commencer les tâches, effectuer ces actions dans le **tableau de bord Stripe test** (dashboard.stripe.com → mode Test) :

1. **Récupérer les clés test** : Développeurs → Clés API → copier `pk_test_...` et `sk_test_...`
2. **Créer 4 produits/prix** :
   - Premium Mensuel : 49,00 € / mois récurrent → copier le Price ID (`price_...`)
   - Premium Annuel : 490,00 € / an récurrent → copier le Price ID
   - Premium+ Mensuel : 99,00 € / mois récurrent → copier le Price ID
   - Premium+ Annuel : 990,00 € / an récurrent → copier le Price ID
3. **Créer un webhook** : Développeurs → Webhooks → Ajouter un endpoint
   - URL : `https://<ton-domaine>/api/webhooks/stripe` (utiliser ngrok en local)
   - Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copier le `whsec_...` (Signing secret)

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---|---|---|
| `prisma/schema.prisma` | Modifier | Ajouter champs subscription au modèle Professional |
| `lib/stripe.ts` | Modifier | Ajouter Price IDs et helpers subscription |
| `app/api/stripe/pro-subscription/route.ts` | Créer | Créer une Checkout Session d'abonnement |
| `app/api/stripe/pro-subscription/cancel/route.ts` | Créer | Annuler l'abonnement en cours |
| `app/api/stripe/pro-subscription/portal/route.ts` | Créer | Rediriger vers le portail de facturation Stripe |
| `app/api/webhooks/stripe/route.ts` | Créer | Gérer les événements Stripe et mettre à jour le tier |
| `.env.local` | Modifier | Ajouter les 7 variables d'environnement Stripe |

---

## Task 1 : Variables d'environnement

**Files:**
- Modify: `.env.local`

- [ ] **Step 1 : Ajouter les variables dans `.env.local`**

Remplacer les lignes Stripe vides par :

```env
STRIPE_SECRET_KEY="sk_test_XXXX"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_XXXX"
STRIPE_WEBHOOK_SECRET="whsec_XXXX"

STRIPE_PRICE_PREMIUM_MONTHLY="price_XXXX"
STRIPE_PRICE_PREMIUM_ANNUAL="price_XXXX"
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY="price_XXXX"
STRIPE_PRICE_PREMIUM_PLUS_ANNUAL="price_XXXX"
```

- [ ] **Step 2 : Vérifier que le serveur démarre sans erreur**

```bash
npm run dev
```

Expected: aucune erreur `STRIPE_SECRET_KEY is not set`.

---

## Task 2 : Schéma Prisma — champs subscription

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1 : Ajouter les champs dans le modèle `Professional`**

Ajouter après le champ `updatedAt` dans le modèle `Professional` :

```prisma
  stripeCustomerId          String?
  stripeSubscriptionId      String?
  subscriptionStatus        String?   // active | canceled | past_due | unpaid
  subscriptionPeriod        String?   // monthly | annual
  subscriptionCurrentPeriodEnd DateTime?
```

- [ ] **Step 2 : Générer et appliquer la migration**

```bash
npx prisma migrate dev --name add_subscription_fields
```

Expected: migration créée et appliquée, `npx prisma generate` exécuté automatiquement.

- [ ] **Step 3 : Vérifier en studio**

```bash
npx prisma studio
```

Ouvrir le modèle `Professional` et vérifier que les 5 nouveaux champs sont présents.

- [ ] **Step 4 : Commit**

```bash
git add prisma/
git commit -m "feat: add subscription fields to Professional model"
```

---

## Task 3 : Mettre à jour `lib/stripe.ts`

**Files:**
- Modify: `lib/stripe.ts`

- [ ] **Step 1 : Remplacer le contenu de `lib/stripe.ts`**

```typescript
import Stripe from 'stripe'

export const PHOTO_UPGRADE_PRICE_CENTS = 799
export const PHOTO_UPGRADE_EXTRA = 3
export const FREE_MAX_PHOTOS = 3
export const UPGRADED_MAX_PHOTOS = FREE_MAX_PHOTOS + PHOTO_UPGRADE_EXTRA

export type ProPlan = 'premium_monthly' | 'premium_annual' | 'premium_plus_monthly' | 'premium_plus_annual'

export const PRO_PLANS: Record<ProPlan, { priceEnvKey: string; tier: 'PREMIUM' | 'PREMIUM_PLUS'; period: 'monthly' | 'annual'; label: string; amount: number }> = {
  premium_monthly:      { priceEnvKey: 'STRIPE_PRICE_PREMIUM_MONTHLY',      tier: 'PREMIUM',      period: 'monthly', label: 'Premium Mensuel',   amount: 4900 },
  premium_annual:       { priceEnvKey: 'STRIPE_PRICE_PREMIUM_ANNUAL',        tier: 'PREMIUM',      period: 'annual',  label: 'Premium Annuel',    amount: 49000 },
  premium_plus_monthly: { priceEnvKey: 'STRIPE_PRICE_PREMIUM_PLUS_MONTHLY',  tier: 'PREMIUM_PLUS', period: 'monthly', label: 'Premium+ Mensuel',  amount: 9900 },
  premium_plus_annual:  { priceEnvKey: 'STRIPE_PRICE_PREMIUM_PLUS_ANNUAL',   tier: 'PREMIUM_PLUS', period: 'annual',  label: 'Premium+ Annuel',   amount: 99000 },
}

export function getPriceId(plan: ProPlan): string {
  const key = PRO_PLANS[plan].priceEnvKey
  const id = process.env[key]
  if (!id) throw new Error(`Missing env var: ${key}`)
  return id
}

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/stripe.ts
git commit -m "feat: add pro plan constants to stripe lib"
```

---

## Task 4 : Route — Créer une Checkout Session d'abonnement

**Files:**
- Create: `app/api/stripe/pro-subscription/route.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, getPriceId, PRO_PLANS, type ProPlan } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: ProPlan }
  if (!PRO_PLANS[plan]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })
  if (!pro) {
    return NextResponse.json({ error: 'Fiche professionnelle introuvable' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const checkoutParams: Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0] = {
    mode: 'subscription',
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: `${baseUrl}/mon-compte?subscription=success`,
    cancel_url: `${baseUrl}/publicite`,
    locale: 'fr',
    metadata: {
      professionalId: pro.id,
      plan,
    },
  }

  // Réutiliser le customer Stripe existant si disponible
  if (pro.stripeCustomerId) {
    checkoutParams.customer = pro.stripeCustomerId
  } else {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    checkoutParams.customer_email = user?.email
  }

  const checkout = await getStripe().checkout.sessions.create(checkoutParams)

  return NextResponse.json({ url: checkout.url })
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: pas d'erreurs sur ce fichier.

- [ ] **Step 3 : Commit**

```bash
git add app/api/stripe/pro-subscription/route.ts
git commit -m "feat: add pro subscription checkout session endpoint"
```

---

## Task 5 : Route — Portail client Stripe

**Files:**
- Create: `app/api/stripe/pro-subscription/portal/route.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })

  if (!pro?.stripeCustomerId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const portal = await getStripe().billingPortal.sessions.create({
    customer: pro.stripeCustomerId,
    return_url: `${baseUrl}/mon-compte`,
  })

  return NextResponse.json({ url: portal.url })
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/api/stripe/pro-subscription/portal/route.ts
git commit -m "feat: add stripe billing portal endpoint"
```

---

## Task 6 : Route — Annuler l'abonnement

**Files:**
- Create: `app/api/stripe/pro-subscription/cancel/route.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const pro = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  })

  if (!pro?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  // cancel_at_period_end = true : accès maintenu jusqu'à la fin de la période payée
  await getStripe().subscriptions.update(pro.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/api/stripe/pro-subscription/cancel/route.ts
git commit -m "feat: add subscription cancel endpoint (cancel_at_period_end)"
```

---

## Task 7 : Webhook Stripe

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripe, PRO_PLANS, type ProPlan } from '@/lib/stripe'

// Next.js App Router : désactiver le body parser pour lire le raw body
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const plan = session.metadata?.plan as ProPlan | undefined
      const professionalId = session.metadata?.professionalId
      if (!plan || !professionalId || !PRO_PLANS[plan]) break

      const planInfo = PRO_PLANS[plan]
      const subscriptionId = session.subscription as string
      const customerId = session.customer as string

      // Récupérer la subscription pour avoir la date de fin de période
      const sub = await getStripe().subscriptions.retrieve(subscriptionId)

      await prisma.professional.update({
        where: { id: professionalId },
        data: {
          tier: planInfo.tier,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: sub.status,
          subscriptionPeriod: planInfo.period,
          subscriptionCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const pro = await prisma.professional.findFirst({
        where: { stripeSubscriptionId: sub.id },
      })
      if (!pro) break

      // Déterminer le tier depuis le price ID
      const priceId = sub.items.data[0]?.price.id
      let tier: 'PREMIUM' | 'PREMIUM_PLUS' | 'FREE' = 'FREE'
      let period: 'monthly' | 'annual' | null = null

      for (const [planKey, planInfo] of Object.entries(PRO_PLANS)) {
        const envKey = planInfo.priceEnvKey
        if (process.env[envKey] === priceId) {
          tier = planInfo.tier
          period = planInfo.period
          break
        }
        void planKey
      }

      await prisma.professional.update({
        where: { id: pro.id },
        data: {
          tier: sub.status === 'active' ? tier : 'FREE',
          subscriptionStatus: sub.status,
          subscriptionPeriod: period,
          subscriptionCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          subscriptionStatus: 'canceled',
          subscriptionCurrentPeriodEnd: null,
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
      if (!subId) break
      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: subId },
        data: { subscriptionStatus: 'past_due' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: pas d'erreurs.

- [ ] **Step 3 : Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: add stripe webhook handler for pro subscriptions"
```

---

## Task 8 : Test local avec Stripe CLI

- [ ] **Step 1 : Installer Stripe CLI** (si pas déjà fait)

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

- [ ] **Step 2 : Écouter les webhooks en local**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copier le `whsec_...` affiché et le mettre dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 3 : Déclencher un paiement test**

Dans un second terminal :
```bash
stripe trigger checkout.session.completed
```

Expected: le webhook reçoit l'événement, la console Next.js ne logue aucune erreur.

- [ ] **Step 4 : Vérifier en base**

```bash
npx prisma studio
```

Ouvrir le modèle `Professional` et vérifier qu'un enregistrement a `subscriptionStatus: "active"` et `tier: "PREMIUM"` ou `"PREMIUM_PLUS"`.

---

## Task 9 : Mise à jour de la page `/publicite` — boutons d'abonnement

**Files:**
- Modify: `app/publicite/page.tsx`

> Cette task est optionnelle si les pros passent par `/mon-compte` pour s'abonner. Elle ajoute des liens directs depuis la page publicitaire.

- [ ] **Step 1 : Changer les CTA des tiers vers une page dédiée**

Les boutons "Passer à Premium" et "Passer à Premium+" pointent vers `/contact`. Si l'on veut un flux Stripe direct, les faire pointer vers `/mon-compte?subscribe=premium_monthly` (ou le plan souhaité). Cette logique de redirection peut être gérée dans la page `/mon-compte`.

Pour l'instant, laisser les CTA vers `/contact` — le flux manuel reste valide pendant la phase de lancement.

---

## Récapitulatif des variables d'environnement requises

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PREMIUM_MONTHLY="price_..."
STRIPE_PRICE_PREMIUM_ANNUAL="price_..."
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY="price_..."
STRIPE_PRICE_PREMIUM_PLUS_ANNUAL="price_..."
```
