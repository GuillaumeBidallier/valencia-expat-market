import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const site = await prisma.site.upsert({
    where: { domain: '1000clic.fr' },
    update: {},
    create: { domain: '1000clic.fr', name: '1000Click Valencia', country: 'Espagne' },
  })

  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { siteId_email: { siteId: site.id, email: 'demo-immo@vendo.es' } },
    update: {},
    create: { name: 'Costa Immo Conseil', email: 'demo-immo@vendo.es', passwordHash, siteId: site.id },
  })

  const existingPro = await prisma.professional.findUnique({ where: { userId: user.id } })
  const pro = existingPro ?? await prisma.professional.create({
    data: {
      siteId: site.id,
      userId: user.id,
      slug: 'costa-immo-conseil',
      name: 'Costa Immo Conseil',
      category: 'immobilier',
      city: 'Valencia',
      description: 'Agence immobilière francophone à Valencia — accompagnement complet pour expatriés : achat, vente et location.',
      phone: '+34 634 567 890',
      whatsapp: '+34 634 567 890',
      tier: 'FREE',
      zones: { create: [{ zone: 'Valencia' }, { zone: 'Ruzafa' }, { zone: 'Benimaclet' }] },
    },
  })

  const LISTINGS = [
    {
      id: 'seed-immo-1',
      title: 'Appartement 4 pièces rénové avec balcon — Ruzafa',
      description: 'Bel appartement lumineux de 85 m² au 3e étage avec ascenseur, entièrement rénové. Balcon exposé sud, climatisation réversible, cuisine équipée. Idéal pour une famille, à deux pas des commerces de Ruzafa.',
      price: 245000,
      categorySlug: 'vente-appartements',
      city: 'Valencia',
      neighborhood: 'Ruzafa',
      lat: 39.4622, lng: -0.3772,
      attributes: {
        type_bien: ['appartement'],
        surface_habitable: 85,
        type_vente: 'classique',
        pieces: 4,
        chambres: 2,
        etage: '3',
        ascenseur: 'oui',
        exterieur: ['balcon'],
        exposition: ['sud'],
        caracteristiques: ['climatisation', 'cuisine_equipee', 'parking_garage'],
        etat_bien: 'bon_etat',
        classe_energie: 'C',
      },
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
      ],
    },
    {
      id: 'seed-immo-2',
      title: 'Maison avec piscine et jardin — Campanar',
      description: 'Grande maison familiale de 180 m² sur terrain de 600 m², avec piscine privée et jardin arboré. 4 chambres, double garage, climatisation dans toutes les pièces. Quartier calme et résidentiel.',
      price: 395000,
      categorySlug: 'vente-maisons',
      city: 'Valencia',
      neighborhood: 'Campanar',
      lat: 39.4810, lng: -0.4000,
      attributes: {
        type_bien: ['maison'],
        surface_habitable: 180,
        type_vente: 'classique',
        surface_terrain: 600,
        pieces: 6,
        chambres: 4,
        exterieur: ['jardin', 'terrasse'],
        exposition: ['sud', 'ouest'],
        caracteristiques: ['piscine', 'climatisation', 'parking_garage', 'alarme'],
        etat_bien: 'bon_etat',
        classe_energie: 'D',
      },
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      ],
    },
    {
      id: 'seed-immo-3',
      title: 'Appartement meublé 3 pièces à louer — Benimaclet',
      description: 'Appartement meublé de 60 m² au 2e étage avec ascenseur, proche université et transports. Cuisine équipée, wifi inclus, climatisation. Disponible immédiatement, bail d\'un an.',
      price: 750,
      categorySlug: 'location-appartements',
      city: 'Valencia',
      neighborhood: 'Benimaclet',
      lat: 39.4820, lng: -0.3630,
      attributes: {
        type_bien: ['appartement'],
        surface_habitable: 60,
        pieces: 3,
        chambres: 1,
        etage: '2',
        ascenseur: 'oui',
        caracteristiques: ['meuble', 'wifi', 'climatisation', 'cuisine_equipee'],
        etat_bien: 'bon_etat',
      },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      ],
    },
    {
      id: 'seed-immo-4',
      title: 'Terrain constructible viabilisé — El Carmen',
      description: 'Terrain plat de 1200 m², viabilisé et constructible, dans un secteur recherché. Idéal pour projet de construction de villa. Étude de sol disponible sur demande.',
      price: 120000,
      categorySlug: 'vente-terrains',
      city: 'Valencia',
      neighborhood: 'El Carmen',
      lat: 39.4750, lng: -0.3780,
      attributes: {
        type_bien: ['terrain'],
        surface_terrain: 1200,
        type_vente: 'classique',
        caracteristiques: ['constructible', 'viabilise', 'plat'],
      },
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      ],
    },
  ]

  for (const { images, ...data } of LISTINGS) {
    await prisma.listing.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...data,
        phone: pro.phone,
        userId: user.id,
        siteId: site.id,
        images: { create: images.map((url, order) => ({ url, order })) },
      },
    })
  }

  console.log(`✅ Pro "${pro.name}" (${pro.slug}) + ${LISTINGS.length} annonces immobilières créées.`)
  console.log(`   Connexion : ${user.email} / demo1234`)
}

main().finally(() => prisma.$disconnect())
