# Valencia Expat Market — Spec Design

**Date :** 2026-06-08  
**Porteuse du projet :** Christina Dufour  
**Stack :** Next.js 14 (App Router) · TypeScript · Tailwind CSS  
**Déploiement :** GitHub + Vercel

---

## 1. Contexte

Site de petites annonces pour expatriés francophones et internationaux à Valencia (Espagne). Permet de vendre, acheter ou donner des objets en main propre. Pas de paiement entre particuliers sur le site. Contact via WhatsApp ou téléphone, remise en main propre.

Modèle économique : abonnement annuel 20 €/an (paiement Stripe, hors scope prototype) + espaces publicitaires pour entreprises locales.

---

## 2. Scope du prototype

Prototype **100% frontend** avec données mockées et état simulé via React Context + localStorage. Aucun backend, aucune API réelle.

### Pages incluses (6 pages clés)

| Route | Page |
|---|---|
| `/` | Accueil |
| `/annonces` | Liste des annonces |
| `/annonces/[id]` | Détail d'une annonce |
| `/inscription` | Inscription + abonnement |
| `/connexion` | Connexion |
| `/mon-compte` | Tableau de bord utilisateur |
| `/deposer-annonce` | Formulaire de dépôt d'annonce |

Les routes `/mon-compte` et `/deposer-annonce` redirigent vers `/connexion` si l'utilisateur n'est pas connecté.

---

## 3. Architecture

```
valencia-expat-market/
├── app/
│   ├── layout.tsx                  → Layout racine (Navbar + Footer)
│   ├── page.tsx                    → Accueil
│   ├── annonces/
│   │   ├── page.tsx                → Liste des annonces
│   │   └── [id]/page.tsx           → Détail annonce
│   ├── inscription/page.tsx
│   ├── connexion/page.tsx
│   ├── mon-compte/page.tsx
│   └── deposer-annonce/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   └── listings/
│       ├── ListingCard.tsx
│       ├── ListingGrid.tsx
│       └── SearchBar.tsx
├── context/
│   ├── AuthContext.tsx             → Simulation login/logout (localStorage)
│   └── ListingsContext.tsx         → Annonces mockées + ajout via formulaire
├── data/
│   └── listings.ts                 → 20 annonces fictives avec photos Unsplash
└── lib/
    └── categories.ts               → 11 catégories avec icônes et slugs
```

---

## 4. Design system

Fidèle à la maquette du cahier des charges.

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `orange-primary` | `#E8571A` | Boutons, badges, logo, accents |
| `navy` | `#1A1F36` | Footer, textes foncés |
| `bg-soft` | `#FDF5F0` | Sections alternées, fond inscription |
| `whatsapp` | `#25D366` | Bouton contact WhatsApp |
| `white` | `#FFFFFF` | Fond général, cards |

### Typographie

- Police : Inter (Google Fonts)
- Hiérarchie : h1 40px hero · h2 28px sections · body 16px · small 14px

### Composants principaux

- **Navbar** : logo "V" cercle orange + "VALENCIA / EXPAT MARKET", liens nav, bouton "S'inscrire" orange
- **ListingCard** : image top, badge catégorie pill orange, titre, prix gras, ville + heure gris clair, cœur favoris
- **Hero** : texte gauche + image Valencia (City of Arts and Sciences) droite
- **SearchBar** : input mot-clé + select catégorie + select ville + bouton Rechercher orange
- **Bouton WhatsApp** : vert plein, icône, full-width
- **Footer** : fond navy, 4 colonnes (nav, compte, légal, social), icônes FB/IG/WhatsApp

---

## 5. Données mockées

20 annonces couvrant les 11 catégories :
- **Meubles** : Canapé IKEA, Table bois, Bibliothèque
- **Électroménager** : Lave-linge Bosch, Micro-ondes, Aspirateur
- **Enfants/bébés** : Vélo 4-6 ans, Poussette, Lit bébé
- **Voitures/vélos** : Vélo électrique, Trottinette
- **Déco & maison** : Miroir, Lampe design, Plantes
- **Livres** : Romans FR, Guides Valencia
- **Services** : Cours français, Baby-sitting
- **Dons** : Cartons déménagement, Vêtements
- **Autres** : Matériel sport

