import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

const IMAGES: Record<string, string> = {
  // ── FRANÇAIS ────────────────────────────────────────────────────
  'vivre-en-espagne-demarches-essentielles':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  'louer-appartement-valence-conseils':
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  'numero-nie-espagne-guide-complet':
    'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1200&q=80',
  'scolariser-enfants-espagne':
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
  'voiture-espagne-immatriculation-permis':
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80',

  // ── ENGLISH ─────────────────────────────────────────────────────
  'moving-to-spain-complete-guide':
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
  'renting-flat-spain-tips':
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'healthcare-spain-expats':
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
  'selling-buying-second-hand-spain':
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  'learning-spanish-fast-tips':
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
  'cost-of-living-spain-2026':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',

  // ── ESPAÑOL ─────────────────────────────────────────────────────
  'guia-expatriados-espana-nie-empadronamiento':
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80',
  'alquilar-piso-valencia-consejos':
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'sanidad-espana-expatriados':
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80',
  'coste-vida-valencia-2026':
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
  'escolarizar-hijos-espana':
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',

  // ── DEUTSCH ─────────────────────────────────────────────────────
  'umzug-nach-spanien-guide-2026':
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=80',
  'wohnung-mieten-spanien-tipps':
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'gesundheitsversorgung-spanien':
    'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80',
  'lebenshaltungskosten-spanien-2026':
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
  'spanisch-lernen-tipps-expats':
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',

  // ── NEDERLANDS ──────────────────────────────────────────────────
  'verhuizen-naar-spanje-complete-gids':
    'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=1200&q=80',
  'woning-huren-spanje-tips':
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
  'zorg-spanje-expats':
    'https://images.unsplash.com/photo-1631563019676-dade0dbdb8fc?w=1200&q=80',
  'kosten-levensonderhoud-spanje-2026':
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80',
  'tweedehands-kopen-verkopen-spanje':
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
}

async function main() {
  let updated = 0
  for (const [slug, coverImage] of Object.entries(IMAGES)) {
    const result = await prisma.blogPost.updateMany({
      where: { slug },
      data: { coverImage },
    })
    if (result.count > 0) {
      console.log(`✅ Image ajoutée : ${slug}`)
      updated++
    } else {
      console.log(`⚠️  Introuvable  : ${slug}`)
    }
  }
  console.log(`\n✅ ${updated} articles mis à jour avec des images`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
