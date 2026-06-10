import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function AnnonceEnAttentePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={32} className="text-orange-primary" />
        </div>
        <h1 className="text-xl font-black text-navy mb-2">Annonce en cours de vérification</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Votre annonce a bien été reçue. Elle sera publiée dès qu&apos;un administrateur l&apos;aura validée,
          généralement sous <strong>24 heures</strong>.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Vous recevrez une notification une fois votre annonce en ligne.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/annonces"
            className="bg-orange-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-dark transition-colors"
          >
            Voir les annonces
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-navy transition-colors py-1"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
