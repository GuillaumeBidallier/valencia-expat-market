# Guide Administrateur — Vendo

> **Plateforme :** Vendo — Valencia Expat Market  
> **Accès réservé :** Compte avec rôle `ADMIN` uniquement

---

## Sommaire

1. [Accès et connexion](#1-accès-et-connexion)
2. [Navigation admin](#2-navigation-admin)
3. [Gestion des Professionnels](#3-gestion-des-professionnels)
4. [Niveaux de service (Tiers)](#4-niveaux-de-service-tiers)
5. [API Admin](#5-api-admin)
6. [Sécurité](#6-sécurité)

---

## 1. Accès et connexion

### Identifiants du compte admin

| Champ | Valeur |
|---|---|
| **Email** | `admin@vendo.es` |
| **Mot de passe** | `Vendo@Admin2026!` |
| **Rôle** | `ADMIN` |

> ⚠️ Changer le mot de passe dès la première connexion en production.

### Procédure de connexion

1. Aller sur `/connexion`
2. Saisir `admin@vendo.es` et le mot de passe
3. Une fois connecté, l'icône **bouclier** (🛡) apparaît dans la barre de navigation
4. Cliquer dessus pour accéder au panneau d'administration

---

## 2. Navigation admin

Après connexion en tant qu'admin, deux points d'accès s'affichent :

### Desktop
Icône bouclier dans la barre de navigation, à gauche de l'avatar utilisateur.

### Mobile
Lien **"Admin"** en bleu dans le menu hamburger, sous "Mon compte".

### Pages disponibles

| URL | Description |
|---|---|
| `/admin/professionnels` | Gestion complète des fiches professionnels |

---

## 3. Gestion des Professionnels

Accessible via `/admin/professionnels`.

### Vue d'ensemble

Le tableau liste tous les professionnels avec les colonnes suivantes :

| Colonne | Description |
|---|---|
| Nom | Raison sociale du professionnel |
| Catégorie | Secteur d'activité (immobilier, juridique, etc.) |
| Ville | Ville d'exercice |
| Tier | Niveau d'abonnement (Gratuit / Premium / Premium+) |
| Status | Badges Vérifié et/ou Featured |
| Actions | Modifier ✏️ / Supprimer 🗑️ |

---

### 3.1 Créer un professionnel

Cliquer sur le bouton **"+ Ajouter"** en haut à droite.

Le formulaire contient les champs suivants :

| Champ | Obligatoire | Description |
|---|---|---|
| **Nom** | ✅ | Raison sociale ou nom complet |
| **Slug** | ✅ | Identifiant URL unique (ex: `cabinet-martin-immo`) — doit être en minuscules, sans espaces |
| **Catégorie** | ✅ | Secteur parmi les 10 disponibles |
| **Ville** | ✅ | Ville principale d'exercice |
| **Téléphone** | — | Numéro fixe ou mobile |
| **WhatsApp** | — | Numéro WhatsApp (affiche badge vert sur la fiche) |
| **Site web** | — | URL complète (ex: `https://cabinet-martin.es`) |
| **Logo** | — | URL d'une image (hébergée sur un CDN ou Cloudinary) |
| **Description** | — | Texte de présentation (affiché sur la carte et la fiche détail) |
| **Photos** | — | URLs d'images, une par ligne (galerie sur la fiche détail) |
| **Tier** | ✅ | Niveau d'abonnement (voir section 4) |
| **Vérifié** | — | Badge bleu "Vérifié" sur la fiche (réservé aux pros ayant fourni des justificatifs) |
| **Featured** | — | Met le professionnel en avant dans le classement |

Cliquer sur **"Enregistrer"** pour valider.

---

### 3.2 Modifier un professionnel

Cliquer sur l'icône ✏️ sur la ligne du professionnel.

Le formulaire se pré-remplit avec les données existantes. Modifier les champs souhaités puis cliquer sur **"Enregistrer"**.

---

### 3.3 Supprimer un professionnel

Cliquer sur l'icône 🗑️ sur la ligne du professionnel.

Une confirmation est demandée avant suppression définitive. La suppression est **irréversible**.

---

### 3.4 Règles de slug

Le slug est l'identifiant unique utilisé dans l'URL de la fiche détail :

```
/professionnels/{slug}
```

**Règles :**
- Minuscules uniquement
- Pas d'espaces (utiliser des tirets `-`)
- Pas d'accents ni caractères spéciaux
- Doit être unique dans toute la base

**Exemples valides :**
```
cabinet-martin-immo
garcia-asociados-juridique
expat-moves-demenagement
```

---

## 4. Niveaux de service (Tiers)

Trois niveaux d'abonnement sont disponibles :

### FREE — Gratuit

- Fiche visible sur `/professionnels`
- Pas de mise en avant publicitaire
- Pas d'apparition dans les encarts publicitaires du site

### PREMIUM — 50 €/an (estimé)

- Tout ce qui est inclus dans FREE
- Apparaît dans les encarts publicitaires (bannières, colonnes latérales)
- Classé au-dessus des profils FREE dans les résultats

### PREMIUM_PLUS — 100 €/an (estimé)

- Tout ce qui est inclus dans PREMIUM
- Apparaît dans le **bloc d'accueil** sur la homepage (`ProsBanner`)
- Priorité maximale dans tous les encarts publicitaires
- Badge étoile ⭐ sur la fiche
- Ciblage publicitaire par catégorie (ex: un pro immobilier s'affiche en priorité sur les annonces de la catégorie immobilier)

### Impact sur l'affichage publicitaire

Les encarts ads (`AdUnit`) suivent cette logique :

```
1. Pros PREMIUM_PLUS de la même catégorie que la page
2. Pros PREMIUM de la même catégorie
3. Autres pros PREMIUM_PLUS (toutes catégories)
4. Google AdSense (si configuré)
5. Maquettes statiques (mode démo)
```

---

## 5. API Admin

Les routes API sont protégées par vérification du rôle `ADMIN` côté serveur.

### Professionnels

| Méthode | Route | Action |
|---|---|---|
| `GET` | `/api/professionnels` | Lister les pros (public, avec filtres) |
| `GET` | `/api/professionnels/[slug]` | Fiche détail d'un pro (public) |
| `POST` | `/api/admin/professionnels` | Créer un professionnel |
| `PUT` | `/api/admin/professionnels/[id]` | Modifier un professionnel |
| `DELETE` | `/api/admin/professionnels/[id]` | Supprimer un professionnel |

Toutes les routes `POST/PUT/DELETE` sur `/api/admin/*` retournent `403` si l'utilisateur connecté n'est pas `ADMIN`.

---

## 6. Sécurité

### Protection des routes

- La page `/admin/professionnels` vérifie le rôle côté serveur via `auth()` — une redirection vers `/` est déclenchée si le rôle n'est pas `ADMIN`
- Les routes `/api/admin/*` vérifient la session NextAuth à chaque requête
- Le lien admin dans la navbar n'est visible que pour les utilisateurs avec `role === 'ADMIN'` (vérification côté client en plus)

### Bonnes pratiques

- Ne pas partager le compte admin — créer un compte dédié par administrateur si nécessaire
- Changer le mot de passe régulièrement
- Ne jamais promouvoir un utilisateur en `ADMIN` sans vérification d'identité préalable
- Toute suppression de professionnel est définitive — pas de corbeille

### Promouvoir un utilisateur en ADMIN (via base de données)

Si tu dois créer un deuxième compte admin, exécuter cette requête via Prisma :

```ts
await prisma.user.update({
  where: { email: 'nouveau-admin@email.com' },
  data: { role: 'ADMIN' },
})
```

Ou directement en SQL via Neon Console :

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'nouveau-admin@email.com';
```

---

*Document maintenu par Guillaume Bidallier — NovaTeck Studio*  
*Dernière mise à jour : juin 2026*
