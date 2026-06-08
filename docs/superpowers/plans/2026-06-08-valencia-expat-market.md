# Valencia Expat Market Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prototype frontend Next.js 14 + TypeScript + Tailwind CSS fidèle à la maquette PDF, déployé sur GitHub + Vercel.

**Architecture:** App Router Next.js, React Context pour auth et listings simulés (localStorage), données 100% mockées, aucun backend.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Lucide React (icônes), next/font (Inter), next/image

---

## File Map

| Fichier | Rôle |
|---|---|
| `tailwind.config.ts` | Couleurs custom (orange, navy, whatsapp) |
| `types/index.ts` | Types Listing, User, Category |
| `data/listings.ts` | 20 annonces mockées |
| `lib/categories.ts` | 11 catégories avec icônes et slugs |
| `context/AuthContext.tsx` | Simulation login/logout + localStorage |
| `context/ListingsContext.tsx` | Listings state + addListing |
| `components/ui/Button.tsx` | Bouton réutilisable (variants) |
| `components/ui/Badge.tsx` | Badge catégorie pill orange |
| `components/ui/Input.tsx` | Input stylisé |
| `components/layout/Navbar.tsx` | Navigation + hamburger mobile |
| `components/layout/Footer.tsx` | Footer 4 colonnes fond navy |
| `components/listings/ListingCard.tsx` | Card annonce |
| `components/listings/ListingGrid.tsx` | Grille responsive |
| `components/listings/SearchBar.tsx` | Barre recherche + filtres |
| `components/listings/CategoryGrid.tsx` | Grille 8 catégories icônes |
| `app/layout.tsx` | Layout racine |
| `app/globals.css` | Reset + font |
| `app/page.tsx` | Page accueil |
| `app/annonces/page.tsx` | Liste annonces |
| `app/annonces/[id]/page.tsx` | Détail annonce |
| `app/inscription/page.tsx` | Inscription |
| `app/connexion/page.tsx` | Connexion |
| `app/mon-compte/page.tsx` | Dashboard utilisateur |
| `app/deposer-annonce/page.tsx` | Formulaire dépôt |

---

## Task 1: Bootstrap du projet

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Scaffolder le projet Next.js**

```bash
cd /Users/bidallierguillaume/IdeaProjects/valencia-expat-market
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git
```
Répondre `Yes` aux prompts si demandé. Le `--no-git` évite de réinitialiser le repo existant.

- [ ] **Step 2: Installer les dépendances**

```bash
npm install lucide-react
```

- [ ] **Step 3: Configurer les couleurs Tailwind**

Remplacer le contenu de `tailwind.config.ts` :

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#E8571A',
          dark: '#C4471A',
          soft: '#FDF5F0',
        },
        navy: '#1A1F36',
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Mettre à jour globals.css**

```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: #1A1F36;
}
```

- [ ] **Step 5: Créer le layout racine**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ListingsProvider } from '@/context/ListingsContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Valencia Expat Market — Petites annonces entre expatriés',
  description: 'Achetez, vendez et donnez une seconde vie à vos affaires entre expatriés à Valencia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <ListingsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ListingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Vérifier que le projet démarre**

```bash
npm run dev
```
Attendu : serveur sur http://localhost:3000 sans erreur.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js project with Tailwind custom theme"
```

---

## Task 2: Types et données mockées

**Files:**
- Create: `types/index.ts`, `data/listings.ts`, `lib/categories.ts`

- [ ] **Step 1: Créer les types**

```ts
// types/index.ts
export interface Listing {
  id: string
  title: string
  category: string
  categorySlug: string
  price: number | null
  description: string
  images: string[]
  neighborhood: string
  city: string
  whatsapp: string
  phone: string
  publishedAt: string
  status: 'active' | 'sold' | 'expired'
  userId: string
  userName: string
}

export interface NewListing {
  title: string
  category: string
  categorySlug: string
  price: number | null
  description: string
  neighborhood: string
  whatsapp: string
}

export interface User {
  id: string
  name: string
  email: string
  subscriptionStatus: 'active' | 'expired'
  subscriptionRenewal: string
}

export interface Category {
  label: string
  slug: string
  icon: string
}
```

- [ ] **Step 2: Créer les catégories**

```ts
// lib/categories.ts
import { Category } from '@/types'

export const categories: Category[] = [
  { label: 'Meubles', slug: 'meubles', icon: '🛋️' },
  { label: 'Électroménager', slug: 'electromenager', icon: '🫙' },
  { label: 'Enfants / bébés', slug: 'enfants', icon: '🚲' },
  { label: 'Voitures / vélos', slug: 'vehicules', icon: '🚗' },
  { label: 'Déco & maison', slug: 'deco', icon: '🏠' },
  { label: 'Livres', slug: 'livres', icon: '📚' },
  { label: 'Mode', slug: 'mode', icon: '👗' },
  { label: 'Animaux', slug: 'animaux', icon: '🐾' },
  { label: 'Services', slug: 'services', icon: '🤝' },
  { label: 'Dons', slug: 'dons', icon: '🎁' },
  { label: 'Autres', slug: 'autres', icon: '📦' },
]

