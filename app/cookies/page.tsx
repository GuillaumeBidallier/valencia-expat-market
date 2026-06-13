import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique cookies',
  description: "Politique d'utilisation des cookies de Vendo",
}

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="text-sm text-orange-primary hover:underline mb-6 block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-black text-navy mb-8">Politique cookies</h1>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite. Cette page explique
          comment Vendo les utilise et comment vous pouvez gérer vos préférences.
        </p>

        <section>
          <h2 className="text-lg font-bold text-navy mb-3">Cookies essentiels</h2>
          <p className="mb-3">Ces cookies sont nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-navy w-1/3">Cookie</th>
                <th className="text-left py-2 pr-4 font-semibold text-navy">Finalité</th>
                <th className="text-left py-2 font-semibold text-navy">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">next-auth.session-token</td>
                <td className="py-2 pr-4">Maintien de la session utilisateur</td>
                <td className="py-2">30 jours</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">vem_lang</td>
                <td className="py-2 pr-4">Mémorisation de la langue choisie</td>
                <td className="py-2">1 an</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">vem_cookie_consent</td>
                <td className="py-2 pr-4">Mémorisation de votre choix cookies</td>
                <td className="py-2">1 an</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-3">Cookies publicitaires (avec consentement)</h2>
          <p className="mb-3">Ces cookies sont déposés uniquement si vous avez accepté. Ils permettent d'afficher des publicités pertinentes.</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-navy w-1/3">Service</th>
                <th className="text-left py-2 pr-4 font-semibold text-navy">Finalité</th>
                <th className="text-left py-2 font-semibold text-navy">En savoir plus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 pr-4">Google AdSense</td>
                <td className="py-2 pr-4">Publicité personnalisée</td>
                <td className="py-2">
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-primary hover:underline">
                    Politique Google
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Gérer vos préférences</h2>
          <p>
            Vous pouvez modifier votre choix à tout moment en effaçant le cookie <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">vem_cookie_consent</code> de votre navigateur,
            ou en utilisant les paramètres de confidentialité de votre navigateur.
          </p>
          <p className="mt-2">
            Pour exercer vos droits sur les données collectées via les cookies :{' '}
            <a href="mailto:privacy@vendo.es" className="text-orange-primary hover:underline">privacy@vendo.es</a>
          </p>
        </section>

        <p className="text-xs text-gray-400">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  )
}
