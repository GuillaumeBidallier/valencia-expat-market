# Devis — Vendo · Plateforme Expatriés Espagne

**Client :** Christina Dufour  
**Projet :** Vendo — Plateforme petites annonces + annuaire professionnel pour expatriés francophones en Espagne  
**Date :** 9 juin 2026  
**Version :** 2.0

---

## Résumé

| Module | Statut | Prix |
|---|---|---|
| 1. Plateforme annonces (MVP complet) | ✅ Livré | 600 € |
| 2. Backend temps réel + messagerie | ✅ Livré | 300 € |
| 3. Compte utilisateur + favoris + notifications | ✅ Livré | 200 € |
| 4. Recherche avancée + localisation | ✅ Livré | 200 € |
| **5. Professionnels recommandés** | 🔜 À faire | **200 €** |
| **Total** | | **1 500 €** |

---

## Module 1 — Plateforme annonces MVP ✅

**600 €** — Livré

- Design complet (navbar, footer, logo Vendo)
- Page d'accueil avec hero + catégories
- Liste des annonces (`/annonces`) avec filtres
- Détail d'une annonce (`/annonces/[id]`) avec galerie photos
- Formulaire dépôt d'annonce (`/deposer-annonce`)
- Inscription / Connexion (email + mot de passe, NextAuth v5)
- Sélecteur de langue (FR / EN / ES / DE / NL)
- Responsive mobile/desktop complet
- Déploiement Vercel + base Neon PostgreSQL

---

## Module 2 — Backend temps réel + messagerie ✅

**300 €** — Livré

- Messagerie entre acheteur et vendeur en temps réel (Pusher WebSockets)
- Interface messages desktop + mobile (thread par annonce)
- Indicateurs de frappe ("... est en train d'écrire")
- Accusés de lecture (Envoyé / Lu)
- Notifications email à la réception d'un message (Resend)
- Anti-spam : un seul email par conversation inactive
- Upload photos annonces (Vercel Blob, max 5 photos, 5 Mo)

---

## Module 3 — Compte utilisateur + favoris + édition ✅

**200 €** — Livré

- Page "Mon compte" pro : sidebar desktop + UI mobile dédiée
- Statistiques : annonces actives, favoris, messages non lus
- Gestion annonces : voir, modifier, marquer vendu, remettre en ligne, supprimer
- Suppression avec confirmation inline (sans modal)
- Page édition annonce (`/annonces/[id]/modifier`) : champs + photos (ajouter/supprimer/restaurer)
- Système favoris (cœur sur cards + détail, optimistic UI)
- Bouton "Modifier" dans Mon compte (desktop + mobile)

---

## Module 4 — Recherche avancée + localisation ✅

**200 €** — Livré

- Refactoring `/annonces` en Server Component (Prisma direct, scalable)
- Filtres dans l'URL : catégorie, quartier, prix min/max, tri, page
- Pagination (20 annonces/page, numérotation)
- Filtre "Ma position" : géolocalisation navigateur + rayon (5/10/20/50 km)
- Distance Haversine sur chaque résultat quand position active
- Tri "Plus proches" disponible avec position activée
- Carte Leaflet sur le détail d'annonce (localisation approximative du quartier)
- Auto-geocoding : coordonnées GPS enregistrées automatiquement à la création/édition
- Backfill automatique des annonces existantes

---

## Module 5 — Professionnels recommandés 🔜

**200 €** — À développer

### Ce qui est inclus

#### Modèle de données
- Nouveau modèle `Professional` en base : nom, catégorie, ville, description, téléphone, WhatsApp, site web, logo, photos, tier (GRATUIT / PREMIUM / PREMIUM_PLUS), badge recommandé
- Panel admin pour valider et gérer les fiches

#### Pages
- `/professionnels` — Annuaire général avec filtres (catégorie, ville)
- `/professionnels/[slug]` — Fiche détaillée d'un professionnel
- Navigation ajoutée dans la navbar

#### Tiers et fonctionnalités

| | Gratuit | Premium (50 €/an) | Premium+ (100 €/an) |
|---|---|---|---|
| Nom + ville | ✅ | ✅ | ✅ |
| Logo | — | ✅ | ✅ |
| Description | — | ✅ | ✅ |
| Téléphone | — | ✅ | ✅ |
| WhatsApp direct | — | ✅ | ✅ |
| Site internet | — | ✅ | ✅ |
| Photos (galerie) | — | ✅ (3) | ✅ (8) |
| Position dans catégorie | Bas | Milieu | **En tête** |
| Badge ⭐ Recommandé | — | — | ✅ |
| Mise en avant page d'accueil | — | — | ✅ |

#### Bloc homepage
Section "⭐ Professionnels recommandés" sur la page d'accueil :
- 3 à 6 fiches Premium+ en carousel
- Catégories : Immobilier, Juridique, Déménagement, Comptabilité, Santé, Assurance…
- Lien "Voir tous les professionnels →"

#### Catégories initiales
Immobilier · Juridique & Notariat · Comptabilité & Fiscal · Déménagement · Assurance · Santé · Automobiles · Services à domicile · Éducation · Autres

#### Phase 2 (hors scope, tarif séparé)
- Bannières publicitaires par catégorie/ville
- Publicité ciblée géographiquement

---

## Conditions

- Acompte 50 % à la commande, solde à la livraison
- Délai module 5 : **5 jours ouvrés**
- Maintenance et corrections incluses 30 jours après livraison
- Hébergement et services tiers (Vercel, Neon, Resend, Pusher) à la charge du client

---

*Devis établi par Guillaume Bidallier — [bidallierguillaume@gmail.com](mailto:bidallierguillaume@gmail.com)*
