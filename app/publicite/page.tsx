import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  BarChart3, Target, Users, Globe, Monitor, Sidebar, AlignJustify, LayoutGrid,
  CheckCircle, Star, Zap, Mail, ArrowRight, TrendingUp, MapPin, Languages
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Publicité & visibilité professionnelle — Vendo',
  description: 'Touchez la communauté des expatriés francophones en Espagne. Formats display, annonces sponsorisées, fiche professionnelle — solutions sur mesure pour les pros.',
}

const FORMATS = [
  {
    id: 'skyscraper',
    name: 'Colonne latérale',
    icon: <Sidebar size={20} />,
    color: 'bg-indigo-soft',
    iconColor: 'text-indigo-primary',
    positions: 'Colonnes gauche et droite des pages annonces et accueil',
    size: '208 × 600 px',
    visibility: 'Très haute — présent en permanence pendant la navigation',
    slots: 4,
    desc: 'Votre fiche professionnelle apparaît dans les colonnes latérales sur desktop, visible tout au long de la navigation. Jusqu\'à 4 pros affichés simultanément.',
  },
  {
    id: 'banner',
    name: 'Bannière principale',
    icon: <AlignJustify size={20} />,
    color: 'bg-orange-soft',
    iconColor: 'text-orange-primary',
    positions: 'Au-dessus de la grille des annonces (page d\'accueil & /annonces)',
    size: 'Full width × 56 px',
    visibility: 'Maximale — premier élément vu avant les annonces',
    slots: 1,
    desc: 'Votre nom, logo et description s\'affichent en pleine largeur au-dessus des annonces. Le format le plus visible de la plateforme.',
  },
  {
    id: 'inline',
    name: 'Annonces intégrées',
    icon: <LayoutGrid size={20} />,
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    positions: 'Insérées dans la grille des annonces (après la 4e annonce)',
    size: '2 cartes côte à côte — full width',
    visibility: 'Haute — contexte de navigation active des acheteurs',
    slots: 2,
    desc: 'Deux fiches pros intégrées naturellement dans la liste des annonces. Idéal pour capter l\'attention des acheteurs en pleine phase de recherche.',
  },
  {
    id: 'rectangle',
    name: 'Rectangle contextuel',
    icon: <Monitor size={20} />,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    positions: 'Pages de détail des annonces (sidebar)',
    size: '300 × 250 px',
    visibility: 'Ciblée — affiché aux visiteurs d\'une annonce spécifique',
    slots: 1,
    desc: 'Votre fiche apparaît sur les pages de détail des annonces. Le format idéal pour un ciblage thématique (ex : déménagement → fiche trans-expat).',
  },
]

