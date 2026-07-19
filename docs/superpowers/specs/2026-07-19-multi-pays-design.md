# Module multi-pays — Design

Date : 2026-07-19
Devis de référence : `docs/Devis_MSD-2026-007_MultiPays.pdf` (MSD-2026-007)

## Contexte

Le site (« 1000Click Valencia ») est aujourd'hui mono-pays, entièrement câblé
sur l'Espagne/Valencia (pages légales, pages marketing, listes de villes,
catégories, annonces, professionnels). Il n'existe aucun modèle `Site`,
aucun `siteId`, aucune détection de domaine. Le devis MSD-2026-007 couvre la
transformation en architecture multi-tenancy (un seul déploiement Vercel,
plusieurs domaines pays indépendants).

**Contrainte absolue : le site Espagne actuel doit continuer de fonctionner
parfaitement à chaque étape.** Chaque changement est un commit séparé,
testable indépendamment, non-destructif.

## Décisions de cadrage (validées avec l'utilisateur)

- **Périmètre contenu** : data (catégories, annonces, pros, Stripe) **+**
  pages légales configurables par site. Les pages marketing
  (`devenir-pro`, `publicite`, `contact`) restent en dur sur l'Espagne pour
  l'instant — hors périmètre, à traiter dans un futur chantier de contenu.
- **Deuxième pays** : un vrai pays sera configuré en fin de chantier
  (domaine, infos légales) — les détails seront demandés au moment de
  l'activer, pas nécessaires pour construire l'infrastructure.
- **Détection du site actif** : par domaine complet (ex. `1000clic.be`),
  pas par sous-domaine.
- **Devise** : EUR partout. Pas de vraie conversion ni de double
  tarification Stripe — aucun champ devise/prix multiple sur `Site`.
- **Admin** : comptes admin globaux avec un sélecteur de site en haut du
  panel, pas d'admins restreints à un site.
- **Comptes utilisateurs** : rattachés à un site (`siteId` obligatoire sur
  `User`) — un compte est créé sur un domaine pays précis et ne se connecte
  que sur ce domaine.
- **Domaine par défaut (site Espagne)** : `1000clic.fr` et
  `www.1000clic.fr`.
- **Blog** : reste global (non scopé) — explicitement hors périmètre pour
  éviter toute ambiguïté future.

## Architecture

Un seul déploiement Next.js/Vercel, plusieurs domaines personnalisés
pointant vers le même projet. `middleware.ts` (aujourd'hui limité à l'auth
NextAuth) est étendu pour résoudre le site actif à partir du hostname de la
requête et l'injecter via un header interne (`x-site-id`) transmis aux
Server Components et Route Handlers. Un domaine inconnu (localhost, preview
Vercel, faute de frappe DNS) retombe sur le site par défaut (Espagne) — le
comportement en dev/preview reste inchangé.

Une nouvelle fonction serveur `getCurrentSite()` (dans `lib/site.ts`, sur le
modèle de `lib/categories.ts::getCategoriesServer`) lit ce header et
retourne le `Site` correspondant (avec cache `unstable_cache`).

## Modèle de données

Nouveau modèle :

```prisma
model Site {
  id            String   @id @default(cuid())
  domain        String   @unique
  name          String
  country       String
  primaryColor  String   @default("#F97316") // orange actuel
  secondaryColor String  @default("#12122A") // navy actuel
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  settings      SiteSettings?
  categories    Category[]
  listings      Listing[]
  professionals Professional[]
  users         User[]
}
```

`SiteSettings` existant (`heroImages`, `announcementText`,
`announcementEnabled`, `contactEmail`, `maintenanceMode`) est **réutilisé,
pas dupliqué** : son `id` (aujourd'hui le singleton `"default"`) devient une
FK 1-1 vers `Site.id`. Chaque site a ainsi ses propres réglages sans nouveau
modèle.

Nouveaux champs légaux sur `Site` (pour les pages légales, cf. plus bas) :

```prisma
  legalCompanyName String?
  legalCountry     String?   // ex: "Espagne (Comunitat Valenciana)"
  legalContactEmail String?
```

### Scoping (`siteId` ajouté)

- `Category` : `siteId String`, contrainte `@@unique([siteId, slug])` (au
  lieu de `slug @unique` global).
- `Listing` : `siteId String`.
- `Professional` : `siteId String` (le `slug @unique` reste global pour
  l'instant — YAGNI, pas de collision réelle tant qu'un seul site a des
  données).
- `User` : `siteId String`, contrainte `@@unique([siteId, email])` (au lieu
  de `email @unique` global) — un même email peut créer un compte sur
  chaque pays. Impacte 3 points de lookup par email :
  `auth.ts::authorize`, `app/api/auth/register/route.ts`,
  `app/api/auth/forgot-password/route.ts`.

`SiteSettings` (fusion avec `Site`, cf. section Modèle de données) est
**reportée à la phase admin (Plan 2)** : le singleton `id: "default"` reste
global et continue de s'appliquer à tous les sites tant que le panel admin
"Sites & Pays" n'existe pas — état intermédiaire sûr (pas de fuite de
données, juste un réglage pas encore différencié par pays).

