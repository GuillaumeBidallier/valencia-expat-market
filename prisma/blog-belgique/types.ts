export type BlogSeedPost = {
  slug: string
  lang: 'fr' | 'en' | 'es' | 'de' | 'nl'
  title: string
  excerpt: string
  content: string
  category: 'guide' | 'conseils' | 'vie-pratique'
  topic: 'installation' | 'location' | 'sante' | 'ecole' | 'voiture' | 'cout-de-la-vie' | 'seconde-main' | 'langues'
  readTime: number
  publishedAt: string
}
