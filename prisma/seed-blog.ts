import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

const POSTS = [
  {
    slug: 'vivre-en-espagne-demarches-essentielles',
    title: 'Vivre en Espagne : les démarches essentielles pour s\'installer',
    excerpt: 'NIE, empadronamiento, compte bancaire, sécurité sociale… Tout ce qu\'il faut faire dans les premiers mois pour vivre sereinement en Espagne.',
    content: `# Vivre en Espagne : les démarches essentielles

S'installer en Espagne est une aventure formidable, mais les premières semaines peuvent vite devenir un casse-tête administratif. Voici les étapes clés, dans l'ordre.

## 1. Le NIE (Número de Identidad de Extranjero)

Le NIE est votre identifiant fiscal en Espagne. **C'est la première démarche à effectuer**, car vous en aurez besoin pour presque tout : ouvrir un compte bancaire, signer un bail, acheter une voiture…

**Comment l'obtenir :**
- Prenez rendez-vous sur le site de la police nationale (extranjeros.interior.gob.es)
- Apportez : passeport + photocopie, formulaire EX-15 rempli, justificatif de motif (contrat de travail, preuve d'achat immobilier, etc.)
- Payez la taxe (tasa 790 código 012) dans une banque

> **Conseil Vendo :** Les rendez-vous partent très vite. Connectez-vous tôt le matin pour en trouver un.

## 2. L'empadronamiento (inscription en mairie)

L'empadronamiento est l'inscription sur le registre municipal de votre commune. Il prouve votre résidence officielle.

**Pourquoi c'est important :**
- Accès à la sécurité sociale
- Scolarisation des enfants
- Certaines aides municipales
- Votre carte de résident (si séjour > 3 mois)

Rendez-vous à la mairie (ayuntamiento) avec : passeport, contrat de bail ou acte de propriété.

## 3. Ouvrir un compte bancaire

Avec votre NIE et votre empadronamiento, vous pouvez ouvrir un compte dans une banque espagnole. Les banques les plus pratiques pour les expatriés francophones :

- **CaixaBank** — très présente partout, appli complète
- **BBVA** — interface en français disponible
- **Revolut / N26** — pour débuter sans démarches complexes

## 4. La Seguridad Social

Si vous travaillez en Espagne (salarié ou indépendant), vous devez vous inscrire à la Sécurité Sociale espagnole.

- **Salarié** : votre employeur s'en charge
- **Autónomo (indépendant)** : vous devez vous inscrire vous-même au RETA

## 5. Le certificado de registro de ciudadano de la UE

Si vous êtes citoyen européen et que vous restez plus de 3 mois, vous devez obtenir ce certificat. Il remplace l'ancienne "carte de résident".

---

Ces démarches peuvent sembler intimidantes, mais une fois le NIE en poche, tout s'enchaîne assez naturellement. N'hésitez pas à faire appel à un **gestorio** (cabinet administratif espagnol) si vous vous sentez dépassé — leur coût est généralement raisonnable.

*Vous avez des questions sur ces démarches ? Notre communauté Vendo est là pour vous aider !*
`,
    category: 'guide',
    author: 'Équipe Vendo',
    readTime: 7,
    lang: 'fr',
    published: true,
    publishedAt: new Date('2026-01-15'),
  },
  {
    slug: 'louer-appartement-valence-conseils',
    title: 'Louer un appartement à Valence : nos conseils pour éviter les pièges',
    excerpt: 'Fianzas, contrat de location, charges incluses… Le marché locatif espagnol a ses propres règles. On vous explique tout pour louer en toute sécurité.',
    content: `# Louer un appartement à Valence

Le marché locatif valencien est dynamique mais peut réserver des surprises aux expatriés habitués au système français. Voici ce qu'il faut savoir.

## Les documents à préparer

Avant même de visiter, préparez votre dossier :

- **NIE** (indispensable)
- **3 dernières fiches de paie** ou contrat de travail
- **Justificatif bancaire** (relevé de compte)
- **Passeport** ou carte d'identité

## La fianza (caution)

En Espagne, la loi impose **1 mois de fianza** (caution) pour une location d'habitation. Certains propriétaires demandent des garanties supplémentaires (fianza adicional), ce qui est légal jusqu'à 2 mois supplémentaires.

> **Attention :** La fianza doit être déposée par le propriétaire auprès de l'Institut Valencien (IVAJ/IVJ). Vérifiez qu'il le fait !

## Le contrat de location

La durée minimale légale d'un bail d'habitation est de **5 ans** (7 ans si le propriétaire est une société). En pratique, les contrats sont souvent signés pour 1 an renouvelable.

**Points à vérifier dans le contrat :**
- Montant du loyer et mode de révision (IPC)
- Charges incluses ou non (eau, communauté, poubelles)
- Qui paie l'IBI (taxe foncière)
- Clause de résiliation anticipée

## Les quartiers de Valence

Chaque quartier a son ambiance :

- **Ruzafa** : branché, jeune, nombreux restaurants et bars
- **El Carmen** : historique, vie nocturne animée
- **Benimaclet** : universitaire, calme en journée, ambiance village
- **Malvarrosa** : proche de la plage, plus familial
- **Patraix / Campanar** : résidentiel, prix plus abordables

## Prix moyens (2026)

| Quartier | Studio | 2 pièces | 3 pièces |
|----------|--------|----------|----------|
| Centre/Ruzafa | 700-900€ | 900-1200€ | 1100-1500€ |
| Benimaclet | 600-800€ | 800-1000€ | 1000-1300€ |
| Périphérie | 500-650€ | 650-850€ | 800-1100€ |

---

N'hésitez pas à publier votre recherche de logement sur **Vendo** — notre communauté peut vous aider à trouver la perle rare avant même qu'elle soit sur les grandes plateformes !
`,
    category: 'vie-pratique',
    author: 'Équipe Vendo',
    readTime: 6,
    lang: 'fr',
    published: true,
    publishedAt: new Date('2026-02-10'),
  },
  {
    slug: 'numero-nie-espagne-guide-complet',
    title: 'NIE en Espagne : guide complet 2026 (obtenir, renouveler, FAQ)',
    excerpt: 'Le NIE est incontournable pour tout expatrié en Espagne. Ce guide complet vous explique comment l\'obtenir rapidement, les erreurs à éviter et les réponses aux questions fréquentes.',
    content: `# NIE en Espagne : guide complet 2026

Le NIE (Número de Identidad de Extranjero) est l'identifiant fiscal attribué aux étrangers en Espagne. Sans lui, impossible d'ouvrir un compte bancaire, de signer un bail ou d'acheter un véhicule.

## Qu'est-ce que le NIE exactement ?

Le NIE est un numéro unique composé d'une lettre, 7 chiffres et une lettre de contrôle (ex : X1234567Z). Il vous identifie auprès de l'administration fiscale espagnole.

**Le NIE n'est pas :**
- Une carte de résident (c'est le Certificado de Registro pour les Européens)
- Une autorisation de travail (c'est différent)

## Comment obtenir votre NIE

### Étape 1 : Réunir les documents

- Formulaire **EX-15** (téléchargeable sur extranjeros.interior.gob.es)
- Original + photocopie de votre **passeport** (toutes les pages)
- Justificatif de motif : contrat de travail, promesse de vente, inscription université…
- Tasa modelo 790 código 012 (payée en banque : environ 10€)

### Étape 2 : Prendre rendez-vous

Sur le site [extranjeros.gob.es](https://sede.administracionespublicales.gob.es), cherchez "Asignación de NIE". Les créneaux sont souvent complets — connectez-vous très tôt le matin (7h-8h).

**Astuce :** Certaines agences proposent de vous obtenir un rendez-vous contre une commission. C'est légal.

### Étape 3 : Se rendre au rendez-vous

Apportez tous vos originaux ET photocopies. L'officier de police vérifiera votre dossier et vous remettra votre NIE séance tenante ou par courrier sous quelques jours.

## FAQ

**Mon NIE expire-t-il ?**
Le numéro est permanent. Seul le certificat physique peut avoir une date d'expiration.

**Puis-je travailler avec juste un NIE ?**
Si vous êtes ressortissant de l'UE, oui. Si vous êtes hors UE, vous avez besoin d'une autorisation de travail en plus.

**Je n'ai pas de justificatif de motif fort. Que faire ?**
Une lettre expliquant votre intention de résider (pour acheter ou louer un bien) peut suffire dans certains cas. Un avocat local peut vous aider.

---

Pour toute question sur vos démarches administratives en Espagne, la communauté Vendo est là pour vous. Postez votre question dans notre forum !
`,
    category: 'guide',
    author: 'Équipe Vendo',
    readTime: 8,
    lang: 'fr',
    published: true,
    publishedAt: new Date('2026-03-05'),
  },
  {
    slug: 'scolariser-enfants-espagne',
    title: 'Scolariser ses enfants en Espagne : école publique, française ou internationale ?',
    excerpt: 'Lycée français, école publique espagnole, établissement bilingue ou international… Quelles options pour vos enfants expatriés en Espagne ? Avantages, inscriptions, coûts.',
    content: `# Scolariser ses enfants en Espagne

L'un des sujets les plus importants pour les familles expatriées : comment scolariser vos enfants en Espagne ? Plusieurs options s'offrent à vous.

## L'école publique espagnole (concertada ou pública)

**Avantages :**
- Gratuit (ou quasi gratuit pour les concertadas)
- Immersion linguistique totale
- Intégration rapide dans la société espagnole

**Inconvénients :**
- Peut être difficile si l'enfant ne parle pas encore espagnol
- Qualité variable selon les établissements

**Comment s'inscrire :**
Vous avez besoin de l'empadronamiento de votre enfant. Les inscriptions se font généralement en mars-avril pour la rentrée de septembre.

## Le Lycée Français (AEFE)

L'Agence pour l'Enseignement Français à l'Étranger gère plusieurs établissements en Espagne :

- **Madrid** : Lycée Français de Madrid
- **Barcelone** : Lycée Français de Barcelone
- **Valence** : pas de lycée français homologué, mais quelques établissements proposent des sections francophones

**Avantages :**
- Continuité avec le programme français
- Baccalauréat français reconnu
- Communauté francophone

**Inconvénients :**
- Coût élevé (2 000 à 8 000 €/an selon les établissements et revenus)
- Moins d'immersion en espagnol

## Les écoles bilingues espagnol-anglais

De plus en plus populaires, ces écoles publiques ou privées proposent un enseignement en espagnol et en anglais. C'est souvent un bon compromis.

À Valence : les programmes **BRIT** (British Council) dans les écoles publiques sont très recherchés.

## Conseils pratiques

1. **Inscrivez-vous tôt** — les places dans les bonnes écoles partent vite
2. **Visitez les établissements** avant de choisir
3. **Renseignez-vous sur les activités périscolaires** — en Espagne, les journées sont souvent continues (jornada continua)
4. **Faites travailler l'espagnol l'été** avec des applications comme Duolingo

---

La communauté Vendo compte de nombreuses familles qui sont passées par là. N'hésitez pas à les contacter via notre plateforme !
`,
    category: 'conseils',
    author: 'Sophie L.',
    readTime: 6,
    lang: 'fr',
    published: true,
    publishedAt: new Date('2026-04-18'),
  },
  {
    slug: 'voiture-espagne-immatriculation-permis',
    title: 'Voiture en Espagne : immatriculation, permis de conduire et contrôle technique',
    excerpt: 'Vous avez une voiture française et vous déménagez en Espagne ? Voici tout ce qu\'il faut savoir sur la réimmatriculation, l\'échange du permis et les obligations légales.',
    content: `# Voiture en Espagne : tout ce qu'il faut savoir

Vous arrivez en Espagne avec votre voiture française ? Ou vous envisagez d'en acheter une sur place ? Voici le guide complet.

## Réimmatriculer votre voiture française

Si vous résidez en Espagne depuis plus de 30 jours avec votre véhicule immatriculé en France, vous êtes **légalement obligé** de le réimmatriculer.

**Documents nécessaires :**
- Certificat d'immatriculation (carte grise)
- Attestation de conformité européenne (CoC)
- Certificat d'immatriculation espagnol homologué
- Justificatif de résidence (empadronamiento)
- Preuve d'assurance espagnole
- Paiement des taxes (IEDMT si le véhicule est récent)

**Coût estimé :** 500 à 1 500 € selon l'âge et les émissions CO2 du véhicule.

## Acheter une voiture en Espagne

### Véhicule neuf
Achetez directement en concession. Assurez-vous d'avoir votre NIE pour l'immatriculation.

### Occasion entre particuliers
Le marché de l'occasion est actif. Vérifiez :
- Que le vendeur est bien le titulaire du certificat (permiso de circulación)
- Qu'il n'y a pas de charges sur le véhicule (vérifiez sur sede.dgt.gob.es)
- L'historique ITV (contrôle technique)

Sur **Vendo**, vous trouverez de nombreuses voitures proposées par des francophones.

## Échanger votre permis de conduire français

Les ressortissants européens **n'ont pas besoin d'échanger** leur permis de conduire. Il est valable indéfiniment en Espagne.

Si vous souhaitez quand même l'échanger (plus pratique), rendez-vous à la DGT avec votre permis français, votre NIE et votre empadronamiento.

## L'ITV (contrôle technique)

L'ITV est l'équivalent du contrôle technique français. Les fréquences :
- Véhicule < 4 ans : pas d'ITV
- 4-10 ans : tous les 2 ans
- > 10 ans : tous les ans

Les stations ITV sont appelées "Estaciones de ITV". Elles sont nombreuses dans toutes les grandes villes.

## L'assurance obligatoire

Le RC (Responsabilidad Civil) est obligatoire. En Espagne, de nombreuses compagnies proposent des tarifs très compétitifs. Comparez sur Mutua Madrileña, AXA España, Allianz España.

---

Des questions sur votre véhicule en Espagne ? Posez-les sur Vendo — notre communauté regorge de conseils pratiques !
`,
    category: 'vie-pratique',
    author: 'Marc D.',
    readTime: 7,
    lang: 'fr',
    published: true,
    publishedAt: new Date('2026-05-22'),
  },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const post of POSTS) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`⏭ Article existant : ${post.slug}`)
      skipped++
      continue
    }
    await prisma.blogPost.create({ data: post })
    console.log(`✅ Créé : ${post.slug}`)
    created++
  }

  console.log(`\nBlog seeded: ${created} créés, ${skipped} ignorés`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
