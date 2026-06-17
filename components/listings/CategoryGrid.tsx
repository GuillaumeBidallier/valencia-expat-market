import Link from 'next/link'
import { getCategoriesServer } from '@/lib/categories'

export default async function CategoryGrid() {
  const categories = await getCategoriesServer()
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
