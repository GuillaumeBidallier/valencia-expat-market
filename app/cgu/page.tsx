import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "CGU de Vendo — Valencia Expat Market",
}

export default function CguPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="text-sm text-orange-primary hover:underline mb-6 block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-black text-navy mb-8">Conditions générales d'utilisation</h1>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-navy mb-2">1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme
            <strong> Vendo</strong>, service de petites annonces entre particuliers expatriés en Espagne.
            En utilisant Vendo, vous acceptez les présentes CGU dans leur intégralité.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">2. Inscription et compte utilisateur</h2>
          <p>L'inscription sur Vendo est gratuite. Pour déposer ou répondre à une annonce, vous devez créer un compte avec une adresse e-mail valide et un mot de passe.</p>
          <p>Vous vous engagez à :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fournir des informations exactes et à jour</li>
            <li>Ne pas usurper l'identité d'un tiers</li>
            <li>Garder votre mot de passe confidentiel</li>
            <li>Être âgé d'au moins 18 ans</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">3. Dépôt d'annonces</h2>
          <p>Chaque utilisateur peut déposer des annonces dans le respect des règles suivantes :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Les annonces doivent décrire honnêtement le bien ou service proposé</li>
            <li>Sont interdits : armes, drogues, médicaments sur ordonnance, animaux protégés, contenus à caractère sexuel, escroqueries</li>
            <li>Une annonce doit correspondre à un seul bien ou service</li>
            <li>La publication en masse (spam) est interdite</li>
          </ul>
          <p>Vendo se réserve le droit de modérer, modifier ou supprimer toute annonce sans préavis.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">4. Transactions</h2>
          <p>
            Vendo est exclusivement une plateforme de mise en relation. Les transactions se font directement entre
            vendeur et acheteur, en dehors de la plateforme. Vendo ne perçoit aucune commission et n'intervient
            pas dans le paiement. Nous recommandons les échanges et paiements en main propre.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">5. Messagerie</h2>
          <p>
            Le service de messagerie interne est réservé aux échanges liés aux annonces. Tout usage commercial
            non sollicité (spam, prospection) est interdit et entraînera la suppression du compte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">6. Durée des annonces</h2>
          <p>
            Une annonce active est automatiquement expirée au bout de 60 jours. L'utilisateur peut la republier
            depuis son espace compte. Les annonces en attente de modération sont supprimées après 7 jours sans réponse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">7. Résiliation</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis votre espace personnel. Vendo se réserve le droit
            de résilier tout compte qui ne respecterait pas les présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">8. Modification des CGU</h2>
          <p>
            Vendo peut modifier les présentes CGU à tout moment. Les utilisateurs sont informés par email ou
            notification sur la plateforme. La poursuite de l'utilisation du service vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">9. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver
            une solution amiable avant tout recours judiciaire.
          </p>
        </section>

        <p className="text-xs text-gray-400">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  )
}
