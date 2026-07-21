# Reprise du module multi-pays sur MySQL — Design

Date : 2026-07-20

## Contexte

Le chantier multi-pays (`docs/superpowers/specs/2026-07-19-multi-pays-design.md`)
avait été implémenté une première fois ("Plan 1 — Fondations") sur la
branche `multi-pays-plan1-fondations`, contre le schéma Postgres/Neon
d'alors. Ce chantier a ensuite été mis de côté pendant la migration de la
base vers MySQL (`docs/superpowers/specs/2026-07-20-mysql-migration-design.md`),
qui a depuis été déployée en production.

La branche `multi-pays-plan1-fondations` a divergé de `main` de 11 commits
(tout Postgres/Neon — driver adapter, `proxy.ts`, migrations SQL Postgres)
pendant que `main` a reçu la conversion complète vers MySQL. Fusionner
l'ancienne branche créerait des conflits profonds sans valeur : le code est
à réécrire proprement contre le `main` actuel (MySQL), mais **les décisions
de conception restent les mêmes**, déjà validées avec l'utilisateur.

**Découverte pendant la migration MySQL** : le schéma Postgres (Site,
`siteId`) avait été appliqué par erreur directement à la base de production
pendant le premier essai du chantier multi-pays, avant confirmation que
cette base était bien la production. La bascule vers MySQL (base neuve,
rechargée depuis un schéma `main` sans aucune notion de site) a
définitivement nettoyé cet état — la base de production actuelle ne
contient aucune trace du modèle `Site`. Table rase, sans risque résiduel.

## Décisions de conception reprises telles quelles (déjà validées)

- Détection du site actif par domaine complet (pas par sous-domaine).
- Devise EUR partout, pas de vraie conversion multi-devise.
- Admins globaux avec sélecteur de site — pas d'admins restreints à un
  pays.
- Comptes utilisateurs rattachés à un site (`siteId` obligatoire sur
  `User`, un compte par domaine).
- Pages marketing (devenir-pro, publicite, contact) restent en dur sur
  l'Espagne — hors périmètre.
- Blog reste global, non scopé.
- Domaine du site par défaut : `1000clic.fr`.

## Nouveauté par rapport au premier essai : le vrai périmètre de cette reprise

Le premier essai (Plan 1 seul) posait les fondations techniques mais
**n'ajoutait rien de visible dans l'admin** — c'est exactement ce qui a
généré la confusion de l'utilisateur ("je ne vois rien"). Cette reprise
couvre donc Plan 1 **et** un Plan 2 réduit et pragmatique, pour qu'il y ait
quelque chose de concret et utilisable à la fin.

### Plan 1 (fondations, réécrites pour MySQL)

Mêmes composants qu'avant, adaptés à MySQL :
- Modèle `Site` (id, domain unique, name, country, primaryColor,
  secondaryColor, active, createdAt/updatedAt). Champs `String` courts
  (domaine, nom) — pas besoin de `@db.Text`, comme établi pendant la
  migration MySQL pour les champs de ce type.
