'use client'
import { useMemo } from 'react'

interface Ad {
  id: number
  title: string
  description: string
  url: string
  cta: string
  color: string
  emoji: string
}

const ADS: Ad[] = [
  {
    id: 1,
    title: 'Immo Valencia Francophone',
    description: 'Votre agence immobilière francophone à Valencia. Location & vente. Accompagnement complet pour expatriés.',
    url: 'immovalencia.es',
    cta: 'Voir les biens',
    color: '#1A5FA0',
    emoji: '🏠',
  },
  {
    id: 2,
    title: 'Trans-Expat Déménagements',
    description: 'Déménagement international France ↔ Espagne. Devis gratuit en 24h. Stockage disponible.',
    url: 'transexpat.com',
    cta: 'Devis gratuit',
    color: '#E8571A',
    emoji: '🚚',
  },
  {
    id: 3,
    title: 'École Française de Valencia',
    description: 'Scolarité en français de la maternelle au bac. Homologuée AEFE. Inscriptions ouvertes.',
    url: 'ecolevfr.es',
    cta: 'En savoir plus',
    color: '#0D7C3A',
    emoji: '📚',
  },
  {
    id: 4,
    title: 'AssurExpat — Assurance Santé',
    description: 'Mutuelle santé pour expatriés en Espagne. Remboursement rapide, assistance 24h/24 en français.',
    url: 'assurexpat.com',
    cta: 'Mon devis',
    color: '#7C3AED',
    emoji: '🩺',
  },
  {
    id: 5,
    title: 'Compta Valencia — Experts comptables',
    description: 'Déclarations fiscales, création de société, conseil patrimonial. Spécialiste des non-résidents.',
    url: 'comptavalencia.es',
    cta: 'Prendre RDV',
    color: '#854D0E',
    emoji: '📊',
  },
  {
    id: 6,
    title: 'Conciergerie Valencia',
    description: 'Services à domicile en français : ménage, jardinage, aide administrative, courses. Dès 15€/h.',
    url: 'conciergevalencia.es',
    cta: 'Réserver',
    color: '#0F766E',
    emoji: '🔑',
  },
  {
    id: 7,
    title: 'EspagnoFrance — Cours d\'espagnol',
    description: 'Apprenez l\'espagnol avec des profs natifs. Cours particuliers ou groupes, online ou présentiel.',
    url: 'espagnofrance.es',
    cta: 'Essai gratuit',
    color: '#B91C1C',
    emoji: '🗣️',
  },
  {
    id: 8,
    title: 'Valencia Kids Club',
    description: 'Activités extrascolaires en français pour enfants 3-14 ans. Sport, arts, informatique.',
    url: 'valenciakids.es',
    cta: 'Programme',
    color: '#D97706',
    emoji: '🎨',
  },
]

type AdSize = 'banner' | 'rectangle' | 'inline'

interface AdUnitProps {
  size?: AdSize
  seed?: number
  className?: string
}

export default function AdUnit({ size = 'inline', seed = 0, className = '' }: AdUnitProps) {
  const ad = useMemo(() => ADS[seed % ADS.length], [seed])
  const ad2 = useMemo(() => ADS[(seed + 1) % ADS.length], [seed])

  if (size === 'rectangle') {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Annonce</span>
          <span className="text-[10px] text-gray-400">Google Ads</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: ad.color + '20' }}>
              {ad.emoji}
            </div>
            <div>
              <p className="font-bold text-navy text-sm leading-tight">{ad.title}</p>
              <p className="text-[11px] text-green-700">{ad.url}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">{ad.description}</p>
          <button className="w-full text-white text-xs font-semibold px-3 py-2 rounded" style={{ backgroundColor: ad.color }}>
            {ad.cta}
          </button>
        </div>
      </div>
    )
  }

  if (size === 'banner') {
    return (
      <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
        <div className="flex items-center justify-end px-3 py-0.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] text-gray-400">Annonce</span>
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5">
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: ad.color + '20' }}>
            {ad.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-navy text-sm">{ad.title}</p>
            <p className="text-xs text-gray-500 truncate">{ad.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-green-700 hidden sm:block">{ad.url}</span>
            <button className="text-white text-xs font-semibold px-4 py-1.5 rounded whitespace-nowrap" style={{ backgroundColor: ad.color }}>
              {ad.cta}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // inline — 2 ads side by side
  return (
    <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-gray-200">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Annonces sponsorisées</span>
        <span className="text-[10px] text-gray-400">Google Ads</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {[ad, ad2].map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: a.color + '20' }}>
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy text-xs leading-tight">{a.title}</p>
              <p className="text-[11px] text-green-700 mb-0.5">{a.url}</p>
              <p className="text-[11px] text-gray-500 line-clamp-2">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
