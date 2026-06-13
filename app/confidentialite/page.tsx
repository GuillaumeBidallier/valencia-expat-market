import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de Vendo — Valencia Expat Market',
}

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="text-sm text-orange-primary hover:underline mb-6 block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-black text-navy mb-8">Politique de confidentialité</h1>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <p>
          Vendo attache une grande importance à la protection de vos données personnelles. Cette politique décrit
          quelles données nous collectons, pourquoi, et comment vous pouvez exercer vos droits.
        </p>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">1. Responsable du traitement</h2>
          <p>
            Vendo — Valencia Expat Market<br />
            Contact : <a href="mailto:privacy@vendo.es" className="text-orange-primary hover:underline">privacy@vendo.es</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">2. Données collectées</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-navy">Données</th>
                <th className="text-left py-2 font-semibold text-navy">Finalité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Nom, email, mot de passe (hashé)', 'Création et gestion du compte'],
                ['Annonces (titre, description, prix, photos)', 'Publication sur la plateforme'],
                ['Messages internes', 'Communication entre utilisateurs'],
                ['Adresse IP, logs de connexion', 'Sécurité et lutte contre la fraude'],
                ['Cookies de session', 'Maintien de la connexion'],
                ['Cookies publicitaires (avec consentement)', 'Affichage de publicités pertinentes'],
              ].map(([data, purpose], i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-gray-700">{data}</td>
                  <td className="py-2 text-gray-600">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">3. Base légale</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Exécution du contrat</strong> : données nécessaires au fonctionnement du service (compte, annonces, messages)</li>
            <li><strong>Intérêt légitime</strong> : sécurité, lutte contre la fraude, amélioration du service</li>
            <li><strong>Consentement</strong> : cookies publicitaires et analytiques</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">4. Durée de conservation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Compte utilisateur : jusqu'à suppression du compte + 1 an (obligations légales)</li>
            <li>Annonces : jusqu'à expiration ou suppression + 30 jours</li>
            <li>Messages : 2 ans après la dernière interaction</li>
            <li>Logs de sécurité : 12 mois</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">5. Partage des données</h2>
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Vercel</strong> (hébergement) — États-Unis, clause contractuelle type UE</li>
            <li><strong>Neon</strong> (base de données) — Union Européenne</li>
            <li><strong>Resend</strong> (emails transactionnels) — Union Européenne</li>
            <li><strong>Pusher</strong> (notifications temps réel) — Union Européenne</li>
            <li><strong>Google AdSense</strong> (publicités) — avec votre consentement uniquement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-2">6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Rectification</strong> : corriger des données inexactes</li>
            <li><strong>Effacement</strong> : supprimer votre compte et vos données</li>
            <li><strong>Portabilité</strong> : recevoir vos données dans un format structuré</li>
            <li><strong>Opposition</strong> : vous opposer à certains traitements</li>
            <li><strong>Retrait du consentement</strong> : pour les cookies non essentiels</li>
          </ul>
          <p className="mt-2">
            Pour exercer vos droits : <a href="mailto:privacy@vendo.es" className="text-orange-primary hover:underline">privacy@vendo.es</a>.
            Réponse sous 30 jours. Vous pouvez également contacter la CNIL (cnil.fr) ou votre autorité nationale de protection des données.
          </p>
        </section>

        <p className="text-xs text-gray-400">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  )
}