- **`SiteSettings` reste global pour l'instant, comme dans le premier
  essai** (pas fusionné dans `Site` cette fois-ci — correction par rapport
  à une première intention notée plus haut dans ce document pendant le
  cadrage : la fusion toucherait 7 fichiers de plus
  (`app/page.tsx`, `app/admin/annonces/page.tsx`,
  `app/admin/parametres/page.tsx`, `app/api/listings/route.ts`,
  `app/api/admin/settings/route.ts`, `app/api/admin/database/export/route.ts`,
  `lib/get-contact-email.ts`) sans rien apporter à l'objectif concret de
  cette reprise, qui est le sélecteur de pays pour catégories/annonces/
  pros/utilisateurs. Le mode maintenance (déjà fonctionnel, ajouté pendant
  la migration MySQL) reste global à tous les sites — état intermédiaire
  sûr, non bloquant. Réévaluable dans un futur "Plan 3".
- `middleware.ts` (convention actuelle du projet — pas de renommage en
  `proxy.ts` nécessaire ; le mode maintenance y accède déjà à Prisma via
  `runtime: 'nodejs'`, réutilisé tel quel) : résolution du site par
  hostname, injection d'un header `x-site-id`, fallback sur le site par
  défaut.
- `lib/site.ts` : `getCurrentSiteId()` / `getCurrentSite()`.
- Scoping `siteId` sur `Category` (`@@unique([siteId, slug])`), `Listing`,
  `Professional`, `User` (`@@unique([siteId, email])`).
- Scoping complet (lecture + écriture) : catégories, authentification
  (inscription/connexion/mot de passe oublié), création d'annonces et de
  fiches pro.
- Migration non-destructive expand-contract, comme la première fois,
  **mais cette fois directement testable via `prisma migrate dev`** : la
  base MySQL n'a pas l'historique de migration cassé qui affectait Neon
  (déjà confirmé pendant la migration MySQL — voir sa spec, section sur la
  base shadow).

### Plan 2 (nouveau — panel admin "Sites & Pays")

- Nouveau `app/admin/layout.tsx` : ce projet n'a actuellement **aucun**
  layout partagé pour `/admin/*` (chaque page est autonome). Un layout
  léger est ajouté, avec une barre d'en-tête contenant :
  - Un lien vers la nouvelle page `/admin/sites` (liste/gestion des pays).
  - Un **sélecteur de site** (menu déroulant des sites actifs), dont la
    sélection est stockée dans un cookie dédié `vem_admin_site` (distinct
    du cookie public de résolution par domaine).
- Nouvelle page `app/admin/sites` : liste des sites (domaine, nom, pays,
  statut actif), création d'un nouveau site (domaine, nom, pays, couleurs),
  édition, activation/désactivation. Suit le patron déjà en place pour
  `app/admin/categories` (page serveur + client component pour les
  interactions).
- **Scoping des vues admin existantes par le site sélectionné** — c'est la
  partie qui rend le sélecteur réellement utile, pas juste décoratif :
  `app/admin/annonces`, `app/admin/professionnels`, `app/admin/categories`,
  `app/admin/utilisateurs` (pages + leurs routes API `POST`/`PUT`/`DELETE`
  associées) filtrent leurs requêtes par le `siteId` lu depuis le cookie
  `vem_admin_site` plutôt que par le site résolu par domaine — c'est la
  seule façon pour un admin sur `1000clic.fr` de gérer les données d'un
  autre pays sans changer d'URL.
- `app/admin/page.tsx` (tableau de bord) et `app/admin/statistiques`
  suivent le même scoping pour que les compteurs affichés correspondent
  au site sélectionné.

### Hors périmètre (explicite, pour cette reprise)

- Pages marketing publiques, pages légales dynamiques par site, thème
  dynamique appliqué au front public, métadonnées Stripe par site — tout
  ça reste un futur "Plan 3", non commencé.
- Scoping en lecture des pages **publiques** (hors admin) par annonces/pros
  (`app/annonces`, `app/professionnels`, sitemap, exports, etc. — la
  quarantaine de fichiers déjà recensée dans le premier essai) : toujours
  hors périmètre. Un deuxième pays réel n'aura donc pas encore de vitrine
  publique fonctionnelle à la fin de cette reprise — seulement une gestion
  admin fonctionnelle. C'est un choix de scope assumé pour livrer quelque
  chose d'utilisable rapidement plutôt que de tout refaire d'un coup.

  **Contrainte de séquencement pour Plan 2 (signalée par la review finale
  de Plan 1) :** ce report est sûr tant qu'un seul site a des données
  publiques (annonces/pros) — situation actuelle. Mais Plan 2 ajoute
  précisément la capacité de créer un deuxième site et d'y attacher des
  données depuis l'admin. **Dès qu'un deuxième site possède ne serait-ce
  qu'une annonce ou une fiche pro, les pages publiques non scopées
  (`app/annonces`, `app/professionnels`, sitemap) commenceront à mélanger
  le contenu des deux sites sur chaque domaine** — une vraie fuite de
  contenu entre pays, pas seulement « pas de vitrine ». Plan 2 doit donc
  soit (a) scoper ces pages publiques en lecture avant d'autoriser la
  création de données publiques sur un deuxième site actif, soit (b)
  documenter et faire respecter explicitement que tout site créé via le
  panel admin reste `active: false` (ou équivalent) tant que ce scoping
  n'est pas fait.
- Admins restreints à un seul site.

## Vérification

Même approche que les chantiers précédents : pas de suite de tests
automatisés, vérification par `npx tsc --noEmit`, tests manuels ciblés, et
un site de démonstration créé pour prouver l'isolation (comme le premier
essai l'avait fait avec succès).
