# Migration Neon (Postgres) → MySQL sur OVH — Design

Date : 2026-07-20

## Contexte

Le site ("1000Click Valencia") utilise aujourd'hui Neon (Postgres managé,
driver serverless `@prisma/adapter-neon`) comme base de données, hébergé
sur Vercel. L'objectif est de basculer vers une base MySQL auto-hébergée
sur le serveur dédié OVH de l'utilisateur (`51.75.116.192`), qui héberge
déjà plusieurs autres projets MySQL avec un accès distant fonctionnel
(convention `<projet>_user@%`).

**Motivation : coût.** Le serveur OVH est déjà payé ; éviter un coût
récurrent supplémentaire pour Neon.

**Vérifications techniques faites pendant le cadrage** (accès SSH `ovh-db`,
déjà configuré) :
- MySQL `8.0.42` (Ubuntu 20.04) — version récente, pleinement compatible
  avec Prisma (type `Json`, contraintes, etc.).
- Un autre projet (`forgeapp` / `forgeapp_shadow`) a déjà une base shadow
  Prisma fonctionnelle sur ce serveur — preuve que `prisma migrate dev`
  fonctionnera normalement ici, contrairement à Neon où l'historique de
  migration s'est révélé cassé (tables créées hors-migration avant ce
  projet) pendant le chantier multi-pays.
- Convention d'accès existante : un utilisateur MySQL dédié par projet
  (`<projet>_user`, host `%` pour un accès distant depuis Vercel).

## Décisions de cadrage (validées avec l'utilisateur)

- **Séquencement** : cette migration se fait **en premier**, sur `main`
  (schéma mono-pays actuel), **indépendamment** de la branche
  `multi-pays-plan1-fondations` (Plan 1 du chantier multi-pays), qui reste
  en attente dans son worktree. Une fois MySQL stable en production, la
  branche multi-pays sera réadaptée par-dessus (ses migrations Postgres
  devront être regénérées pour MySQL, mais le code applicatif ne dépend
  pas du SGBD).
- **Champs "tableau"** (`Professional.photos`, `Professional.zones`,
  `String[]` en Postgres, non supporté nativement par MySQL) : normalisés
  en tables relationnelles séparées (`ProfessionalPhoto`, `ProfessionalZone`),
  pas en colonnes JSON — plus de travail mais plus propre.
- **Bascule** : coupure de service courte et programmée (mode maintenance,
  déjà un réglage existant dans `SiteSettings.maintenanceMode`), pas de
  double-écriture ni de migration à chaud.
- Nom de la base : `vendo` (cohérent avec les emails de démo existants du
  projet — `demo@vendo.es`, `admin@vendo.es`) et utilisateur MySQL
  `vendo_user`, suivant la convention déjà en place sur le serveur.

## Inventaire des changements nécessaires

### 1. Schéma Prisma (`prisma/schema.prisma`)

- `datasource db { provider = "postgresql" → "mysql" }`.
- Suppression de `previewFeatures = ["driverAdapters"]` et de la dépendance
  `@prisma/adapter-neon` — MySQL sur serveur dédié utilise une connexion
  TCP classique poolée par Prisma (`connection_limit` dans l'URL), pas le
  driver HTTP serverless de Neon.
- Suppression de `directUrl` — c'est une spécificité Neon/PgBouncer (URL
  poolée vs URL directe pour les migrations) ; une seule URL de connexion
  suffit pour un MySQL classique.
- `Professional.photos String[]` → nouveau modèle `ProfessionalPhoto { id,
  professionalId, url, order }`.
- `Professional.zones String[]` → nouveau modèle `ProfessionalZone { id,
  professionalId, zone }`.
- Nouvel historique de migration : un unique `init` regénéré depuis le
  schéma MySQL final (l'historique Postgres existant est entièrement
  invalide en SQL MySQL) — résout au passage la dette technique de
  l'historique de migration cassé découverte pendant le chantier
  multi-pays (`docs/superpowers/plans/2026-07-19-multi-pays-plan1-fondations.md`,
  Global Constraints).

### 2. Code applicatif — instanciation Prisma

