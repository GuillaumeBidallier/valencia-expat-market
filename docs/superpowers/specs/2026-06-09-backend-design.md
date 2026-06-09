# Backend Design — Vendo

**Date:** 2026-06-09
**Stack:** Next.js API Routes · Prisma · Neon PostgreSQL · NextAuth.js · Vercel Blob

---

## 1. Architecture

Monolithique Next.js : API routes dans `/app/api/`, Prisma ORM pour la base de données, NextAuth.js pour l'authentification, Vercel Blob pour les images. Tout déployé sur Vercel, base de données hébergée sur Neon (serverless PostgreSQL).

---

## 2. Schéma de base de données (Prisma)

```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         Role      @default(USER)
  createdAt    DateTime  @default(now())
  listings     Listing[]
  favorites    Favorite[]
  sentMessages     Message[] @relation("Sender")
  receivedMessages Message[] @relation("Receiver")
}

enum Role {
  USER
  PRO
  ADMIN
}

model Listing {
  id             String         @id @default(cuid())
  title          String
  description    String
  price          Float?
  categorySlug   String
  city           String
  neighborhood   String
  status         ListingStatus  @default(ACTIVE)
  userId         String
  user           User           @relation(fields: [userId], references: [id])
  images         ListingImage[]
  favorites      Favorite[]
  messages       Message[]
  isPremium      Boolean        @default(false)
  boostExpiresAt DateTime?
  featuredAt     DateTime?
  publishedAt    DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

enum ListingStatus {
  ACTIVE
  SOLD
  EXPIRED
  DELETED
}

model ListingImage {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  order     Int     @default(0)
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, listingId])
}

model Message {
  id         String   @id @default(cuid())
  listingId  String
  listing    Listing  @relation(fields: [listingId], references: [id])
  senderId   String
  sender     User     @relation("Sender", fields: [senderId], references: [id])
  receiverId String
  receiver   User     @relation("Receiver", fields: [receiverId], references: [id])
  body       String
  readAt     DateTime?
  createdAt  DateTime @default(now())
}
```

---

## 3. Authentification (NextAuth.js)

- **Provider :** `CredentialsProvider` (email + mot de passe)
- **Hash :** bcrypt (salt rounds: 12)
- **Session :** JWT stateless (compatible Vercel Edge)
- **Inscription :** `POST /api/auth/register` — validation, hash, création `User`
- **Middleware :** protège `/deposer-annonce`, `/mon-compte`, routes API mutantes
- **Migration future :** Google/Apple OAuth ajoutables sans refactoring grâce à NextAuth

`AuthContext.tsx` devient un wrapper de `useSession()` — les composants existants conservent la même interface (`isAuthenticated`, `user`, `logout`).

---

## 4. API Routes

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/[...nextauth]` | NextAuth (login, session, logout) |

### Annonces
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/listings` | Liste filtrée (cat, ville, q, page, limit) | Non |
| POST | `/api/listings` | Créer une annonce | Oui |
| GET | `/api/listings/[id]` | Détail annonce | Non |
| PUT | `/api/listings/[id]` | Modifier (owner uniquement) | Oui |
| DELETE | `/api/listings/[id]` | Supprimer (owner uniquement) | Oui |
| POST | `/api/listings/[id]/images` | Upload photos → Vercel Blob | Oui |

### Utilisateur
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/user/me` | Profil + mes annonces | Oui |
| PUT | `/api/user/me` | Modifier profil | Oui |

### Favoris
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/favorites/[id]` | Ajouter un favori | Oui |
| DELETE | `/api/favorites/[id]` | Retirer un favori | Oui |

### Messages
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/messages` | Envoyer un message | Oui |
| GET | `/api/messages/[listingId]` | Conversation | Oui |

### Admin (préparées, implémentées en phase 2)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/PUT | `/api/admin/listings` | Modération annonces |
| GET | `/api/admin/users` | Gestion utilisateurs |

---

## 5. Upload photos (Vercel Blob)

1. Frontend envoie jusqu'à 5 fichiers en `multipart/form-data`
2. API route valide : max 5MB, formats JPG/PNG/WebP uniquement
3. Upload vers Vercel Blob → URL CDN publique
4. URL + order sauvegardés dans `ListingImage`
5. Suppression : delete sur Vercel Blob + suppression en base

---

## 6. Monétisation (schéma prêt, Stripe phase suivante)

| Option | Équivalent LeBonCoin | Champ Prisma |
|--------|---------------------|--------------|
| Annonce à la une homepage | "À la une" | `Listing.featuredAt` |
| Remontée dans les résultats | "Booster" | `Listing.boostExpiresAt` |
| Compte professionnel | Compte Pro | `User.role = PRO` |

Aucun code Stripe dans cette phase. Les champs sont présents dans le schéma pour éviter une migration future.

---

## 7. Variables d'environnement requises

```env
DATABASE_URL=          # Neon connection string
NEXTAUTH_SECRET=       # Secret JWT (openssl rand -base64 32)
NEXTAUTH_URL=          # URL de déploiement
BLOB_READ_WRITE_TOKEN= # Vercel Blob token
```

---

## 8. Ordre d'implémentation recommandé

1. Setup Prisma + Neon (schéma + migration)
2. NextAuth.js (register + login)
3. Remplacer AuthContext par useSession
4. API listings CRUD
5. Upload images Vercel Blob
6. Favoris
7. Messages
8. Admin (phase 2)
