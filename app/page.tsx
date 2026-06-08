import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Users, PenLine, Phone, Handshake } from 'lucide-react'
import SearchBar from '@/components/listings/SearchBar'
import CategoryGrid from '@/components/listings/CategoryGrid'
import ListingCard from '@/components/listings/ListingCard'
import Button from '@/components/ui/Button'
import { mockListings } from '@/data/listings'

const steps = [
  { icon: Users, title: '1. Inscrivez-vous', desc: 'Créez votre compte gratuitement en 2 minutes.' },
  { icon: PenLine, title: '2. Publiez vos annonces', desc: "Déposez autant d'annonces que vous voulez, avec photos et description." },
  { icon: Phone, title: '3. Contactez facilement', desc: 'Contactez les vendeurs directement via WhatsApp ou par téléphone.' },
  { icon: Handshake, title: '4. Rencontrez-vous', desc: 'Les échanges et paiements se font uniquement en main propre.' },
]

export default function HomePage() {
  const featured = mockListings.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-soft via-white to-orange-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-navy leading-tight mb-4">
                Achetez, vendez et donnez{' '}
                <span className="text-orange-primary">une seconde vie</span>{' '}
                à vos affaires entre expatriés à Valencia.
              </h1>
              <p className="text-gray-500 text-lg mb-8">Le site <strong className="text-navy">gratuit</strong> des petites annonces entre expatriés à Valencia.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/annonces"><Button size="lg" variant="secondary">Voir les annonces</Button></Link>
                <Link href="/#comment-ca-marche"><Button size="lg" variant="outline">Comment ça marche ?</Button></Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop"
                alt="Valencia City of Arts and Sciences"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
          {/* SearchBar */}
          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-navy mb-6">Parcourez les catégories</h2>
        <CategoryGrid />
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy">Annonces à la une</h2>
          <Link href="/annonces" className="text-orange-primary text-sm font-semibold hover:underline flex items-center gap-1">
            Voir toutes les annonces <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* B2B Banner */}
      <section className="bg-orange-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">📣 Vous êtes une entreprise locale ?</p>
            <h3 className="text-white font-bold text-xl">Touchez la communauté des expatriés à Valencia !</h3>
            <p className="text-white/80 text-sm mt-1">Réservez votre emplacement publicitaire dès maintenant.</p>
          </div>
          <Button variant="outline" className="border-white text-white hover:bg-white/10 shrink-0">
            Voir nos offres pub
          </Button>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-navy mb-10 text-center">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-orange-soft' : 'bg-violet-soft'}`}>
                <step.icon size={24} className={i % 2 === 0 ? 'text-orange-primary' : 'text-violet-primary'} />
              </div>
              <h3 className="font-bold text-navy text-sm">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA communauté */}
      <section className="bg-gradient-to-r from-violet-primary to-orange-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Rejoignez la communauté Valencia Expat Market !</h2>
          <p className="text-white/80 mb-8">Des centaines d&apos;expatriés nous font déjà confiance. C&apos;est gratuit.</p>
          <Link href="/inscription"><Button size="lg" className="bg-white text-orange-primary hover:bg-gray-100">S&apos;inscrire gratuitement</Button></Link>
        </div>
      </section>
    </div>
  )
}