Tous les fichiers créant leur propre `PrismaClient` avec l'adapter Neon
doivent passer à une instanciation MySQL standard : `lib/prisma.ts` (le
client partagé de l'app) et les scripts autonomes `prisma/seed.ts`,
`prisma/seed-categories.ts`, `prisma/make-admin.ts`,
`prisma/make-demo-pro.ts`, `prisma/seed-blog.ts`, `prisma/seed-blog-i18n.ts`,
`prisma/seed-blog-images.ts` (inventaire exhaustif à refaire en début
d'implémentation — ces fichiers suivent tous le même patron
`new PrismaClient({ adapter: new PrismaNeon(...) })` à remplacer par
`new PrismaClient()` avec l'URL MySQL).

### 3. Requêtes incompatibles Postgres → MySQL

7 fichiers utilisent `mode: 'insensitive'` dans une clause `contains`
(option Prisma spécifique à Postgres/MongoDB, invalide sur MySQL) :
`app/professionnels/page.tsx`, `app/[seo]/page.tsx`,
`app/annonces/page.tsx`, `app/api/professionnels/route.ts`,
`app/api/listings/route.ts`, `app/api/listings/suggest/route.ts`,
`app/api/admin/utilisateurs/route.ts`. À retirer simplement — la collation
par défaut de MySQL 8 (`utf8mb4_0900_ai_ci`) est déjà insensible à la
casse, donc le comportement de recherche reste identique une fois l'option
supprimée.

### 4. Code applicatif — champs tableau

Tout le code lisant/écrivant `Professional.photos` ou `Professional.zones`
comme un tableau simple doit être adapté pour lire/écrire via la relation
(`include: { photos: true, zones: true }` + mapping vers/depuis un tableau
de chaînes côté UI, pour ne pas changer le contrat visuel côté frontend).

Fichiers identifiés avec une **forte confiance** (accès `professional.photos`
/ `professional.zones` par point, donc quasi certainement le champ Prisma
concerné) : `app/professionnels/[slug]/page.tsx`,
`app/mon-compte/profil-pro/ProDashboardClient.tsx`,
`app/admin/professionnels/AdminProsClient.tsx`,
`app/mon-compte/profil-pro/create/OnboardingWizard.tsx` (zones uniquement),
`app/api/pro/profile/route.ts`, `app/api/pro/upload/route.ts` (push dans
`photos`), `app/api/admin/professionnels/route.ts`,
`app/api/admin/professionnels/[id]/route.ts`, `prisma/make-demo-pro.ts`.

**Attention aux faux positifs** : une recherche large du mot "photos" ou
"zones" remonte aussi des fichiers sans rapport — copie marketing
(`app/devenir-pro/page.tsx`, `app/publicite/page.tsx`,
`app/confidentialite/page.tsx`, `app/contact/page.tsx`,
`app/deposer-annonce/page.tsx`), et des fonctionnalités différentes qui
n'ont rien à voir avec `Professional.photos` : les photos d'annonces
(`Listing`/`ListingImage`, `app/api/listings/[id]/images/route.ts`) et le
crédit "photo upgrade" des annonces (`PhotoUpgrade` model,
`app/api/stripe/photo-upgrade/route.ts`, `app/admin/statistiques/page.tsx`).
Ne pas les toucher. Chaque fichier candidat doit être relu individuellement
en phase de planification pour confirmer qu'il touche bien
`Professional.photos`/`zones` avant d'être inclus dans une tâche — c'est
exactement le type d'erreur (fichier manqué ou fichier non concerné inclus
à tort) qui a nécessité une correction en cours d'exécution pendant le
chantier multi-pays.

## Migration des données

Script one-off (`prisma/migrate-to-mysql.ts`, non committé ou committé en
tant qu'outil ponctuel documenté) qui :
1. Se connecte simultanément à l'ancienne base Postgres (lecture seule) et
   à la nouvelle base MySQL (écriture).
2. Lit chaque table dans l'ordre des dépendances (Site-independent d'abord :
   `User`, puis `Listing`/`ListingImage`/`Favorite`/`Message`,
   `Professional` + éclatement de `photos`/`zones` en lignes
   `ProfessionalPhoto`/`ProfessionalZone`, `Category`/`CategoryTranslation`,
   `BlogPost`, `SiteSettings`, etc.).
3. Écrit dans MySQL en conservant les identifiants existants (`id` cuid
   déjà généré côté Postgres, réutilisé tel quel) pour que toutes les
   relations restent cohérentes sans remapping.
4. Idempotent (upsert par `id`) — rejouable plusieurs fois pour un essai à
   blanc avant le jour de bascule, puis une dernière fois pendant la
   fenêtre de maintenance pour capturer les écritures survenues entre-temps.
5. Vérifie les comptes de lignes par table entre source et destination
   avant de considérer la migration réussie.

## Plan de bascule (fenêtre de maintenance)

1. **Répétition générale** : migration complète vers MySQL à partir d'une
   copie des données de prod, avant le jour J — vérification des comptes
   de lignes et contrôle ponctuel de quelques enregistrements réels. Aucun
   impact sur le site en production.
2. **Jour J** : activer `maintenanceMode` (réglage admin existant), lancer
   une dernière fois le script de migration contre les données Postgres
   live, vérifier les comptes.
3. Mettre à jour `DATABASE_URL` (et supprimer `DIRECT_URL`, plus
   nécessaire) dans les variables d'environnement Vercel (Production), puis
   redéployer.
4. Désactiver `maintenanceMode`, test de fumée en direct (connexion,
   navigation annonces, dépôt d'annonce, panel admin).
5. Garder la base Neon intacte (mise en pause, pas supprimée) pendant une
   fenêtre de sécurité (1 à 2 semaines) avant résiliation, pour permettre
   un rollback rapide si besoin.

## Plan de rollback

Si un problème survient après la bascule : remettre `DATABASE_URL` sur
Neon dans Vercel et redéployer. Neon conserve toutes les données jusqu'au
moment exact de la bascule — rollback rapide et sûr, au prix de la perte
des seules écritures faites sur MySQL pendant la courte fenêtre entre la
bascule et la détection du problème.

## Vérification

Pas de suite de tests automatisés dans ce projet (cohérent avec le reste
du code). Vérification par :
- `npx tsc --noEmit` (zéro erreur) après le changement de provider et
  l'adaptation du code.
- Comptes de lignes source/destination identiques après migration des
  données.
- Contrôle manuel en environnement de test avant la bascule réelle (mêmes
  parcours que la recette du chantier multi-pays : inscription/connexion,
  navigation annonces, dépôt d'annonce, fiches pro avec photos/zones,
  panel admin).
- Test de fumée en production juste après la bascule réelle.

## Hors périmètre

- La branche multi-pays (`multi-pays-plan1-fondations`) — traitée après,
  séparément.
- Migration ou changement d'hébergement de l'application elle-même
  (reste sur Vercel) — seule la base de données change d'hébergeur.
- Le stockage des images (`@vercel/blob`) — aucun changement, sans lien
  avec la base de données.
