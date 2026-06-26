import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { UserCheck, ClipboardList, CreditCard, MessageSquare, Clock, Ban, RotateCcw, Settings, Gavel } from 'lucide-react'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — 1000Click",
  description: "CGU de 1000Click. Règles d'utilisation de la plateforme de petites annonces pour expatriés francophones en Espagne.",
}

const SECTIONS = [
  { id: 'objet', label: 'Objet', icon: <ClipboardList size={14} /> },
  { id: 'inscription', label: 'Inscription & compte', icon: <UserCheck size={14} /> },
  { id: 'annonces', label: 'Dépôt d\'annonces', icon: <ClipboardList size={14} /> },
  { id: 'transactions', label: 'Transactions', icon: <CreditCard size={14} /> },
  { id: 'messagerie', label: 'Messagerie', icon: <MessageSquare size={14} /> },
  { id: 'duree', label: 'Durée des annonces', icon: <Clock size={14} /> },
  { id: 'interdits', label: 'Contenus interdits', icon: <Ban size={14} /> },
  { id: 'resiliation', label: 'Résiliation', icon: <RotateCcw size={14} /> },
  { id: 'modification', label: 'Modification des CGU', icon: <Settings size={14} /> },
  { id: 'droit', label: 'Droit applicable', icon: <Gavel size={14} /> },
]

