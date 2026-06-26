# Design : Onboarding self-service professionnel

**Date :** 2026-06-26  
**Statut :** Approuvé

## Contexte

Actuellement, la création d'une fiche professionnelle (`Professional`) est réservée à l'admin. Un pro qui s'inscrit tombe sur un écran "Fiche non liée, contactez-nous". L'objectif est de permettre à tout utilisateur connecté de créer sa fiche pro lui-même, avec paiement immédiat (plus de tier FREE).

## Décisions clés

- **Approche** : état client (React state) — aucune donnée envoyée en base avant le paiement
- **Tier** : plus de FREE. La fiche n'est créée et visible qu'après paiement Stripe (Premium 49,99€/mois ou Premium+ 99,99€/mois)
- **Slug** : auto-généré depuis le nom, non modifiable par l'utilisateur
- **Visibilité** : immédiate après paiement (webhook Stripe existant gère l'activation du tier)
- **Animations** : wizard avec slide horizontal entre étapes, barre de progression animée, responsive mobile

## Structure du wizard

4 étapes, toutes collectées upfront :

### Étape 1 — Identité
- Nom de l'entreprise / activité (required) — génère le slug live
- Slug preview : `vendo.es/professionnels/<slug>` (lecture seule)
- Catégorie (required) — select depuis `proCategories`
- Ville (required)
- Zones d'intervention (tags optionnels)

### Étape 2 — Présentation
- Description (textarea, max 1000 chars, optionnel)
- Téléphone (optionnel)
- WhatsApp (optionnel)
- Site web (optionnel, URL validée)
- Téléphone masqué (toggle)

### Étape 3 — Visuels
- Logo (upload image, aperçu immédiat)
- Bannière (upload image, aperçu immédiat)
- Photos supplémentaires (multi-upload, aperçu)
- Tous optionnels — possibles à ajouter/modifier plus tard depuis le dashboard

### Étape 4 — Plan
- Choix Premium (49,99€/mois ou 490€/an) ou Premium+ (99,99€/mois ou 990€/an)
- Cartes animées avec sélection visuelle (ring orange / indigo)
- Bouton "Payer et publier" → appel API → redirect Stripe

## Architecture technique

### Nouveau fichier : `app/mon-compte/profil-pro/create/page.tsx`
- Server component
- Vérifie session (redirect `/connexion` si non connecté)
- Vérifie si `professional.userId === session.user.id` existe déjà (redirect `/mon-compte/profil-pro` si oui)
- Rend `<OnboardingWizard />`

### Nouveau fichier : `app/mon-compte/profil-pro/create/OnboardingWizard.tsx`
- Client component (`'use client'`)
- State : `step` (1-4) + `formData` (tous les champs)
- Animations : `framer-motion` (slide horizontal entre étapes, `AnimatePresence`)
- Barre de progression : 4 segments, transition CSS `width`
- Validation par étape avant d'autoriser "Suivant"
- Upload images : via `POST /api/pro/upload` (route existante)
- Étape 4 : appel `POST /api/pro/profile` avec tous les champs + `plan` → reçoit `{ url }` → `window.location.href = url`

### Modification : `POST /api/pro/profile`
Ajouter le handler POST à la route existante `app/api/pro/profile/route.ts` :
- Requiert session connectée
- Vérifie qu'aucune fiche `professional` n'existe déjà pour ce `userId`
- Valide les champs (zod) : name, slug (généré serveur-side depuis name), category, city + champs optionnels
- Génère le slug depuis le nom (slugify) + vérifie unicité (suffix numérique si collision)
- Crée le record `professional` avec `userId`, `tier: 'FREE'` (sera mis à jour par webhook)
- Appelle Stripe Checkout avec `metadata: { professionalId, plan }` (même logique que `pro-subscription/route.ts`)
- Retourne `{ url: checkoutUrl }`

### Modification : `app/mon-compte/profil-pro/page.tsx`
- L'état vide actuel ("contactez-nous") est remplacé par un bouton "Créer ma fiche pro" → `/mon-compte/profil-pro/create`

## Gestion des cas limites

- **Abandon mid-wizard** : aucune donnée en base (state purement client). Pas de nettoyage nécessaire.
- **Slug collision** : géré serveur-side, suffix numérique automatique (`marie-dupont-2`)
- **Déjà une fiche** : redirect vers le dashboard pro existant
- **Upload images avant création** : les images sont uploadées au fur et à mesure (Cloudinary/S3 via route existante), les URLs sont stockées dans le state. Si abandon, les images uploadées restent orphelines (acceptable).
- **Webhook** : le webhook Stripe existant dans `app/api/webhooks/stripe/route.ts` gère déjà la mise à jour `tier` + `subscriptionStatus` sur le record `professional` — rien à modifier.

## Design visuel

- Fond `bg-orange-soft` (cohérent avec `/inscription`)
- Card blanche centrée, `max-w-lg`, `rounded-2xl`, `shadow-lg`
- Barre de progression : 4 segments `bg-orange-primary` avec transition `width` CSS
- Header étape : numéro + titre + sous-titre
- Navigation : bouton "Retour" (ghost) + bouton "Suivant" / "Payer et publier" (primary orange)
- Étape 4 — cartes plan : ring `border-orange-primary` pour Premium, `border-indigo-primary` pour Premium+, badge "Populaire" / "Meilleure visibilité"
- Responsive : full-width sur mobile, centré sur desktop