const TIERS = [
  {
    name: 'Standard',
    price: 'Gratuit',
    period: '',
    color: 'border-gray-200',
    badge: '',
    badgeColor: '',
    features: [
      { ok: true,  label: 'Fiche professionnelle visible' },
      { ok: true,  label: 'Page dédiée sur /professionnels' },
      { ok: true,  label: 'Lien vers votre site web' },
      { ok: false, label: 'Affichage dans les encarts pub' },
      { ok: false, label: 'Badge "Sponsorisé"' },
      { ok: false, label: 'Mise en avant prioritaire' },
      { ok: false, label: 'Badge "Recommandé"' },
      { ok: false, label: 'Statistiques de clics' },
    ],
    cta: 'Créer ma fiche gratuite',
    ctaHref: '/inscription',
    ctaStyle: 'bg-gray-100 hover:bg-gray-200 text-navy',
  },
  {
    name: 'Premium',
    price: '49 €',
    period: '/ mois',
    color: 'border-orange-primary',
    badge: 'Populaire',
    badgeColor: 'bg-orange-primary text-white',
    features: [
      { ok: true,  label: 'Fiche professionnelle visible' },
      { ok: true,  label: 'Page dédiée sur /professionnels' },
      { ok: true,  label: 'Lien vers votre site web' },
      { ok: true,  label: 'Affichage dans les encarts pub' },
      { ok: true,  label: 'Badge "Sponsorisé"' },
      { ok: true,  label: 'Mise en avant prioritaire' },
      { ok: false, label: 'Badge "Recommandé"' },
      { ok: false, label: 'Statistiques de clics' },
    ],
    cta: 'Passer à Premium',
    ctaHref: '/contact',
    ctaStyle: 'bg-orange-primary hover:bg-orange-dark text-white',
  },
  {
    name: 'Premium+',
    price: '99 €',
    period: '/ mois',
    color: 'border-indigo-primary',
    badge: 'Meilleure visibilité',
    badgeColor: 'bg-indigo-primary text-white',
    features: [
      { ok: true,  label: 'Fiche professionnelle visible' },
      { ok: true,  label: 'Page dédiée sur /professionnels' },
      { ok: true,  label: 'Lien vers votre site web' },
      { ok: true,  label: 'Affichage dans les encarts pub' },
      { ok: true,  label: 'Badge "Sponsorisé"' },
      { ok: true,  label: 'Mise en avant prioritaire' },
      { ok: true,  label: 'Badge "Recommandé"' },
      { ok: true,  label: 'Statistiques de clics (bientôt)' },
    ],
    cta: 'Passer à Premium+',
    ctaHref: '/contact',
    ctaStyle: 'bg-indigo-primary hover:bg-indigo-dark text-white',
  },
]

const STATS = [
  { value: '5 000+', label: 'Visiteurs/mois', icon: <Users size={20} />, color: 'text-orange-primary' },
  { value: '5 pays', label: 'Langues couvertes', icon: <Languages size={20} />, color: 'text-indigo-primary' },
  { value: 'Valencia', label: 'Communauté locale', icon: <MapPin size={20} />, color: 'text-emerald-600' },
  { value: '100%', label: 'Audience expat ciblée', icon: <Target size={20} />, color: 'text-purple-600' },
]

const CATEGORIES = [
  { icon: '🏠', label: 'Immobilier' },
  { icon: '⚖️', label: 'Juridique & fiscal' },
  { icon: '📊', label: 'Comptabilité' },
  { icon: '🚚', label: 'Déménagement' },
  { icon: '🛡️', label: 'Assurance' },
  { icon: '🏥', label: 'Santé' },
  { icon: '🚗', label: 'Automobiles' },
  { icon: '📚', label: 'Éducation' },
  { icon: '🔧', label: 'Services & artisans' },
  { icon: '💼', label: 'Autres pros' },
]

const FAQ = [
  {
    q: 'Qui voit mes publicités ?',
    a: 'Exclusivement la communauté Vendo : expatriés et francophones installés en Espagne, principalement en Comunitat Valenciana. Une audience qualifiée qui cherche activement des services locaux.'
  },
  {
    q: 'Comment fonctionne le système d\'affichage ?',
    a: 'L\'API ads de Vendo sélectionne aléatoirement les professionnels Premium et Premium+ pour remplir les encarts. Tous les pros éligibles ont une chance équitable d\'apparaître à chaque chargement de page.'
  },
  {
    q: 'Puis-je cibler une catégorie ou une zone ?',
    a: 'Oui. Votre fiche peut être associée à une ou plusieurs catégories. Certains encarts filtrent par catégorie (ex : les publicités sur une annonce de déménagement affichent en priorité les pros "Déménagement").'
  },
  {
    q: 'Comment activer mon abonnement Premium ?',
    a: 'Créez d\'abord votre fiche gratuite depuis /inscription, puis contactez-nous via le formulaire. Nous activons votre tier Premium manuellement après confirmation.'
  },
  {
    q: 'Y a-t-il un engagement de durée ?',
    a: 'Non. Les abonnements Premium et Premium+ sont mensuels, sans engagement. Vous pouvez annuler à tout moment depuis votre espace ou en nous contactant.'
  },
  {
    q: 'Quand serai-je visible après mon activation ?',
    a: 'Immédiatement après activation par notre équipe (généralement dans les 24h ouvrées). Votre fiche apparaîtra dans les encarts dès le prochain chargement de page des visiteurs.'
  },
]

