import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Page introuvable — 1000Click' },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo / brand */}
        <p className="text-5xl font-black text-orange-primary mb-2 tracking-tight">1000Click</p>

        {/* 404 number */}
        <p className="text-[120px] font-black text-navy leading-none select-none">404</p>

        {/* Message */}
        <h1 className="text-2xl font-bold text-navy mt-2 mb-3">
          Cette page n&apos;existe pas
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          L&apos;annonce a peut-être été supprimée, ou vous avez suivi un lien invalide.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/annonces"
            className="w-full sm:w-auto px-6 py-3 bg-orange-primary text-white font-bold text-sm rounded-xl hover:bg-orange-dark transition-colors"
          >
            Voir toutes les annonces
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-navy font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