Quartiers : Ruzafa, Benimaclet, Campanar, Paterna, Alboraya, El Carmen, Eixample.

Photos : Unsplash (license libre, pas de compte requis).

---

## 6. État global (React Context)

### AuthContext

```ts
{
  user: { name: string; email: string } | null,
  login: (email: string, password: string) => void,  // simule auth
  logout: () => void,
  isAuthenticated: boolean
}
```

Persiste dans `localStorage` — survit au refresh. Compte de démo pré-configuré : `demo@valenciaexpat.com` / `demo1234`.

### ListingsContext

```ts
{
  listings: Listing[],
  addListing: (listing: NewListing) => void,  // ajoute à la liste mockée
  getListing: (id: string) => Listing | undefined
}
```

Les annonces ajoutées via le formulaire apparaissent en tête de la liste le temps de la session.

---

## 7. Pages — détail

### Accueil (`/`)
1. Hero : slogan + CTA "Voir les annonces" + "Comment ça marche ?" + photo Valencia
2. Barre de recherche (mot-clé, catégorie, ville)
3. Grille catégories : 8 icônes + "Voir tout"
4. "Annonces à la une" : 4 ListingCards récentes
5. Bandeau publicitaire B2B (fond orange)
6. "Comment ça marche ?" : 4 étapes (icônes + texte)
7. CTA communauté (fond orange foncé) : "Rejoignez la communauté"

### Liste des annonces (`/annonces`)
- SearchBar en haut
- Filtres : catégorie, ville, tri (date, prix ↑↓)
- Grille responsive (3 col desktop, 2 tablette, 1 mobile)
- Pagination simple (mockée)

### Détail annonce (`/annonces/[id]`)
- Breadcrumb
- Galerie photos (image principale + thumbnails)
- Titre, prix, catégorie badge, localisation, date
- Description complète
- Section vendeur : bouton WhatsApp vert + "Voir le numéro"
- Encart sécurité : "Transactions en main propre uniquement"
- Bouton "Signaler l'annonce" (modal)

### Inscription (`/inscription`)
- Formulaire : Nom complet, Email, Mot de passe
- Encart abonnement : 20 €/an avec features checkmark
- Bouton "S'inscrire et payer 20 €" (mockée — redirige vers compte)
- Logos paiement Stripe visuels

### Connexion (`/connexion`)
- Formulaire email + mot de passe
- Lien "Mot de passe oublié" (page non implémentée, juste UI)
- Lien vers inscription

### Mon compte (`/mon-compte`)
- Sidebar : Tableau de bord, Mes annonces, Mon abonnement, Mes informations, Déconnexion
- Section abonnement : statut "Actif", date renouvellement, bouton "Renouveler"
- Liste de ses annonces (depuis ListingsContext, filtrées par user)
- Bouton "Déposer une nouvelle annonce"

### Déposer une annonce (`/deposer-annonce`)
- Champs : Titre, Catégorie (select), Prix, Description (textarea)
- Upload photos (UI seulement, pas de vrai upload — preview avec URL fictive)
- Quartier/ville (select)
- WhatsApp (input tel)
- Bouton "Publier l'annonce" → ajoute via ListingsContext + redirect vers liste

---

## 8. Responsive

- Mobile first
- Navbar : hamburger menu sur mobile
- Cards : 1 colonne mobile, 2 tablette, 3 desktop
- Sidebar mon compte : drawer sur mobile

---

## 9. Ce qui est hors scope (V1 prototype)

- Authentification réelle
- Paiement Stripe réel
- Upload photos réel
- Emails automatiques
- Administration
- Pages légales (CGU, confidentialité, mentions)
- Page "Comment ça marche", Contact, Publicité (nav links présents mais non cliquables)
- SEO avancé (metadata de base seulement)
