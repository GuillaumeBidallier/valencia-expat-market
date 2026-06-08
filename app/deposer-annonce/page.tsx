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
          <h2 className="font-semibold text-navy">Informations de l&apos;annonce</h2>
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
          <p className="text-xs text-gray-400 mb-4">Jusqu&apos;à 8 photos. La première sera l&apos;image principale.</p>
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
          <h2 className="font-semibold text-navy">Localisation &amp; contact</h2>
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
          {loading ? 'Publication en cours...' : "Publier l'annonce"}
        </Button>
      </form>
    </div>
  )
}
