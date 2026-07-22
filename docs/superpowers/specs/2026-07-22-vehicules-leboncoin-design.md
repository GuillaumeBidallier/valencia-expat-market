# Refonte de la catégorie Véhicules à l'identique de leboncoin — Design

## Context

La catégorie `vehicules` actuelle (`prisma/seed-categories.ts`) a une arborescence à 3 niveaux inventée pour ce projet (ex. Voitures → Berlines & Citadines / SUV & 4x4 / Cabriolets & Coupés…, Motos & Scooters → Motos/Scooters/Quads, Caravaning → Camping-cars/Caravanes/Vans, Pièces & Équipements auto → Pièces détachées/Jantes & Pneus/Accessoires). Aucune de ces sous-catégories n'existe sur le vrai leboncoin, et l'app n'a aucun champ pour capturer les attributs spécifiques véhicule (marque, modèle, année, kilométrage, carburant, boîte de vitesses…) — `Listing` n'a que `price`, `categorySlug`, `city`, etc.

Objectif : faire correspondre exactement à leboncoin (1) l'arborescence des sous-catégories véhicules et (2) les attributs de dépôt/recherche d'annonce pour chaque sous-catégorie.

La structure réelle a été extraite du fichier de constantes de l'app mobile leboncoin (`categoryFields.offer`, `CATEGORIES`), obtenu publiquement via le dépôt GitHub `thomasync/leboncoin-api-search` (`src/constants.ts`).

Vérification en base (production) : seuls 4 annonces utilisent le slug racine `vehicules`, aucune n'utilise un des sous-slugs actuels. **Aucune migration de données n'est nécessaire.**

## 1. Arborescence des sous-catégories (aplatie, 9 enfants directs de `vehicules`)

| slug | label | icon |
|---|---|---|
| `voitures` | Voitures | 🚗 |
| `motos` | Motos | 🏍️ |
| `caravaning` | Caravaning | 🚐 |
| `utilitaires` | Utilitaires | 🚚 |
| `nautisme` | Nautisme | ⛵ |
| `equipement_auto` | Équipement auto | 🔧 |
| `equipement_moto` | Équipement moto | 🪖 |
| `equipement_caravaning` | Équipement caravaning | 🧳 |
| `equipement_nautisme` | Équipement nautisme | 🦺 |

Toutes ces catégories sont des feuilles (`children: []`) — pas de 3ᵉ niveau, exactement comme sur leboncoin (le détail "berline/SUV/break" devient un **attribut** de l'annonce, pas une sous-catégorie).

`prisma/seed-categories.ts` : remplacer entièrement le bloc `// ── 1. Véhicules ──` par cette liste plate, avec traductions (en/es/de/nl/uk/ru) suivant le même pattern `T` que le reste du fichier. `voitures` et `utilitaires` gardent leur slug actuel (aucun changement pour ces deux). `motos-scooters`, `caravaning` (les enfants), `nautisme` (les enfants) et `pieces-auto` (et ses enfants) disparaissent au profit des 9 slugs ci-dessus. Après modification, relancer `npx prisma db seed` (ou le script direct) pour appliquer.

## 2. Stockage des attributs — `Listing.attributes Json?`

Ajout d'une seule colonne JSON nullable sur `Listing`, plutôt que des colonnes dédiées par attribut : les attributs varient totalement d'une sous-catégorie à l'autre (une Voiture a 12 attributs, un Équipement auto n'en a aucun), et une colonne JSON évite d'ajouter ~15 colonnes nullables qui ne concernent que les véhicules. Réutilisable si d'autres catégories reçoivent des attributs plus tard.

```prisma
model Listing {
  // ...existant...
  attributes Json?
}
```

Migration additive (`prisma migrate dev`), aucun backfill nécessaire.

## 3. Schéma des attributs par sous-catégorie (config statique, pas éditable en admin)

