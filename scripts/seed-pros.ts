import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DIRECT_URL!)

const pros = [
  {
    id: 'pro_1', slug: 'cabinet-martin-immobilier', name: 'Cabinet Martin Immobilier',
    category: 'immobilier', city: 'Valencia', tier: 'PREMIUM_PLUS', verified: true, featured: true,
    description: 'Spécialiste de l\'immobilier pour les expatriés francophones à Valencia. Achat, vente, location. Plus de 15 ans d\'expérience.',
    phone: '+34 963 000 111', whatsapp: '+34963000111', website: 'https://example.com',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
    photos: '{"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop","https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop"}',
  },
  {
    id: 'pro_2', slug: 'garcia-asociados-juridique', name: 'García & Asociados — Avocats',
    category: 'juridique', city: 'Valencia', tier: 'PREMIUM_PLUS', verified: true, featured: true,
    description: 'Cabinet bilingue franco-espagnol. Droit des étrangers, NIE, résidence, contrats, successions et droit immobilier.',
    phone: '+34 963 000 222', whatsapp: '+34963000222', website: 'https://example.com',
    logo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    photos: '{}',
  },
  {
    id: 'pro_3', slug: 'expat-moves-demenagement', name: 'Expat Moves Valencia',
    category: 'demenagement', city: 'Valencia', tier: 'PREMIUM_PLUS', verified: true, featured: false,
    description: 'Déménagement international et local. Emballage professionnel, stockage, assurance incluse. Devis gratuit en 24h.',
    phone: '+34 963 000 333', whatsapp: '+34963000333', website: null,
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    photos: '{}',
  },
  {
    id: 'pro_4', slug: 'comptaexpat-fiscalite', name: 'ComptaExpat — Fiscal & Comptabilité',
    category: 'comptabilite', city: 'Valencia', tier: 'PREMIUM', verified: true, featured: false,
    description: 'Déclarations fiscales, modèle 720, IRPF, comptabilité d\'entreprise. Spécialisé expatriés francophones.',
    phone: '+34 963 000 444', whatsapp: null, website: 'https://example.com',
    logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
    photos: '{}',
  },
  {
    id: 'pro_5', slug: 'clinique-francophone-sante', name: 'Clinique Valencia Francophone',
    category: 'sante', city: 'Valencia', tier: 'PREMIUM', verified: true, featured: false,
    description: 'Médecins généralistes et spécialistes francophones. Consultations en français, espagnol et anglais.',
    phone: '+34 963 000 555', whatsapp: '+34963000555', website: null,
    logo: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop',
    photos: '{}',
  },
  {
    id: 'pro_6', slug: 'assur-expat-assurance', name: 'AssurExpat Espagne',
    category: 'assurance', city: 'Alicante', tier: 'PREMIUM', verified: false, featured: false,
    description: 'Assurance habitation, auto, santé et responsabilité civile pour expatriés. Gestion des sinistres en français.',
    phone: '+34 965 000 111', whatsapp: '+34965000111', website: 'https://example.com',
    logo: null,
    photos: '{}',
  },
  {
    id: 'pro_7', slug: 'autoexpat-automobiles', name: 'AutoExpat Valencia',
    category: 'automobiles', city: 'Valencia', tier: 'FREE', verified: false, featured: false,
    description: 'Immatriculation de véhicules étrangers, achat/vente de voitures d\'occasion.',
    phone: '+34 963 000 777', whatsapp: null, website: null,
    logo: null,
    photos: '{}',
  },
  {
    id: 'pro_8', slug: 'french-school-education', name: 'École Française de Valencia',
    category: 'education', city: 'Valencia', tier: 'PREMIUM_PLUS', verified: true, featured: true,
    description: 'Cours de soutien scolaire en français, préparation au brevet et baccalauréat français. Enfants et adultes.',
    phone: '+34 963 000 888', whatsapp: '+34963000888', website: 'https://example.com',
    logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop',
    photos: '{}',
  },
]

async function main() {
  for (const p of pros) {
    await sql`
      INSERT INTO "Professional" (id, slug, name, category, city, tier, verified, featured, description, phone, whatsapp, website, logo, photos, "createdAt", "updatedAt")
      VALUES (
        ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.city},
        ${p.tier}::"ProTier",
        ${p.verified}, ${p.featured},
        ${p.description ?? null}, ${p.phone ?? null}, ${p.whatsapp ?? null},
        ${p.website ?? null}, ${p.logo ?? null},
        ${p.photos}::text[],
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, tier = EXCLUDED.tier,
        description = EXCLUDED.description, verified = EXCLUDED.verified,
        featured = EXCLUDED.featured, "updatedAt" = NOW()
    `
  }
  console.log(`✅ ${pros.length} professionnels insérés/mis à jour`)
}

main().catch(e => { console.error(e); process.exit(1) })