export default function PublicitePage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[300px] sm:min-h-[380px]">
        <Image src="/valencia-hero.jpg" alt="Publicité Vendo" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/92 via-hero-dark/65 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/60" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex flex-col justify-center min-h-[300px] sm:min-h-[380px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Professionnels</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 max-w-2xl">
            Touchez les expatriés<br />là où ils cherchent
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mb-8">
            Vendo est la plateforme de référence pour la communauté francophone en Espagne. Affichez votre activité devant une audience ultra-ciblée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black px-6 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-primary/30">
              Demander un devis <ArrowRight size={16} />
            </Link>
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-colors border border-white/20">
              Créer une fiche gratuite
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center text-center gap-2">
                <span className={s.color}>{s.icon}</span>
                <span className="text-2xl font-black text-white">{s.value}</span>
                <span className="text-xs text-white/50 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-16">

        {/* Audience */}
        <section>
          <div className="text-center mb-8">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">L&apos;audience</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-3">Une communauté unique et qualifiée</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Les visiteurs Vendo sont des expatriés actifs avec un fort pouvoir d&apos;achat, qui ont besoin de services locaux de confiance.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <Target size={22} className="text-orange-primary" />,
                title: 'Audience ultra-ciblée',
                desc: '100 % expatriés en Espagne. Pas de trafic générique — uniquement des personnes qui vivent ou s\'installent en Espagne et ont besoin de services locaux.',
              },
              {
                icon: <Globe size={22} className="text-indigo-primary" />,
                title: 'Multilingue',
                desc: 'Français, anglais, espagnol, allemand, néerlandais. Notre audience internationale cherche des pros capables de les servir dans leur langue.',
              },
              {
                icon: <TrendingUp size={22} className="text-emerald-600" />,
                title: 'En pleine croissance',
                desc: 'La communauté des expatriés en Espagne est l\'une des plus dynamiques d\'Europe. Vendo grandit avec elle, mois après mois.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-black text-navy text-base mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qui peut annoncer */}
        <section>
          <div className="text-center mb-8">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Secteurs</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-3">Qui peut annoncer sur Vendo ?</h2>
            <p className="text-gray-500 text-sm">Toute activité professionnelle utile à la vie des expatriés.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <div key={cat.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-orange-primary/40 hover:shadow-sm transition-all">
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-bold text-navy leading-tight">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Formats */}
        <section>
          <div className="text-center mb-8">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Formats</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-3">Quatre formats d&apos;affichage</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Votre fiche professionnelle s&apos;affiche dans les encarts selon votre tier. Tous les formats sont actifs simultanément pour les abonnés Premium.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {FORMATS.map(f => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center`}>
                    <span className={f.iconColor}>{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-navy text-base">{f.name}</h3>
                    <p className="text-xs text-gray-400">{f.size}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{f.desc}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-400 font-medium w-20 shrink-0">Position</span>
                    <span className="text-gray-600">{f.positions}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-400 font-medium w-20 shrink-0">Visibilité</span>
                    <span className="text-gray-600">{f.visibility}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-400 font-medium w-20 shrink-0">Slots</span>
                    <span className="text-navy font-bold">{f.slots} simultané{f.slots > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">
          <div className="text-center mb-10">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500 text-sm">Être visible sur Vendo en 4 étapes.</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-6 relative">
            <div className="hidden sm:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-primary/20 via-orange-primary to-orange-primary/20" />
            {[
              { n: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous sur Vendo gratuitement — moins de 2 minutes.' },
              { n: '2', title: 'Complétez votre fiche', desc: 'Logo, description, coordonnées, zones d\'intervention.' },
              { n: '3', title: 'Choisissez votre offre', desc: 'Standard (gratuit), Premium ou Premium+. Contactez-nous.' },
              { n: '4', title: 'Soyez visible', desc: 'Votre fiche apparaît dans les encarts dès activation — sans délai.' },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-primary flex items-center justify-center mb-4 shadow-lg shadow-orange-primary/25 z-10">
                  <span className="text-xl font-black text-white">{step.n}</span>
                </div>
                <p className="font-black text-navy text-sm mb-2">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tarifs */}
        <section>
          <div className="text-center mb-8">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Tarifs</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mb-3">Des offres simples et transparentes</h2>
            <p className="text-gray-500 text-sm">Sans engagement. Annulez à tout moment.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TIERS.map(tier => (
              <div key={tier.name} className={`bg-white rounded-2xl border-2 ${tier.color} p-6 flex flex-col relative`}>
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                )}
                <div className="mb-5">
                  <p className="font-black text-navy text-lg mb-1">{tier.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-navy">{tier.price}</span>
                    <span className="text-sm text-gray-400 mb-1">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map(f => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.ok
                        ? <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        : <span className="w-[15px] h-[15px] rounded-full border-2 border-gray-200 shrink-0 mt-0.5" />
                      }
                      <span className={f.ok ? 'text-gray-700' : 'text-gray-300'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.ctaHref} className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3 rounded-xl transition-colors ${tier.ctaStyle}`}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Les prix sont indicatifs. Contactez-nous pour un devis personnalisé ou un tarif annuel.
          </p>
        </section>

        {/* Avantages clés */}
        <section className="grid sm:grid-cols-2 gap-5">
          {[
            {
              icon: <Zap size={20} className="text-orange-primary" />,
              bg: 'bg-orange-soft',
              title: 'Activation rapide',
              desc: 'Votre fiche est créée en moins de 5 minutes. Après confirmation de votre abonnement, vous êtes visible dans les encarts sous 24h.',
            },
            {
              icon: <BarChart3 size={20} className="text-indigo-primary" />,
              bg: 'bg-indigo-soft',
              title: 'Trafic qualifié',
              desc: 'Contrairement aux plateformes généralistes, chaque visiteur Vendo est un expatrié en Espagne — exactement votre cible.',
            },
            {
              icon: <Star size={20} className="text-amber-500" />,
              bg: 'bg-amber-50',
              title: 'Badge de confiance',
              desc: 'Le badge "Recommandé" (Premium+) distingue votre fiche et renforce la confiance des visiteurs.',
            },
            {
              icon: <Globe size={20} className="text-emerald-600" />,
              bg: 'bg-emerald-50',
              title: 'Portée internationale',
              desc: 'Vendo est disponible en 5 langues. Votre fiche est visible par tous les expatriés, quelle que soit leur langue.',
            },
          ].map(item => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="font-black text-navy text-base mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-8">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-2xl font-black text-navy">Questions fréquentes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer">
                <summary className="flex items-start justify-between gap-3 font-bold text-navy text-sm list-none">
                  {q}
                  <span className="text-gray-400 shrink-0 group-open:rotate-180 transition-transform text-lg leading-none mt-0.5">↓</span>
                </summary>
                <p className="text-sm text-gray-500 leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-navy rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Prêt ?</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Devenez visible dès aujourd&apos;hui</h2>
          <p className="text-white/60 text-sm max-w-lg mx-auto mb-8">
            Rejoignez les professionnels qui font confiance à Vendo pour toucher la communauté des expatriés en Espagne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 justify-center bg-orange-primary hover:bg-orange-dark text-white font-black px-8 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-primary/30"
            >
              <Mail size={16} /> Contactez-nous
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-colors border border-white/20"
            >
              Créer ma fiche gratuite →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