Hérite du scoping via relation (pas de colonne directe) : `Favorite`,
`Message`, `Report`, `ProClick`, `BusinessCard`, `PhotoUpgrade`,
`ListingImage`, `RateLimitHit` (reste global, clé technique).

`BlogPost` : **non scopé**, reste global (décision de cadrage ci-dessus).

## Migration non-destructive

Une seule migration Prisma en plusieurs étapes dans le même changement :

1. Créer `Site` avec la ligne par défaut :
   `domain: "1000clic.fr", name: "1000Click Valencia", country: "Espagne"`.
2. Ajouter les colonnes `siteId` (nullable dans un premier temps) sur
   `Category`, `Listing`, `Professional`, `User`.
3. `UPDATE` en masse : rattacher toutes les lignes existantes au site par
   défaut.
4. Rendre `siteId` `NOT NULL` une fois le backfill vérifié.
5. Migrer `SiteSettings` : la ligne `id = "default"` devient
   `id = <id du site par défaut>`.
6. Remplacer la contrainte `Category.slug @unique` par
   `@@unique([siteId, slug])`.

Aucune donnée supprimée ni déplacée entre lignes. Le site Espagne continue
de fonctionner à l'identique à chaque étape intermédiaire (siteId nullable
puis peuplé avant d'être contraint).

## Comptes ADMIN

Restent globaux : un admin a un `siteId` (site par défaut) mais les routes
`/admin/*` ignorent le filtre de site pour le rôle `ADMIN`. Un **sélecteur
de site** apparaît en haut du panel admin ; le site sélectionné est stocké
dans un cookie dédié (`vem_admin_site`, distinct du cookie de résolution
`x-site-id` public) et toutes les requêtes admin (annonces, pros, users,
stats, catégories) se filtrent dessus.

Nouvel écran `app/admin/sites/` : liste des sites, création d'un nouveau
site (domaine, nom, pays, couleurs, infos légales), activation/désactivation.

## Pages légales

`mentions-legales`, `confidentialite`, `cgu`, `cookies` lisent
`getCurrentSite()` pour `legalCompanyName`, `legalCountry`,
`legalContactEmail` au lieu du texte en dur "Espagne (Comunitat
Valenciana)". Ces champs sont éditables depuis `app/admin/sites/`.

## Thème

`primaryColor` / `secondaryColor` du `Site` injectées en CSS custom
properties dans `app/layout.tsx`. Les valeurs par défaut du site Espagne
sont les couleurs actuelles (orange `#F97316` / navy `#12122A`) — zéro
changement visuel pour l'existant tant qu'aucune autre couleur n'est
configurée.

## Stripe

Compte Stripe partagé existant, aucune clé nouvelle. Ajout du `siteId` et du
nom du pays dans les `metadata` des sessions checkout et abonnements pour
permettre un filtrage dans le dashboard Stripe. Tarifs identiques partout
(EUR).

## Ordre de mise en œuvre (garde-fous)

Chaque étape = un commit testable isolément, rien n'est activé avant que le
site par défaut soit vérifié identique à l'état actuel. Vu le nombre réel de
fichiers concernés (~50, découvert pendant le plan), le chantier est
découpé en plans successifs, chacun livrant un système qui fonctionne :

**Plan 1 — Fondations** (ce plan) :
1. Schéma Prisma (`Site`, `siteId` nullable partout) + script de backfill,
   puis contrainte NOT NULL + `@@unique([siteId, slug])` sur `Category` et
   `@@unique([siteId, email])` sur `User`.
2. `proxy.ts` (renommage de `middleware.ts`, cf. dépréciation Next 16) :
   résolution de domaine + header `x-site-id` + fallback site par défaut.
3. `lib/site.ts::getCurrentSite()`.
4. Scoping complet des catégories (lecture + écriture) — sert de patron de
   référence pour les plans suivants.
5. Rattachement au site sur les points de création directs (inscription,
   dépôt d'annonce, création fiche pro en self-service et en admin) —
   nécessaire pour que la contrainte NOT NULL ne casse pas ces parcours.
   Le filtrage en lecture des annonces/pros par site est différé au Plan 2.

**Plan 2 — Scoping données + panel admin** :
6. Filtrage en lecture de toutes les requêtes annonces/professionnels par
   site (~40 fichiers identifiés : pages publiques, API, admin, sitemap,
   exports).
7. Fusion `SiteSettings` → `Site`.
8. Panel admin `Sites & Pays` + sélecteur de site admin.

**Plan 3 — Habillage pays** :
9. Pages légales dynamiques par site.
10. Thème dynamique (CSS variables).
11. Metadata Stripe par site.
12. Tests bout-en-bout avec un deuxième site de démonstration, recette
    complète sur le site Espagne, puis activation du vrai deuxième pays.

## Hors périmètre (explicite)

- Pages marketing (`devenir-pro`, `publicite`, `contact`) : restent en dur
  sur l'Espagne.
- Devises multiples / tarification Stripe différenciée par pays.
- Blog multi-site.
- Admins restreints à un seul site (permission fine par pays).