export const neighborhoods = [
  'Valencia', 'Ruzafa', 'Benimaclet', 'Campanar',
  'Paterna', 'Alboraya', 'El Carmen', 'Eixample', 'La Malva-rosa',
]
```

- [ ] **Step 3: Créer les 20 annonces mockées**

```ts
// data/listings.ts
import { Listing } from '@/types'

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Canapé 3 places IKEA Kivik',
    category: 'Meubles',
    categorySlug: 'meubles',
    price: 150,
    description: 'Canapé 3 places IKEA Kivik en très bon état. Housse lavable gris clair. À venir chercher à Ruzafa. Vendu car déménagement.',
    images: [
      'https://picsum.photos/seed/sofa1/800/600',
      'https://picsum.photos/seed/sofa2/800/600',
      'https://picsum.photos/seed/sofa3/800/600',
    ],
    neighborhood: 'Ruzafa',
    city: 'Valencia',
    whatsapp: '+34612345678',
    phone: '+34612345678',
    publishedAt: '2026-06-07T10:00:00Z',
    status: 'active',
    userId: 'demo',
    userName: 'Marie L.',
  },
  {
    id: '2',
    title: 'Vélo enfant 4-6 ans',
    category: 'Enfants / bébés',
    categorySlug: 'enfants',
    price: 40,
    description: 'Vélo rouge pour enfant 4-6 ans avec stabilisateurs. Très bon état, petite rayure sur le garde-boue. Casque inclus.',
    images: [
      'https://picsum.photos/seed/bike1/800/600',
      'https://picsum.photos/seed/bike2/800/600',
    ],
    neighborhood: 'Benimaclet',
    city: 'Valencia',
    whatsapp: '+34623456789',
    phone: '+34623456789',
    publishedAt: '2026-06-07T09:30:00Z',
    status: 'active',
    userId: 'user2',
    userName: 'Sophie M.',
  },
  {
    id: '3',
    title: 'Lave-linge Bosch 7kg',
    category: 'Électroménager',
    categorySlug: 'electromenager',
    price: 200,
    description: 'Lave-linge Bosch Serie 4 7kg, 3 ans d\'utilisation, parfait état de fonctionnement. Départ uniquement, ne peut pas être livré.',
    images: [
      'https://picsum.photos/seed/washer1/800/600',
    ],
    neighborhood: 'Alboraya',
    city: 'Valencia',
    whatsapp: '+34634567890',
    phone: '+34634567890',
    publishedAt: '2026-06-06T16:00:00Z',
    status: 'active',
    userId: 'user3',
    userName: 'Pierre D.',
  },
  {
    id: '4',
    title: 'Table à manger en bois massif 6 personnes',
    category: 'Meubles',
    categorySlug: 'meubles',
    price: 130,
    description: 'Belle table en chêne massif, 180x90 cm, 6 personnes. Quelques marques d\'usage sur le plateau. Chaises non incluses.',
    images: [
      'https://picsum.photos/seed/table1/800/600',
      'https://picsum.photos/seed/table2/800/600',
    ],
    neighborhood: 'Campanar',
    city: 'Valencia',
    whatsapp: '+34645678901',
    phone: '+34645678901',
    publishedAt: '2026-06-06T14:00:00Z',
    status: 'active',
    userId: 'user4',
    userName: 'Claire R.',
  },
  {
    id: '5',
    title: 'Poussette Bugaboo Cameleon',
    category: 'Enfants / bébés',
    categorySlug: 'enfants',
    price: 180,
    description: 'Poussette Bugaboo Cameleon complète avec nacelle et siège. Couleur gris anthracite. Très bon état, peu utilisée.',
    images: [
      'https://picsum.photos/seed/stroller1/800/600',
    ],
    neighborhood: 'El Carmen',
    city: 'Valencia',
    whatsapp: '+34656789012',
    phone: '+34656789012',
    publishedAt: '2026-06-05T11:00:00Z',
    status: 'active',
    userId: 'user5',
    userName: 'Julie B.',
  },
  {
    id: '6',
    title: 'Vélo électrique Decathlon',
    category: 'Voitures / vélos',
    categorySlug: 'vehicules',
    price: 650,
    description: 'Vélo électrique Decathlon b\'twin, batterie 500Wh, autonomie ~80km. 2 ans, excellent état. Vendu car retour en France.',
    images: [
      'https://picsum.photos/seed/ebike1/800/600',
      'https://picsum.photos/seed/ebike2/800/600',
    ],
    neighborhood: 'Ruzafa',
    city: 'Valencia',
    whatsapp: '+34667890123',
    phone: '+34667890123',
    publishedAt: '2026-06-05T10:00:00Z',
    status: 'active',
    userId: 'user6',
    userName: 'Thomas G.',
  },
  {
    id: '7',
    title: 'Bibliothèque Billy IKEA blanche',
    category: 'Meubles',
    categorySlug: 'meubles',
    price: 30,
    description: 'Bibliothèque Billy IKEA blanche, 80x202cm, très bon état. À démonter sur place. Disponible week-end.',
    images: [
      'https://picsum.photos/seed/bookcase1/800/600',
    ],
    neighborhood: 'Paterna',
    city: 'Valencia',
    whatsapp: '+34678901234',
    phone: '+34678901234',
    publishedAt: '2026-06-04T15:00:00Z',
    status: 'active',
    userId: 'user7',
    userName: 'Anne-Sophie V.',
  },
  {
    id: '8',
    title: 'Cours de français — prof certifiée',
    category: 'Services',
    categorySlug: 'services',
    price: 25,
    description: 'Professeure de français certifiée propose cours particuliers pour adultes et enfants. Tarif 25€/h. Déplacements possibles à Valencia.',
    images: [
      'https://picsum.photos/seed/tutor1/800/600',
    ],
    neighborhood: 'Eixample',
    city: 'Valencia',
    whatsapp: '+34689012345',
    phone: '+34689012345',
    publishedAt: '2026-06-04T09:00:00Z',
    status: 'active',
    userId: 'user8',
    userName: 'Isabelle C.',
  },
  {
    id: '9',
    title: 'Micro-ondes Samsung 800W',
    category: 'Électroménager',
    categorySlug: 'electromenager',
    price: 35,
    description: 'Micro-ondes Samsung 800W, 20L, couleur blanc. Fonctionne parfaitement. Vendu car on en a reçu un autre en cadeau.',
    images: [
      'https://picsum.photos/seed/micro1/800/600',
    ],
    neighborhood: 'Benimaclet',
    city: 'Valencia',
    whatsapp: '+34690123456',
    phone: '+34690123456',
    publishedAt: '2026-06-03T17:00:00Z',
    status: 'active',
    userId: 'user9',
    userName: 'Lucas F.',
  },
  {
    id: '10',
    title: 'Lot de 15 romans en français',
    category: 'Livres',
    categorySlug: 'livres',
    price: 20,
    description: 'Lot de 15 romans français (Musso, Levy, Grangé...). Très bon état. Idéal pour qui manque de lecture française à Valencia !',
    images: [
      'https://picsum.photos/seed/books1/800/600',
    ],
    neighborhood: 'Ruzafa',
    city: 'Valencia',
    whatsapp: '+34601234567',
    phone: '+34601234567',
    publishedAt: '2026-06-03T14:00:00Z',
    status: 'active',
    userId: 'user10',
    userName: 'Emma P.',
  },
  {
    id: '11',
    title: 'Miroir décoratif doré 80cm',
    category: 'Déco & maison',
    categorySlug: 'deco',
    price: 45,
    description: 'Grand miroir rond avec cadre doré, diamètre 80cm. Parfait état, acheté chez Zara Home. Vendu car déménagement.',
    images: [
      'https://picsum.photos/seed/mirror1/800/600',
    ],
    neighborhood: 'El Carmen',
    city: 'Valencia',
    whatsapp: '+34612222333',
    phone: '+34612222333',
    publishedAt: '2026-06-02T12:00:00Z',
    status: 'active',
    userId: 'user11',
    userName: 'Chloé M.',
  },
  {
    id: '12',
    title: 'Lit bébé + matelas',
    category: 'Enfants / bébés',
    categorySlug: 'enfants',
    price: 60,
    description: 'Lit bébé en bois blanc 60x120 avec matelas inclus. Très bon état, non-fumeurs. Barreau de protection disponible en option.',
    images: [
      'https://picsum.photos/seed/crib1/800/600',
      'https://picsum.photos/seed/crib2/800/600',
    ],
    neighborhood: 'Campanar',
    city: 'Valencia',
    whatsapp: '+34623333444',
    phone: '+34623333444',
    publishedAt: '2026-06-02T10:00:00Z',
    status: 'active',
    userId: 'user12',
    userName: 'Nathalie L.',
  },
  {
    id: '13',
    title: 'Aspirateur Dyson V10',
    category: 'Électroménager',
    categorySlug: 'electromenager',
    price: 180,
    description: 'Aspirateur balai Dyson V10 Absolute, excellent état, toutes les têtes incluses. Batterie tient 60min. Facture disponible.',
    images: [
      'https://picsum.photos/seed/dyson1/800/600',
    ],
    neighborhood: 'Alboraya',
    city: 'Valencia',
    whatsapp: '+34634444555',
    phone: '+34634444555',
    publishedAt: '2026-06-01T16:00:00Z',
    status: 'active',
    userId: 'user13',
    userName: 'François B.',
  },
  {
    id: '14',
    title: 'Trottinette électrique Xiaomi',
    category: 'Voitures / vélos',
    categorySlug: 'vehicules',
    price: 220,
    description: 'Trottinette Xiaomi Mi Electric Scooter 3, autonomie 30km, bon état général. Pneu avant changé il y a 2 mois.',
    images: [
      'https://picsum.photos/seed/scooter1/800/600',
    ],
    neighborhood: 'Ruzafa',
    city: 'Valencia',
    whatsapp: '+34645555666',
    phone: '+34645555666',
    publishedAt: '2026-06-01T11:00:00Z',
    status: 'active',
    userId: 'user14',
    userName: 'Adrien T.',
  },
  {
    id: '15',
    title: 'Cartons de déménagement — DON',
    category: 'Dons',
    categorySlug: 'dons',
    price: null,
    description: 'Une vingtaine de cartons de déménagement solides, différentes tailles. À récupérer rapidement. Gratuit !',
    images: [
      'https://picsum.photos/seed/boxes1/800/600',
    ],
    neighborhood: 'Paterna',
    city: 'Valencia',
    whatsapp: '+34656666777',
    phone: '+34656666777',
    publishedAt: '2026-05-31T09:00:00Z',
    status: 'active',
    userId: 'user15',
    userName: 'Mélanie R.',
  },
  {
    id: '16',
    title: 'Lampe de salon Hay design',
    category: 'Déco & maison',
    categorySlug: 'deco',
    price: 80,
    description: 'Lampe sur pied Hay Nelson Bubble, blanc, hauteur 160cm. Achetée 220€, en parfait état. Ampoule LED incluse.',
    images: [
      'https://picsum.photos/seed/lamp1/800/600',
    ],
    neighborhood: 'El Carmen',
    city: 'Valencia',
    whatsapp: '+34667777888',
    phone: '+34667777888',
    publishedAt: '2026-05-30T15:00:00Z',
    status: 'active',
    userId: 'user16',
    userName: 'Pauline H.',
  },
  {
    id: '17',
    title: 'Baby-sitting francophones — 10 €/h',
    category: 'Services',
    categorySlug: 'services',
    price: 10,
    description: 'Étudiante française propose baby-sitting à domicile. Expérience avec enfants 0-8 ans. Références disponibles. Disponible soirs et week-ends.',
    images: [
      'https://picsum.photos/seed/babysit1/800/600',
    ],
    neighborhood: 'Benimaclet',
    city: 'Valencia',
    whatsapp: '+34678888999',
    phone: '+34678888999',
    publishedAt: '2026-05-30T10:00:00Z',
    status: 'active',
    userId: 'user17',
    userName: 'Laura D.',
  },
  {
    id: '18',
    title: 'Vêtements femme T38 — sac complet',
    category: 'Mode',
    categorySlug: 'mode',
    price: 30,
    description: 'Sac de vêtements femme taille 38 : robes, hauts, pantalons. Marques H&M, Zara, Mango. Bon état général. Prix pour le lot.',
    images: [
      'https://picsum.photos/seed/clothes1/800/600',
    ],
    neighborhood: 'Eixample',
    city: 'Valencia',
    whatsapp: '+34689999000',
    phone: '+34689999000',
    publishedAt: '2026-05-29T14:00:00Z',
    status: 'active',
    userId: 'user18',
    userName: 'Stéphanie V.',
  },
  {
    id: '19',
    title: 'Matériel yoga + tapis',
    category: 'Autres',
    categorySlug: 'autres',
    price: 25,
    description: 'Tapis de yoga Lululemon 5mm + 2 blocs + sangle. Ensemble complet pour débutant. Très bon état.',
    images: [
      'https://picsum.photos/seed/yoga1/800/600',
    ],
    neighborhood: 'Ruzafa',
    city: 'Valencia',
    whatsapp: '+34601111222',
    phone: '+34601111222',
    publishedAt: '2026-05-28T11:00:00Z',
    status: 'active',
    userId: 'user19',
    userName: 'Camille N.',
  },
  {
    id: '20',
    title: 'Chat tigré cherche famille — DON',
    category: 'Animaux',
    categorySlug: 'animaux',
    price: null,
    description: 'Mâle tigré 2 ans, castré, vacciné, pucé. Très affectueux. Cherche famille aimante car retour en France impossible. Adopter, pas acheter.',
    images: [
      'https://picsum.photos/seed/cat1/800/600',
    ],
    neighborhood: 'La Malva-rosa',
    city: 'Valencia',
    whatsapp: '+34612334455',
    phone: '+34612334455',
    publishedAt: '2026-05-27T09:00:00Z',
    status: 'active',
    userId: 'user20',
    userName: 'Véronique L.',
  },
]
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript types, categories and mock listings"
```

---

## Task 3: React Contexts

**Files:**
- Create: `context/AuthContext.tsx`, `context/ListingsContext.tsx`

- [ ] **Step 1: Créer AuthContext**

```tsx
// context/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'