export default function CguPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[200px] sm:min-h-[240px]">
        <Image src="/valencia-hero.jpg" alt="CGU 1000Click" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/95 via-hero-dark/75 to-hero-dark/30" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 flex flex-col justify-center min-h-[200px] sm:min-h-[240px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">Conditions générales d&apos;utilisation</h1>
          <p className="text-white/60 text-sm mt-2">Dernière mise à jour : juin 2026 — Version 2.0</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sommaire</p>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</span>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-5">

            <div className="bg-orange-soft border border-orange-primary/20 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed">
              <strong className="text-navy">Important :</strong> En utilisant 1000Click, vous acceptez les présentes Conditions Générales d&apos;Utilisation dans leur intégralité. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
            </div>

            <section id="objet" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
                Objet
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong className="text-navy">1000Click</strong>, service de petites annonces entre particuliers expatriés en Espagne, accessible à l&apos;adresse <span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded">valencia-expat-market.vercel.app</span>.</p>
                <p>1000Click est une plateforme de mise en relation entre particuliers permettant de publier, consulter et répondre à des annonces de vente, location ou échange de biens et services. Elle est destinée principalement à la communauté des expatriés francophones résidant en Espagne.</p>
                <p>L&apos;utilisation de 1000Click implique l&apos;acceptation pleine et entière des présentes CGU. 1000Click se réserve le droit de les modifier à tout moment.</p>
              </div>
            </section>

            <section id="inscription" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                Inscription et compte utilisateur
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                <p>L&apos;inscription sur 1000Click est <strong className="text-navy">gratuite</strong>. Pour déposer une annonce ou contacter un vendeur, vous devez créer un compte avec une adresse email valide et un mot de passe sécurisé.</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-bold text-navy text-sm mb-2">En créant un compte, vous vous engagez à :</p>
                  <ul className="space-y-1.5">
                    {[
                      "Fournir des informations exactes, complètes et à jour",
                      "Ne pas usurper l'identité d'un tiers",
                      "Conserver votre mot de passe confidentiel et ne pas le partager",
                      "Être âgé d'au moins 18 ans",
                      "N'utiliser qu'un seul compte par personne",
                      "Nous informer immédiatement en cas d'utilisation frauduleuse de votre compte",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p>1000Click se réserve le droit de suspendre ou supprimer tout compte dont les informations s&apos;avèrent fausses ou dont l&apos;utilisation est contraire aux présentes CGU.</p>
              </div>
            </section>

            <section id="annonces" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
                Dépôt d&apos;annonces
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                <p>Le dépôt d&apos;annonces est gratuit pour tout utilisateur inscrit. Chaque annonce est soumise à une modération avant publication (délai habituel : moins de 24h ouvrées).</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4 border-l-3 border-emerald-400">
                    <p className="font-bold text-emerald-800 text-sm mb-2">✅ Autorisé</p>
                    <ul className="text-xs text-emerald-700 space-y-1">
                      <li>Biens d&apos;occasion en bon état</li>
                      <li>Services entre particuliers</li>
                      <li>Location de biens mobiliers</li>
                      <li>Offres d&apos;emploi légales</li>
                      <li>Véhicules, électronique, mobilier</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border-l-3 border-red-400">
                    <p className="font-bold text-red-800 text-sm mb-2">❌ Interdit</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>Armes, munitions, explosifs</li>
                      <li>Stupéfiants et drogues</li>
                      <li>Médicaments sur ordonnance</li>
                      <li>Animaux protégés</li>
                      <li>Faux documents, contrefaçons</li>
                      <li>Contenus à caractère sexuel</li>
                      <li>Escroqueries, arnaques</li>
                    </ul>
                  </div>
                </div>
                <p>1000Click se réserve le droit de modérer, modifier ou supprimer toute annonce ne respectant pas ces règles, sans préavis et sans droit à indemnisation.</p>
              </div>
            </section>

            <section id="transactions" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">4</span>
                Transactions
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>1000Click est exclusivement une plateforme de mise en relation. Les transactions se réalisent directement entre vendeur et acheteur, en dehors de la plateforme. 1000Click :</p>
                <ul className="space-y-2 pl-4">
                  {[
                    "Ne perçoit aucune commission sur les transactions entre particuliers",
                    "N'intervient pas dans la négociation du prix",
                    "Ne garantit ni la qualité des biens vendus, ni la solvabilité des parties",
                    "Ne peut être tenu responsable d'un litige entre acheteur et vendeur",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-orange-soft rounded-xl p-4 border-l-4 border-orange-primary">
                  <p className="text-sm font-medium text-navy mb-1">💡 Conseils de sécurité</p>
                  <p className="text-xs text-gray-600">Nous vous recommandons de vous rencontrer dans un lieu public, d&apos;inspecter le bien avant paiement, et de privilégier les échanges en main propre contre espèces ou virement bancaire. Ne payez jamais à l&apos;avance pour un bien non vu.</p>
                </div>
              </div>
            </section>

            <section id="messagerie" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">5</span>
                Messagerie
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>La messagerie interne 1000Click est réservée aux échanges liés aux annonces publiées sur la plateforme.</p>
                <p><strong className="text-navy">Sont strictement interdits</strong> via la messagerie :</p>
                <ul className="space-y-1.5 pl-4">
                  {[
                    "Le spam et la prospection commerciale non sollicitée",
                    "L'envoi de liens malveillants ou de tentatives de phishing",
                    "Le harcèlement, les menaces et les propos discriminatoires",
                    "La demande de paiement en dehors de la transaction annoncée",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-red-500">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p>Tout abus de la messagerie entraînera la suspension immédiate du compte concerné.</p>
              </div>
            </section>

            <section id="duree" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">6</span>
                Durée des annonces
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Annonce active', value: '60 jours', sub: 'Puis expiration automatique' },
                    { label: 'Republication', value: 'Illimitée', sub: 'Depuis votre espace compte' },
                    { label: 'Annonce en attente', value: '7 jours', sub: 'Supprimée sans modération' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-navy mb-1">{item.value}</p>
                      <p className="text-xs font-bold text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
                <p>L&apos;utilisateur peut marquer son annonce comme « Vendue » à tout moment depuis son espace personnel, ce qui la retire des résultats de recherche tout en la conservant dans son historique.</p>
              </div>
            </section>

            <section id="interdits" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black">7</span>
                Comportements interdits
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>Les comportements suivants sont interdits et peuvent entraîner la suppression du compte et un signalement aux autorités :</p>
                <ul className="space-y-2">
                  {[
                    "Création de faux profils ou usurpation d'identité",
                    "Publication d'annonces fictives (appâts) sans intention réelle de vendre",
                    "Manipulation des prix ou arnaque à l'acheteur/vendeur",
                    "Utilisation de la plateforme à des fins de blanchiment d'argent",
                    "Tentatives de contournement des systèmes de sécurité",
                    "Scraping, crawling ou extraction automatisée de données",
                    "Publication de données personnelles de tiers sans leur consentement",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 items-start bg-red-50 rounded-xl px-4 py-3">
                      <span className="text-red-500 font-black text-sm shrink-0">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="resiliation" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">8</span>
                Résiliation
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p><strong className="text-navy">Par l&apos;utilisateur :</strong> Vous pouvez supprimer votre compte à tout moment depuis votre espace « Mon compte ». La suppression entraîne la désactivation immédiate de vos annonces actives et la suppression de vos données personnelles conformément à notre politique de confidentialité (délai légal : 1 an pour les obligations comptables et fiscales).</p>
                <p><strong className="text-navy">Par 1000Click :</strong> 1000Click se réserve le droit de suspendre ou de résilier tout compte, sans préavis et sans indemnisation, en cas de :</p>
                <ul className="space-y-1.5 pl-4">
                  {[
                    "Non-respect des présentes CGU",
                    "Activité frauduleuse ou suspecte",
                    "Signalements répétés d'autres utilisateurs",
                    "Décision judiciaire ou administrative",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="modification" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-navy mb-4">
                <span className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-xs font-black">9</span>
                Modification des CGU
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                1000Click peut modifier les présentes CGU à tout moment. Les utilisateurs sont informés par email et/ou notification sur la plateforme au moins 15 jours avant l&apos;entrée en vigueur des modifications. La poursuite de l&apos;utilisation du service après cette date vaut acceptation des nouvelles CGU.
              </p>
            </section>

            <section id="droit" className="bg-navy rounded-2xl p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-black text-white mb-4">
                <span className="w-7 h-7 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-black">10</span>
                Droit applicable et litiges
              </h2>
              <div className="text-sm text-white/70 leading-relaxed space-y-3">
                <p>Les présentes CGU sont soumises au droit espagnol et au droit de l&apos;Union Européenne. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable avant tout recours judiciaire.</p>
                <p>À défaut d&apos;accord amiable, tout litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU sera soumis aux tribunaux compétents de la Communauté Valencienne (Espagne), sauf disposition légale contraire applicable aux consommateurs.</p>
                <p className="text-white/50 text-xs">Pour les résidents français : conformément aux articles L.611-1 et suivants du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