Nouveau fichier `lib/vehicleAttributes.ts` : une table de définitions, indexée par `categorySlug`, décrivant pour chaque sous-catégorie véhicule la liste de champs à afficher (dépôt d'annonce) et à filtrer (recherche). Chaque champ a un type parmi : `brand-model` (cascade marque→modèle), `select` (énumération simple), `range` (min/max numérique), `number` (valeur unique). Repris fidèlement de `categoryFields.offer` de leboncoin :

- **`voitures`** : marque+modèle (`brand-model`), année (`regdate`, number à la saisie / range en filtre), type de véhicule (`select` : 4x4/Suv, Berline, Break, Cabriolet, Citadine, Coupé, Minibus, Monospace, Pick-up, Voiture société, Autre), carburant (`select` : Essence, Diesel, Hybride, Electrique, GPL, Autre), boîte de vitesses (`select` : Manuelle, Automatique), kilométrage (`number`/`range`), crit'air (`select` 0–5), puissance DIN (`number`/`range`, ch), puissance fiscale (`number`/`range`, cv), portes (`select` 2/3/4/5/6+), places (`select` 1–7+), couleur (`select`, liste complète des couleurs leboncoin)
- **`motos`** : marque+modèle (`brand-model`), cylindrée (`number`), année, type (`select` : Moto, Scooter, Quad, Autre), kilométrage, couleur, permis (`select` : Permis A, Permis AL, Sans permis), crit'air
- **`utilitaires`** : marque+modèle, année, carburant, kilométrage, puissance DIN/fiscale, portes, places, couleur, boîte de vitesses, crit'air
- **`caravaning`** : année, kilométrage (uniquement — leboncoin ne demande rien de plus ici)
- **`nautisme`** : type de bateau (`select` : Barques, Bateaux à moteur, Jets skis/scooters, Pneumatiques/semi-rigides, Voiliers monocoques, Voiliers multicoques, Yachts, Autre)
- **`equipement_auto` / `equipement_moto` / `equipement_caravaning` / `equipement_nautisme`** : aucun attribut supplémentaire (comme sur leboncoin — juste le prix)

Toutes les valeurs d'énumération (labels + values) sont reprises telles quelles depuis les constantes leboncoin extraites.

## 4. Données marques/modèles — génération, pas saisie manuelle

Réplication complète demandée : 214 marques / 5 655 modèles (voitures), 162 marques / 1 765 modèles (motos), 61 marques / 584 modèles (utilitaires) — 8 004 modèles au total.

Un script ponctuel (non committé, exécuté une fois) parse le fichier `constants.ts` leboncoin déjà téléchargé et génère trois fichiers de données statiques committés :
- `lib/vehicleData/carBrands.json` — `{ brand: string, models: string[] }[]`
- `lib/vehicleData/motoBrands.json`
- `lib/vehicleData/utilityBrands.json`

Ces fichiers alimentent un nouveau composant `components/ui/BrandModelPicker.tsx` : sélection de la marque (liste complète, avec les 10 « marques courantes » de leboncoin en tête de liste comme sur le site réel), puis sélection du modèle filtrée sur la marque choisie (texte libre si la marque n'a aucun modèle listé, ex. marques très rares).

## 5. Formulaires de dépôt/édition d'annonce

`app/deposer-annonce/page.tsx` et `app/annonces/[id]/modifier/EditListingClient.tsx` : après la sélection de catégorie via `CategoryPicker` (déjà existant, aucun changement requis — il gère déjà 1 à 3 niveaux et n'affichera simplement pas de 3ᵉ niveau puisque les nouvelles feuilles n'ont pas d'enfants), si `categorySlug` correspond à une sous-catégorie véhicule, afficher un nouveau composant `components/listings/VehicleAttributesFields.tsx` qui lit la config de `lib/vehicleAttributes.ts` pour ce slug et rend les champs correspondants, stockés dans un state `attributes: Record<string, string | number>`.

`types/index.ts` : `NewListing` gagne un champ `attributes?: Record<string, unknown>`.

`app/api/listings/route.ts` : `createSchema` gagne `attributes: z.record(z.unknown()).optional()`, transmis tel quel à `prisma.listing.create()`. Idem pour la route PATCH d'édition d'annonce.

## 6. Filtres de recherche (`/annonces`)

Parité complète demandée. `app/annonces/AnnoncesFilters.tsx` : quand la catégorie sélectionnée (`cat`) est une sous-catégorie véhicule, afficher sous le sélecteur de catégorie les mêmes champs que `VehicleAttributesFields` mais en mode filtre (range min/max pour année/kilométrage/puissance, cases à cocher multi-select pour les énumérations, marque en select simple — le modèle en second select dépendant de la marque choisie).

`app/annonces/page.tsx` : construction du `where` Prisma à partir des query params `attr_<nom>` (ex. `attr_fuel=diesel`, `attr_regdate_min=2018&attr_regdate_max=2022`). Filtrage sur colonne JSON MySQL via Prisma :
```ts
attributes: { path: '$.fuel', equals: 'diesel' }          // égalité
attributes: { path: '$.regdate', gte: 2018, lte: 2022 }   // range — deux clauses AND
```
Note d'implémentation : à vérifier pendant l'exécution du plan que la version de Prisma installée (6.19.3) supporte bien `gte`/`lte` sur JSON path pour le provider MySQL ; sinon fallback en `$queryRaw` avec `JSON_EXTRACT`.

## 7. Affichage sur la fiche annonce

`app/annonces/[id]/ListingDetailClient.tsx` : ligne de résumé sous le titre reprenant les attributs renseignés dans l'ordre leboncoin (ex. « 2019 · 45 000 km · Diesel · Manuelle · Crit'air 1 »), générée depuis la même config `lib/vehicleAttributes.ts` (mapping value→label pour les enums).

## 8. Traductions

Les 9 nouvelles/renommées catégories reçoivent leurs traductions en/es/de/nl/uk/ru dans `seed-categories.ts`, suivant le pattern `T` existant. Les labels des attributs et leurs valeurs (carburant, boîte, couleur, etc.) restent en français uniquement dans `lib/vehicleAttributes.ts` — cohérent avec le reste de l'UI qui est en français (les traductions `T` ne couvrent que les noms de catégories, pas les filtres).

## Out of scope

- Éditabilité des attributs véhicule depuis l'admin (`/admin/categories`) — la config reste dans le code, pas en base.
- Le paiement sécurisé P2P (`vehicle_is_eligible_p2p`) et les catégories partenaires externes (`Camions` → renvoie vers truckscorner.fr sur le vrai leboncoin, `Vélos` → en réalité rattachée à Loisirs, pas Véhicules) : non répliqués, hors sujet pour ce site.
- Attributs spécifiques pour d'autres catégories (Immobilier, Multimédia, etc.) — uniquement Véhicules dans ce chantier.
