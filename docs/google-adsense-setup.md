# Google AdSense — Guide d'intégration

> **Plateforme :** Vendo — Valencia Expat Market  
> **Stack :** Next.js 16 / Vercel / Neon PostgreSQL  
> **Statut actuel :** Système hybride en place — pubs directes des Professionnels en priorité, AdSense en fallback automatique dès que les variables d'env sont définies.

---

## Sommaire

1. [Vue d'ensemble du système publicitaire](#1-vue-densemble)
2. [Prérequis légaux RGPD](#2-prérequis-légaux-rgpd)
3. [Créer un compte AdSense](#3-créer-un-compte-adsense)
4. [Ajouter le code de vérification](#4-ajouter-le-code-de-vérification)
5. [Récupérer les IDs et configurer](#5-récupérer-les-ids-et-configurer)
6. [Configurer sur Vercel](#6-configurer-sur-vercel)
7. [Vérifier que tout fonctionne](#7-vérifier-que-tout-fonctionne)
8. [Formats et emplacements publicitaires](#8-formats-et-emplacements)
9. [Revenus estimés et optimisation](#9-revenus-et-optimisation)
10. [Dépannage](#10-dépannage)

---

## 1. Vue d'ensemble

Le système publicitaire fonctionne en **3 niveaux de priorité** :

```
┌─────────────────────────────────────────────────────────────┐
│  Niveau 1 — Pros Premium (catégorie correspondante)         │
│  → Professionnel de la même catégorie que la page           │
│  → Logo, description, contacts, lien vers fiche             │
├─────────────────────────────────────────────────────────────┤
│  Niveau 2 — Pros Premium (toutes catégories)                │
│  → Complète si pas assez de pros dans la catégorie          │
├─────────────────────────────────────────────────────────────┤
│  Niveau 3 — Google AdSense                                  │
│  → Fallback si 0 pro disponible                             │
│  → Activé par NEXT_PUBLIC_ADSENSE_ID dans .env.local        │
├─────────────────────────────────────────────────────────────┤
│  Niveau 4 — Maquettes statiques                             │
│  → Si ni pros ni AdSense configuré (dev / démo)             │
└─────────────────────────────────────────────────────────────┘
```

### Emplacements sur le site

| Page | Emplacement | Format | Variable slot |
|---|---|---|---|
| Homepage | Entre catégories et annonces | `banner` | `SLOT_BANNER` |
| `/annonces` | Entre les annonces (tous les 6) | `banner` | `SLOT_BANNER` |
| `/annonces` | Colonne droite (xl+) | `skyscraper` | `SLOT_SKYSCRAPER` |
| `/professionnels` | Colonne gauche (xl+) | `skyscraper` | `SLOT_SKYSCRAPER` |
| `/professionnels` | Colonne droite (xl+) | `skyscraper` | `SLOT_SKYSCRAPER` |
| `/professionnels` | Au-dessus de la grille | `banner` | `SLOT_BANNER` |

---

## 2. Prérequis légaux RGPD

> ⚠️ **Google refusera ton site sans ces éléments.** C'est aussi obligatoire légalement en France et en Belgique.

### Ce qui manque actuellement

- [ ] Page `/politique-confidentialite`
- [ ] Page `/mentions-legales`
- [ ] Bandeau de consentement cookies (CMP)

### Pourquoi c'est bloquant

Google AdSense affiche des **pubs comportementales** (ciblées sur l'historique de navigation de l'utilisateur). En Europe, cela nécessite le **consentement explicite** de l'utilisateur selon le RGPD. Sans bandeau cookies valide, AdSense peut suspendre ton compte.

### Solution rapide — Google CMP Partner

Google propose son propre outil de gestion du consentement, gratuit et directement intégré à AdSense :

1. Dans AdSense → **Confidentialité et messages** → **Créer un message RGPD**
2. Personnalise le bandeau (couleurs, texte)
3. Publie → le bandeau apparaît automatiquement pour les visiteurs UE

---

## 3. Créer un compte AdSense

### Étape 1 — Inscription

1. Va sur [adsense.google.com](https://adsense.google.com)
2. Clique sur **"Commencer"**
3. Connecte-toi avec un compte Google (perso ou pro)

### Étape 2 — Renseigner le site

| Champ | Valeur |
|---|---|
| URL du site | `ton-domaine.com` ou `vendo-expat.vercel.app` |
| Pays | France (ou Belgique selon ta situation) |
| Fuseau horaire | Europe/Paris |

> 💡 Si tu n'as pas encore de domaine personnalisé, utilise l'URL Vercel. Tu pourras changer plus tard.

### Étape 3 — Informations de paiement

- Ajoute ton adresse postale (Google envoie un code PIN par courrier pour vérifier)
- Le paiement se fait par virement bancaire une fois le seuil de 70 € atteint

### Délai d'approbation

Google analyse manuellement chaque site. **Compte 1 à 4 semaines.**

Critères d'approbation :
- Contenu original et utile ✅
- Site navigable et fonctionnel ✅
- Politique de confidentialité présente ⚠️ à faire
- Pas de contenu interdit ✅
- Trafic organique (pas obligatoire mais accélère l'approbation)

---

## 4. Ajouter le code de vérification

Pendant la procédure d'inscription, Google te fournit une balise meta de vérification :

```html
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXXX">
```

### Dans le projet Next.js

Ouvre `app/layout.tsx` et ajoute la balise dans le `<head>` :

```tsx
export const metadata: Metadata = {
  title: 'Vendo — Petites annonces entre expatriés en Espagne',
  description: '...',
  // Ajouter ici :
  other: {
    'google-adsense-account': 'ca-pub-XXXXXXXXXXXXXXXXX',
  },
}
```

Ou directement dans le composant HTML :

```tsx
<html lang="fr">
  <head>
    <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXXX" />
  </head>
  ...
</html>
```

Puis commit et déploie sur Vercel pour que Google puisse vérifier.

---

## 5. Récupérer les IDs et configurer

Une fois le compte approuvé, tu récupères deux types d'identifiants.

### Publisher ID

Visible dans AdSense en haut à droite ou dans **Compte → Informations sur le compte** :

```
ca-pub-1234567890123456
```

### Slot IDs (un par format)

**Annonces → Par bloc d'annonces → + Nouveau bloc d'annonces**

Crée 3 blocs :

| Nom du bloc | Type | Taille recommandée | Variable |
|---|---|---|---|
| `vendo-banner` | Annonce display | Responsive / 728×90 | `SLOT_BANNER` |
| `vendo-skyscraper` | Annonce display | Responsive / 160×600 | `SLOT_SKYSCRAPER` |
| `vendo-inline` | Annonce display | Responsive | `SLOT_INLINE` |

Chaque bloc te donne un **Slot ID** à 10 chiffres : `1234567890`

---

## 6. Configurer sur Vercel

### En local — `.env.local`

```bash
# Google AdSense
NEXT_PUBLIC_ADSENSE_ID=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=1111111111
NEXT_PUBLIC_ADSENSE_SLOT_SKYSCRAPER=2222222222
NEXT_PUBLIC_ADSENSE_SLOT_INLINE=3333333333
```

### Sur Vercel (production)

1. Tableau de bord Vercel → ton projet → **Settings**
2. **Environment Variables**
3. Ajoute les 4 variables ci-dessus avec les vraies valeurs
4. Sélectionne **Production** (et Preview si tu veux tester)
5. **Save** puis **Redeploy**

```
Settings → Environment Variables → Add New

Name:  NEXT_PUBLIC_ADSENSE_ID
Value: ca-pub-XXXXXXXXXXXXXXXXX
Environments: ✅ Production  ☐ Preview  ☐ Development
```

> ⚠️ Les variables `NEXT_PUBLIC_` sont exposées côté client. C'est normal et voulu pour AdSense — elles ne contiennent aucun secret.

---

## 7. Vérifier que tout fonctionne

### Test en local

```bash
# Ajouter les vraies valeurs dans .env.local puis :
npm run dev
```

Ouvre `/annonces` et inspecte l'élément `<ins class="adsbygoogle">` — il doit être présent dans le DOM.

### Console navigateur

Tu devrais voir dans la console :
```
[AdSense] Ads loaded
```

En cas d'erreur :
```
adsbygoogle.push() error: No slot size for googletag
```
→ Le conteneur est trop petit. Vérifie que les `div` parent ont une largeur définie.

### Mode test AdSense

Pour tester sans vraies impressions (et éviter les clics invalides) :

```bash
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXXX
# Ajoute dans AdSense → Compte → Centre de vérification → Mode test
```

---

## 8. Formats et emplacements

### Tailles standards recommandées

| Format | Taille | Code dans le projet | CTR moyen |
|---|---|---|---|
| Bannière horizontale | 728×90 | `size="banner"` | ~0.3% |
| Demi-page / Skyscraper | 160×600 | `size="skyscraper"` | ~0.5% |
| Rectangle | 300×250 | `size="rectangle"` | ~0.4% |
| Responsive (recommandé) | Auto | `data-ad-format="auto"` | Variable |

### Règles de placement AdSense

- **Maximum 3 blocs** par page (règle stricte Google)
- Pas de pub dans les modales
- Pas de pub dans les zones de formulaires
- Les pubs doivent être clairement distinguées du contenu éditorial

Le projet respecte déjà ces règles avec le label "Annonce" ou "Professionnel" sur chaque emplacement.

---

## 9. Revenus et optimisation

### Estimation pour ce marché

Le ciblage "expatriés francophones en Espagne" est une niche à **CPM élevé** (annonceurs immobilier, juridique, assurance paient cher).

| Métrique | Estimation basse | Estimation haute |
|---|---|---|
| CPM (pour 1 000 impressions) | 2 € | 12 € |
| CTR moyen | 0.2% | 0.8% |
| CPC moyen | 0.30 € | 1.50 € |
| Revenus pour 10 000 visites/mois | 20 € | 120 € |
| Revenus pour 100 000 visites/mois | 200 € | 1 200 € |

> Les pubs directes des Professionnels (niveau 1 et 2) génèrent bien plus car tu gardes 100 % du revenu et peux fixer tes propres tarifs.

### Tarification suggérée pour les pros

| Placement | Durée | Prix suggéré |
|---|---|---|
| Skyscraper (colonne) | 1 mois | 49 € |
| Bannière horizontale | 1 mois | 29 € |
| Les deux | 1 mois | 69 € |
| Pack annuel (les deux) | 12 mois | 599 € |

### Optimisation AdSense

- **Auto Ads** : laisse Google placer les pubs automatiquement en plus de tes emplacements fixes
- **Anchor Ads** : bandeau collant en bas sur mobile (activer dans AdSense → Annonces → Par page)
- **A/B Testing** : teste différents emplacements dans AdSense Experiments

---

## 10. Dépannage

### Les pubs n'apparaissent pas

| Symptôme | Cause probable | Solution |
|---|---|---|
| `<ins>` vide | Compte pas encore approuvé | Attendre l'approbation |
| Erreur console `adsbygoogle is not defined` | Script non chargé | Vérifier `NEXT_PUBLIC_ADSENSE_ID` dans Vercel |
| Pubs blanches | Bloqueur de pub actif | Tester en navigation privée sans extension |
| Erreur `ca-pub-` invalide | Mauvais Publisher ID | Vérifier dans AdSense → Compte |

### Compte suspendu ou refusé

Causes les plus fréquentes :
1. **Pas de politique de confidentialité** → Créer la page
2. **Trafic insuffisant** → Attendre d'avoir plus de visites
3. **Contenu dupliqué** → S'assurer que les annonces sont du contenu original
4. **Clics invalides** → Ne jamais cliquer sur ses propres pubs

### Contacter le support AdSense

[support.google.com/adsense](https://support.google.com/adsense) → "Contacter l'assistance"

---

## Checklist de déploiement

```
Avant de soumettre à AdSense :
  [ ] Page /politique-confidentialite créée
  [ ] Page /mentions-legales créée  
  [ ] Bandeau cookies RGPD configuré (via Google CMP ou Cookiebot)
  [ ] Balise meta de vérification ajoutée dans layout.tsx
  [ ] Site déployé et accessible publiquement

Après approbation :
  [ ] 3 blocs d'annonces créés dans AdSense
  [ ] Variables d'env ajoutées dans Vercel
  [ ] Redéploiement effectué
  [ ] Test en navigation privée (sans bloqueur de pub)
  [ ] Vérification que les <ins> sont présents dans le DOM
  [ ] Code PIN postal reçu et validé (dans les 2 semaines)
```

---

*Document maintenu par Guillaume Bidallier — NovaTeck Studio*  
*Dernière mise à jour : juin 2026*
