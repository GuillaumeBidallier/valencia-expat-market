import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de Vendo — Valencia Expat Market',
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="text-sm text-orange-primary hover:underline mb-6 block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-black text-navy mb-8">Mentions légales</h1>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Éditeur du site</h2>
          <p>
            Le site <strong>Vendo</strong> (valencia-expat-market.vercel.app) est édité par :<br />
            <strong>Vendo — Valencia Expat Market</strong><br />
            Communauté des expatriés francophones en Espagne<br />
            Email : <a href="mailto:contact@vendo.es" className="text-orange-primary hover:underline">contact@vendo.es</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Hébergement</h2>
          <p>
            Le site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-primary hover:underline">vercel.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, logo, interface) est protégé par le droit d'auteur.
            Toute reproduction, même partielle, est interdite sans autorisation préalable écrite de l'éditeur.
          </p>
          <p>
            Les annonces publiées par les utilisateurs restent la propriété de leurs auteurs. En les publiant sur Vendo,
            l'utilisateur accorde à Vendo une licence non-exclusive d'affichage et de diffusion sur la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Responsabilité</h2>
          <p>
            Vendo est une plateforme de mise en relation entre particuliers. Vendo n'est pas partie aux transactions
            réalisées entre utilisateurs et décline toute responsabilité quant au contenu des annonces, à la qualité des
            biens proposés ou au déroulement des transactions.
          </p>
          <p>
            L'utilisateur est seul responsable du contenu qu'il publie. Tout contenu illicite sera supprimé et son
            auteur pourra être exclu de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans notre{' '}
            <Link href="/confidentialite" className="text-orange-primary hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">Cookies</h2>
          <p>
            Notre utilisation des cookies est décrite dans notre{' '}
            <Link href="/cookies" className="text-orange-primary hover:underline">Politique cookies</Link>.
          </p>
        </section>

        <p className="text-xs text-gray-400">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  )
}