const DEMO_USER: User = {
  id: 'demo',
  name: 'Marie Dupont',
  email: 'demo@valenciaexpat.com',
  subscriptionStatus: 'active',
  subscriptionRenewal: '20 mai 2027',
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vem_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = (email: string, _password: string): boolean => {
    const u = { ...DEMO_USER, email }
    setUser(u)
    localStorage.setItem('vem_user', JSON.stringify(u))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vem_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Créer ListingsContext**

```tsx
// context/ListingsContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Listing, NewListing } from '@/types'
import { mockListings } from '@/data/listings'
import { useAuth } from './AuthContext'

interface ListingsContextType {
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  addListing: (data: NewListing) => string
}

const ListingsContext = createContext<ListingsContextType | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const { user } = useAuth()

  const getListing = (id: string) => listings.find(l => l.id === id)

  const addListing = (data: NewListing): string => {
    const id = `new-${Date.now()}`
    const newListing: Listing = {
      ...data,
      id,
      images: ['https://picsum.photos/seed/new1/800/600'],
      phone: data.whatsapp,
      publishedAt: new Date().toISOString(),
      status: 'active',
      userId: user?.id || 'demo',
      userName: user?.name || 'Utilisateur',
    }
    setListings(prev => [newListing, ...prev])
    return id
  }

  return (
    <ListingsContext.Provider value={{ listings, getListing, addListing }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add AuthContext and ListingsContext with localStorage persistence"
```

---

## Task 4: Composants UI de base

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/Input.tsx`

- [ ] **Step 1: Créer Button**

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'whatsapp' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors cursor-pointer',
        {
          'bg-orange-primary text-white hover:bg-orange-dark': variant === 'primary',
          'border-2 border-orange-primary text-orange-primary hover:bg-orange-soft': variant === 'outline',
          'bg-whatsapp text-white hover:bg-green-600': variant === 'whatsapp',
          'text-navy hover:bg-gray-100': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-7 py-3.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Créer un utilitaire cn**

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Créer Badge**

```tsx
// components/ui/Badge.tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  className?: string
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-block bg-orange-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full', className)}>
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Créer Input**

```tsx
// components/ui/Input.tsx
import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>}
      <input
        id={id}
        className={cn(
          'border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add base UI components Button, Badge, Input"
```

---

## Task 5: Navbar

**Files:**
- Create: `components/layout/Navbar.tsx`

- [ ] **Step 1: Créer la Navbar**

```tsx
// components/layout/Navbar.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">V</span>
            </div>
            <div className="leading-tight">
              <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
              <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Accueil</Link>
            <Link href="/annonces" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Catégories</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Comment ça marche ?</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-navy font-medium transition-colors">Publicité</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/mon-compte" className="text-sm text-gray-600 hover:text-navy font-medium">Mon compte</Link>
                <Link href="/deposer-annonce">
                  <Button size="md">Déposer une annonce</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-sm text-gray-600 hover:text-navy font-medium">Se connecter</Link>
                <Link href="/inscription">
                  <Button size="md">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/annonces" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Catégories</Link>
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Comment ça marche ?</Link>
          <Link href="/" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Publicité</Link>
          <hr />
          {isAuthenticated ? (
            <>
              <Link href="/mon-compte" className="text-sm font-medium text-navy" onClick={() => setMenuOpen(false)}>Mon compte</Link>
              <Link href="/deposer-annonce" onClick={() => setMenuOpen(false)}><Button className="w-full">Déposer une annonce</Button></Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-gray-500 text-left">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">Se connecter</Button></Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)}><Button className="w-full">S'inscrire</Button></Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Vérifier visuellement**

```bash
npm run dev
```
Attendu : logo "V" orange + "VALENCIA / EXPAT MARKET", liens nav, bouton "S'inscrire" orange. Sur mobile : hamburger menu.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add responsive Navbar matching PDF design"
```

---

## Task 6: Footer

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Créer le Footer**

```tsx
// components/layout/Footer.tsx
import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 - Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="leading-tight">
                <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
                <div className="text-white font-bold text-sm tracking-wider uppercase">Expat Market</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Le site de petites annonces des expatriés à Valencia.</p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={18} /></a>
              {/* WhatsApp icon */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 - Navigation */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Navigation</h4>
            <ul className="space-y-2">
              {['Accueil', 'Catégories', 'Comment ça marche ?', 'Publicité', 'Blog', 'Contact'].map(item => (
                <li key={item}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Mon compte */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Mon compte</h4>
            <ul className="space-y-2">
              {[
                { label: 'Se connecter', href: '/connexion' },
                { label: "S'inscrire", href: '/inscription' },
                { label: 'Mes annonces', href: '/mon-compte' },
                { label: 'Mes favoris', href: '/mon-compte' },
                { label: 'Mon abonnement', href: '/mon-compte' },
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4 - Légal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Légal</h4>
            <ul className="space-y-2">
              {['Membres légaux', 'CGU', 'Politique de confidentialité', 'Cookies'].map(item => (
                <li key={item}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-xs">
          © 2024 Valencia Expat Market — Tous droits réservés. Réalisé avec ❤️ pour les expatriés à Valencia.
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Footer with 4 columns and social icons"
```

---

## Task 7: ListingCard + ListingGrid

**Files:**
- Create: `components/listings/ListingCard.tsx`, `components/listings/ListingGrid.tsx`

- [ ] **Step 1: Créer ListingCard**

```tsx
// components/listings/ListingCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Clock } from 'lucide-react'
import { Listing } from '@/types'
import Badge from '@/components/ui/Badge'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "À l'instant"
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days}j`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/annonces/${listing.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-orange-primary transition-colors"
          onClick={e => e.preventDefault()}
        >
          <Heart size={15} className="text-gray-400" />
        </button>
        <div className="absolute top-2.5 left-2.5">
          <Badge label={listing.category} />
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-navy text-sm line-clamp-2 leading-snug">{listing.title}</h3>
        <div className="font-bold text-navy text-base">
          {listing.price !== null ? `${listing.price} €` : <span className="text-green-600">Gratuit</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin size={11} />
            <span>{listing.neighborhood}, {listing.city}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={11} />
            <span>{timeAgo(listing.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Créer ListingGrid**

```tsx
// components/listings/ListingGrid.tsx
import { Listing } from '@/types'
import ListingCard from './ListingCard'

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Aucune annonce trouvée.</p>
        <p className="text-sm mt-1">Essayez d'autres filtres.</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ListingCard and ListingGrid components"
```

---

## Task 8: SearchBar + CategoryGrid

**Files:**
- Create: `components/listings/SearchBar.tsx`, `components/listings/CategoryGrid.tsx`

- [ ] **Step 1: Créer SearchBar**

```tsx
// components/listings/SearchBar.tsx
'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { categories, neighborhoods } from '@/lib/categories'

interface SearchBarProps {
  defaultQuery?: string
  defaultCategory?: string
  defaultCity?: string
}

export default function SearchBar({ defaultQuery = '', defaultCategory = '', defaultCity = '' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [category, setCategory] = useState(defaultCategory)
  const [city, setCity] = useState(defaultCity)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('cat', category)
    if (city) params.set('ville', city)
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl shadow-md p-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Que recherchez-vous ?"
        className="flex-1 px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none rounded-lg"
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="px-3 py-2.5 text-sm text-navy border-l border-gray-100 focus:outline-none bg-white cursor-pointer sm:min-w-[160px]"
      >
        <option value="">Toutes les catégories</option>
        {categories.map(c => (
          <option key={c.slug} value={c.slug}>{c.label}</option>
        ))}
      </select>
      <select
        value={city}
        onChange={e => setCity(e.target.value)}
        className="px-3 py-2.5 text-sm text-navy border-l border-gray-100 focus:outline-none bg-white cursor-pointer sm:min-w-[130px]"
      >
        <option value="">Valencia</option>
        {neighborhoods.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button
        type="submit"
        className="flex items-center gap-2 bg-orange-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-dark transition-colors"
      >
        <Search size={16} />
        Rechercher
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Créer CategoryGrid**

```tsx
// components/listings/CategoryGrid.tsx
import Link from 'next/link'
import { categories } from '@/lib/categories'

export default function CategoryGrid() {
  const displayed = categories.slice(0, 7)
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {displayed.map(cat => (
        <Link
          key={cat.slug}
          href={`/annonces?cat=${cat.slug}`}
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-primary hover:shadow-sm transition-all group"
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-xs font-medium text-navy text-center leading-tight group-hover:text-orange-primary transition-colors">{cat.label}</span>
        </Link>
      ))}
      <Link
        href="/annonces"
        className="flex flex-col items-center gap-2 p-3 bg-orange-soft rounded-xl border border-orange-primary/20 hover:border-orange-primary hover:shadow-sm transition-all"
      >
        <span className="text-2xl">···</span>
        <span className="text-xs font-medium text-orange-primary text-center leading-tight">Voir tout</span>
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add SearchBar and CategoryGrid components"
```

---

## Task 9: Page Accueil

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Créer la page d'accueil**

```tsx
// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Users, PenLine, Phone, Handshake } from 'lucide-react'
import SearchBar from '@/components/listings/SearchBar'
import CategoryGrid from '@/components/listings/CategoryGrid'
import ListingCard from '@/components/listings/ListingCard'
import Button from '@/components/ui/Button'
import { mockListings } from '@/data/listings'

const steps = [
  { icon: Users, title: '1. Inscrivez-vous', desc: 'Créez votre compte et abonnez-vous pour 20 €/an.' },
  { icon: PenLine, title: '2. Publiez vos annonces', desc: 'Déposez autant d\'annonces que vous voulez, avec photos et description.' },
  { icon: Phone, title: '3. Contactez facilement', desc: 'Contactez les vendeurs directement via WhatsApp ou par téléphone.' },
  { icon: Handshake, title: '4. Rencontrez-vous', desc: 'Les échanges et paiements se font uniquement en main propre.' },
]

export default function HomePage() {
  const featured = mockListings.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-soft to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-navy leading-tight mb-4">
                Achetez, vendez et donnez{' '}
                <span className="text-orange-primary">une seconde vie</span>{' '}
                à vos affaires entre expatriés à Valencia.
              </h1>
              <p className="text-gray-500 text-lg mb-2">Le site de petites annonces des expatriés à Valencia.</p>
              <p className="text-gray-500 text-sm mb-8">Annonces illimitées pour seulement <strong className="text-navy">20 €/an</strong>.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/annonces"><Button size="lg">Voir les annonces</Button></Link>
                <Link href="/#comment-ca-marche"><Button size="lg" variant="outline">Comment ça marche ?</Button></Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
                alt="Valencia City of Arts and Sciences"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
          {/* SearchBar */}
          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-navy mb-6">Parcourez les catégories</h2>
        <CategoryGrid />
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy">Annonces à la une</h2>
          <Link href="/annonces" className="text-orange-primary text-sm font-semibold hover:underline flex items-center gap-1">
            Voir toutes les annonces <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* B2B Banner */}
      <section className="bg-orange-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">📣 Vous êtes une entreprise locale ?</p>
            <h3 className="text-white font-bold text-xl">Touchez la communauté des expatriés à Valencia !</h3>
            <p className="text-white/80 text-sm mt-1">Réservez votre emplacement publicitaire dès maintenant.</p>
          </div>
          <Button variant="outline" className="border-white text-white hover:bg-white/10 shrink-0">
            Voir nos offres pub
          </Button>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-navy mb-10 text-center">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(step => (
            <div key={step.title} className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-orange-soft rounded-full flex items-center justify-center">
                <step.icon size={24} className="text-orange-primary" />
              </div>
              <h3 className="font-bold text-navy text-sm">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA communauté */}
      <section className="bg-orange-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Rejoignez la communauté Valencia Expat Market !</h2>
          <p className="text-white/80 mb-8">Des centaines d'expatriés nous font déjà confiance.</p>
          <Link href="/inscription"><Button size="lg" className="bg-white text-orange-primary hover:bg-gray-100">S'inscrire maintenant</Button></Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Remplacer l'image Valencia par une vraie**

Remplacer l'URL `src` du hero par une image de la Cité des Arts et des Sciences :
```
https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop
```

- [ ] **Step 3: Vérifier visuellement**

```bash
npm run dev
```
Vérifier : hero orange doux, image Valencia à droite, SearchBar, grille catégories, 4 cards, bannière orange, steps, CTA orange foncé.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build homepage with hero, categories, listings, CTA sections"
```

---

## Task 10: Page Liste des annonces

**Files:**
- Create: `app/annonces/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/annonces/page.tsx
'use client'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import SearchBar from '@/components/listings/SearchBar'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/context/ListingsContext'
import { categories } from '@/lib/categories'

export default function AnnoncesPage() {
  const searchParams = useSearchParams()
  const { listings } = useListings()
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date')

  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || ''
  const ville = searchParams.get('ville') || ''

  const filtered = useMemo(() => {
    let result = listings.filter(l => {
      const matchQ = !q || l.title.toLowerCase().includes(q.toLowerCase()) || l.description.toLowerCase().includes(q.toLowerCase())
      const matchCat = !cat || l.categorySlug === cat
      const matchVille = !ville || l.neighborhood === ville || l.city === ville
      return matchQ && matchCat && matchVille
    })
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    return result
  }, [listings, q, cat, ville, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <SearchBar defaultQuery={q} defaultCategory={cat} defaultCity={ville} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</span>
          {cat && <span className="text-xs bg-orange-soft text-orange-primary px-2 py-1 rounded-full font-medium">{categories.find(c => c.slug === cat)?.label}</span>}
          {ville && <span className="text-xs bg-orange-soft text-orange-primary px-2 py-1 rounded-full font-medium">{ville}</span>}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-primary"
          >
            <option value="date">Plus récentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <a href="/annonces" className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${!cat ? 'bg-orange-primary text-white border-orange-primary' : 'border-gray-200 text-gray-600 hover:border-orange-primary'}`}>
          Tout
        </a>
        {categories.map(c => (
          <a key={c.slug} href={`/annonces?cat=${c.slug}`} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${cat === c.slug ? 'bg-orange-primary text-white border-orange-primary' : 'border-gray-200 text-gray-600 hover:border-orange-primary'}`}>
            {c.icon} {c.label}
          </a>
        ))}
      </div>

      <ListingGrid listings={filtered} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add listings page with search, filters and sort"
```

---

## Task 11: Page Détail annonce

**Files:**
- Create: `app/annonces/[id]/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/annonces/[id]/page.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { MapPin, Calendar, ChevronRight, Phone, Flag, ShieldCheck } from 'lucide-react'
import { useListings } from '@/context/ListingsContext'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getListing } = useListings()
  const listing = getListing(id)
  const [activeImg, setActiveImg] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  if (!listing) return notFound()

  const waLink = `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Valencia Expat Market.`)}`
  const publishDate = new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-primary">Accueil</Link>
        <ChevronRight size={12} />
        <Link href="/annonces" className="hover:text-orange-primary">Annonces</Link>
        <ChevronRight size={12} />
        <Link href={`/annonces?cat=${listing.categorySlug}`} className="hover:text-orange-primary">{listing.category}</Link>
        <ChevronRight size={12} />
        <span className="text-navy line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + info */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3">
            <Image src={listing.images[activeImg]} alt={listing.title} fill className="object-cover" unoptimized />
          </div>
          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-orange-primary' : 'border-transparent'}`}>
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge label={listing.category} className="mb-2" />
                <h1 className="text-2xl font-bold text-navy">{listing.title}</h1>
              </div>
              <div className="text-2xl font-extrabold text-navy shrink-0">
                {listing.price !== null ? `${listing.price} €` : <span className="text-green-600 text-xl">Gratuit</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.neighborhood}, {listing.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Publié le {publishDate}</span>
            </div>
            <div>
              <h2 className="font-semibold text-navy mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Contact + security */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <h2 className="font-semibold text-navy mb-1">Contacter le vendeur</h2>
            <p className="text-xs text-gray-400 mb-4">Publié par {listing.userName}</p>

            <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="whatsapp" className="w-full mb-3 text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contacter via WhatsApp
              </Button>
            </a>

            {!showPhone ? (
              <Button variant="outline" className="w-full text-sm" onClick={() => setShowPhone(true)}>
                <Phone size={15} /> Voir le numéro de téléphone
              </Button>
            ) : (
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-navy">
                <Phone size={15} className="text-orange-primary" />
                {listing.phone}
              </div>
            )}

            {/* Security notice */}
            <div className="mt-4 bg-orange-soft rounded-lg p-3 flex gap-2">
              <ShieldCheck size={16} className="text-orange-primary shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Les échanges et paiements se font <strong>uniquement en main propre</strong>. Valencia Expat Market n'intervient pas dans la transaction.
              </p>
            </div>

            <button onClick={() => setReportOpen(true)} className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Flag size={12} /> Signaler cette annonce
            </button>
          </div>
        </div>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-navy mb-3">Signaler cette annonce</h3>
            <p className="text-sm text-gray-500 mb-4">Pourquoi souhaitez-vous signaler cette annonce ?</p>
            {['Annonce frauduleuse', 'Produit interdit', 'Contenu inapproprié', 'Doublon', 'Autre'].map(r => (
              <label key={r} className="flex items-center gap-2 py-2 text-sm cursor-pointer hover:text-orange-primary">
                <input type="radio" name="reason" value={r} className="accent-orange-primary" /> {r}
              </label>
            ))}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => setReportOpen(false)}>Annuler</Button>
              <Button className="flex-1 text-sm" onClick={() => setReportOpen(false)}>Envoyer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add listing detail page with gallery, WhatsApp, report modal"
```

---

## Task 12: Page Inscription

**Files:**
- Create: `app/inscription/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/inscription/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const features = [
  'Annonces illimitées',
  'Ajout de photos',
  'Contact de WhatsApp',
  'Support par e-mail',
]

export default function InscriptionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login(form.email, form.password)
      router.push('/mon-compte')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
            <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">S'inscrire</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Rejoignez la communauté des expatriés de Valencia.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          <Input id="name" label="Nom complet" type="text" placeholder="Marie Dupont" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input id="email" label="Adresse e-mail" type="email" placeholder="marie@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

          {/* Subscription box */}
          <div className="bg-orange-soft border border-orange-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-navy text-sm">Abonnement annuel</span>
              <span className="font-extrabold text-orange-primary text-lg">20 € <span className="text-xs font-normal text-gray-400">/ an</span></span>
            </div>
            <ul className="space-y-1.5">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-orange-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Traitement...' : "S'inscrire et payer 20 €"}
          </Button>
        </form>

        {/* Payment icons */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Paiement sécurisé par Stripe</span>
        </div>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {['VISA', 'MC', 'AMEX', 'CB'].map(p => (
            <span key={p} className="border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-400 font-mono">{p}</span>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Déjà inscrit ? <Link href="/connexion" className="text-orange-primary hover:underline font-medium">Se connecter</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">En vous inscrivant, vous acceptez nos CGU et notre Politique de confidentialité.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add inscription page with subscription box and mock payment"
```

---

## Task 13: Page Connexion

**Files:**
- Create: `app/connexion/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/connexion/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ConnexionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      login(form.email, form.password)
      router.push('/mon-compte')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
            <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">Se connecter</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Compte démo : <strong>demo@valenciaexpat.com</strong> / <strong>demo1234</strong></p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Adresse e-mail" type="email" placeholder="demo@valenciaexpat.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div className="text-right">
            <a href="#" className="text-xs text-orange-primary hover:underline">Mot de passe oublié ?</a>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pas encore de compte ? <Link href="/inscription" className="text-orange-primary hover:underline font-medium">S'inscrire pour 20 €/an</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add connexion page with demo credentials"
```

---

## Task 14: Page Mon Compte

**Files:**
- Create: `app/mon-compte/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/mon-compte/page.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, List, Heart, CreditCard, MessageSquare, User, LogOut, Plus, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useListings } from '@/context/ListingsContext'
import Button from '@/components/ui/Button'

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: List, label: 'Mes annonces' },
  { icon: Heart, label: 'Mes favoris' },
  { icon: CreditCard, label: 'Mon abonnement' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: User, label: 'Mes informations' },
]

export default function MonComptePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { listings } = useListings()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/connexion')
  }, [isAuthenticated, router])

  if (!user) return null

  const myListings = listings.filter(l => l.userId === user.id || l.userId === 'demo').slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-6 p-2">
              <div className="w-10 h-10 bg-orange-primary rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{user.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-orange-soft text-orange-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
              <hr className="my-2" />
              <button onClick={() => { logout(); router.push('/') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Déconnexion
              </button>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold text-navy">Mon compte</h1>

          {/* Subscription */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-navy mb-4">Mon abonnement</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Statut :</span>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} /> Actif
                  </span>
                </div>
                <p className="text-sm text-gray-500">Prochain renouvellement : <strong className="text-navy">{user.subscriptionRenewal}</strong></p>
              </div>
              <Button variant="outline" size="sm">Renouveler (20 €)</Button>
            </div>
          </div>

          {/* My listings */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">Mes annonces</h2>
              <Link href="/deposer-annonce">
                <Button size="sm" className="flex items-center gap-1"><Plus size={14} /> Déposer une annonce</Button>
              </Link>
            </div>
            {myListings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Vous n'avez pas encore d'annonce.</p>
            ) : (
              <div className="space-y-3">
                {myListings.map(listing => (
                  <Link key={listing.id} href={`/annonces/${listing.id}`} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-orange-primary transition-colors">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Publié le {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className="shrink-0 text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add dashboard page with subscription status and listings list"
```

---

## Task 15: Page Déposer une annonce

**Files:**
- Create: `app/deposer-annonce/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
// app/deposer-annonce/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useListings } from '@/context/ListingsContext'
import { categories, neighborhoods } from '@/lib/categories'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/upload1/800/600',
  'https://picsum.photos/seed/upload2/800/600',
  'https://picsum.photos/seed/upload3/800/600',
]

export default function DeposerAnnoncePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addListing } = useListings()

  const [form, setForm] = useState({
    title: '',
    categorySlug: '',
    price: '',
    description: '',
    neighborhood: '',
    whatsapp: '',
  })
  const [mockImages, setMockImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isAuthenticated) router.replace('/connexion')
  }, [isAuthenticated, router])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const addMockImage = () => {
    if (mockImages.length >= 8) return
    setMockImages(imgs => [...imgs, PLACEHOLDER_IMAGES[imgs.length % PLACEHOLDER_IMAGES.length]])
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Le titre est obligatoire'
    if (!form.categorySlug) e.categorySlug = 'Choisissez une catégorie'
    if (!form.neighborhood) e.neighborhood = 'Choisissez un quartier'
    if (!form.whatsapp.trim()) e.whatsapp = 'Le numéro WhatsApp est obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const cat = categories.find(c => c.slug === form.categorySlug)
    setTimeout(() => {
      const id = addListing({
        title: form.title,
        category: cat?.label || '',
        categorySlug: form.categorySlug,
        price: form.price ? Number(form.price) : null,
        description: form.description,
        neighborhood: form.neighborhood,
        whatsapp: form.whatsapp,
      })
      router.push(`/annonces/${id}`)
    }, 800)
  }

  if (!isAuthenticated) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2">Déposer une annonce</h1>
      <p className="text-sm text-gray-400 mb-8">Remplissez les informations ci-dessous pour publier votre annonce.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-navy">Informations de l'annonce</h2>
          <Input id="title" label="Titre de l'annonce *" placeholder="Ex: Canapé 3 places IKEA gris" value={form.title} onChange={set('title')} error={errors.title} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Catégorie *</label>
            <select value={form.categorySlug} onChange={set('categorySlug')} className={`border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition ${errors.categorySlug ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Choisir une catégorie</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
            </select>
            {errors.categorySlug && <p className="text-xs text-red-500">{errors.categorySlug}</p>}
          </div>

          <Input id="price" label="Prix en euros (laisser vide pour un don)" type="number" placeholder="Ex: 150" value={form.price} onChange={set('price')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={5}
              placeholder="Décrivez l'état, les dimensions, les raisons de la vente..."
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition resize-none"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-navy mb-1">Photos</h2>
          <p className="text-xs text-gray-400 mb-4">Jusqu'à 8 photos. La première sera l'image principale.</p>
          <div className="grid grid-cols-4 gap-2">
            {mockImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setMockImages(imgs => imgs.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {mockImages.length < 8 && (
              <button type="button" onClick={addMockImage} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-orange-primary transition-colors text-gray-400 hover:text-orange-primary">
                <ImagePlus size={20} />
                <span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>
        </div>

        {/* Location + Contact */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-navy">Localisation & contact</h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Quartier / Ville *</label>
            <select value={form.neighborhood} onChange={set('neighborhood')} className={`border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary transition ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Choisir un quartier</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.neighborhood && <p className="text-xs text-red-500">{errors.neighborhood}</p>}
          </div>
          <Input id="whatsapp" label="Numéro WhatsApp *" type="tel" placeholder="+34 6XX XXX XXX" value={form.whatsapp} onChange={set('whatsapp')} error={errors.whatsapp} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add post listing form with validation and context integration"
```

---

## Task 16: Déploiement GitHub + Vercel

**Files:**
- Create: `.gitignore` (déjà généré par create-next-app), `vercel.json` (optionnel)

- [ ] **Step 1: Vérifier le build**

```bash
npm run build
```
Attendu : build réussi sans erreurs TypeScript ni ESLint bloquants.

- [ ] **Step 2: Créer le repo GitHub**

```bash
gh repo create valencia-expat-market --public --description "Site de petites annonces entre expatriés à Valencia — prototype Next.js"
git remote add origin https://github.com/bidallierguillaume/valencia-expat-market.git
git push -u origin main
```

- [ ] **Step 3: Déployer sur Vercel**

```bash
npx vercel --yes
```
Suivre les prompts. Vercel détecte automatiquement Next.js. Aucune variable d'environnement requise (prototype 100% frontend).

- [ ] **Step 4: Vérifier le déploiement**

Ouvrir l'URL Vercel fournie. Vérifier :
- Page accueil chargée ✓
- Navigation fonctionnelle ✓
- Annonces visibles ✓
- Connexion avec `demo@valenciaexpat.com` / `demo1234` ✓

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "chore: finalize prototype for Vercel deployment"
git push origin main
```

---

## Self-Review

**Spec coverage :**
- ✅ 7 pages clés : accueil, liste, détail, inscription, connexion, compte, déposer
- ✅ Design system PDF : orange #E8571A, navy #1A1F36, whatsapp #25D366, orange-soft #FDF5F0
- ✅ 20 annonces mockées, 11 catégories
- ✅ AuthContext localStorage + ListingsContext
- ✅ Bouton WhatsApp vert, message sécurité main propre
- ✅ SearchBar + filtres catégorie/ville/tri
- ✅ Responsive mobile (hamburger, grilles adaptatives)
- ✅ GitHub + Vercel deploy

**Cohérence des types :** `Listing`, `NewListing`, `User`, `Category` définis en Task 2, utilisés identiquement dans tous les contextes et composants.

**Placeholders :** Aucun TBD, toutes les étapes contiennent le code complet.
