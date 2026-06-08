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
