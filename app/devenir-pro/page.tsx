import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CheckCircle, ArrowRight, Zap, Star, Users, Globe,
  TrendingUp, Shield, CreditCard, MapPin, Building2, Phone,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Devenir Pro sur Vendo — Touchez les expatriés en Espagne',
  description: 'Créez votre fiche professionnelle sur Vendo et devenez visible auprès de milliers d\'expatriés francophones installés en Espagne. Premium dès 49 €/mois.',
}

/* ─── Animation keyframes ─────────────────────────────────────────────────── */
const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0   rgba(232,87,26,0.45); }
    70%  { box-shadow: 0 0 0 14px rgba(232,87,26,0);   }
    100% { box-shadow: 0 0 0 0   rgba(232,87,26,0);    }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50%       { background-position: 100% 50%; }
  }

  .au { animation: fadeUp    0.65s cubic-bezier(.22,.68,0,1.2) both; }
  .ai { animation: fadeIn    0.65s ease both; }
  .as { animation: scaleIn   0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .ar { animation: slideRight 0.6s cubic-bezier(.22,.68,0,1.2) both; }

  .d1  { animation-delay: .05s; }  .d2  { animation-delay: .15s; }
  .d3  { animation-delay: .25s; }  .d4  { animation-delay: .35s; }
  .d5  { animation-delay: .45s; }  .d6  { animation-delay: .55s; }
  .d7  { animation-delay: .65s; }  .d8  { animation-delay: .75s; }
  .d9  { animation-delay: .9s;  }  .d10 { animation-delay: 1.05s; }

  .btn-cta {
    background: linear-gradient(90deg, #E8571A 0%, #ff7a3d 40%, #E8571A 80%, #ff7a3d 100%);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
    transition: transform .2s, box-shadow .2s;
  }
  .btn-cta:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 16px 40px rgba(232,87,26,.45);
  }

  .card-float { animation: float 4s ease-in-out infinite; }
  .card-float-2 { animation: float 4.5s ease-in-out 0.4s infinite; }

  .step-num {
    animation: pulseRing 2.5s ease-out infinite;
  }

  .gradient-text {
    background: linear-gradient(135deg, #E8571A 0%, #ff9a5c 50%, #4F46E5 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 4s ease infinite;
  }

  .hero-grid {
    background-image:
      linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .glow-orange {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,87,26,.35) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }
  .glow-indigo {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(79,70,229,.3) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
  }

  .price-card {
    transition: transform .25s cubic-bezier(.22,.68,0,1.2), box-shadow .25s ease;
  }
  .price-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(0,0,0,.12);
  }

  .step-card {
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .step-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,.08);
  }

  .trust-badge {
    transition: transform .2s ease;
  }
  .trust-badge:hover { transform: scale(1.04); }
`

/* ─── Data ────────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    n: '01',
    icon: <Building2 size={22} />,
    title: 'Créez votre fiche',
    desc: 'Nom, catégorie, ville, description — tout se remplit en 3 minutes depuis notre wizard guidé.',
    color: 'bg-orange-soft',
    iconColor: 'text-orange-primary',
  },
  {
    n: '02',
    icon: <Phone size={22} />,
    title: 'Ajoutez vos coordonnées',
    desc: 'Téléphone, WhatsApp, site web, zones d\'intervention. Chaque info est optionnelle.',
    color: 'bg-indigo-soft',
    iconColor: 'text-indigo-primary',
  },
  {
    n: '03',
    icon: <CreditCard size={22} />,
    title: 'Choisissez votre offre',
    desc: 'Premium ou Premium+. Mensuel sans engagement, ou annuel avec 2 mois offerts. Paiement via Stripe.',
    color: 'bg-orange-soft',
    iconColor: 'text-orange-primary',
  },
  {
    n: '04',
    icon: <Zap size={22} />,
    title: 'Soyez visible immédiatement',
    desc: 'Dès la confirmation du paiement, votre fiche apparaît dans tous les encarts publicitaires.',
    color: 'bg-indigo-soft',
    iconColor: 'text-indigo-primary',
  },
]

const PREMIUM_FEATURES = [
  'Fiche professionnelle dédiée',
  'Affichage dans tous les encarts pub',
  'Badge "Sponsorisé"',
  'Mise en avant prioritaire',
  'Lien vers votre site web',
  'Page sur /professionnels',
]

const PREMIUM_PLUS_FEATURES = [
  'Tout ce qu\'inclut Premium',
  'Badge "Recommandé" exclusif',
  'Visibilité maximale garantie',
  'Priorité sur les pros Premium',
  'Statistiques de clics (bientôt)',
  'Support prioritaire',
]

const TRUST = [
  { icon: <Shield size={18} />, label: 'Paiement sécurisé', sub: 'via Stripe' },
  { icon: <TrendingUp size={18} />, label: 'Sans engagement', sub: 'résiliable à tout moment' },
  { icon: <Users size={18} />, label: 'Communauté active', sub: 'expatriés qualifiés' },
  { icon: <Globe size={18} />, label: '7 langues', sub: 'audience internationale' },
  { icon: <MapPin size={18} />, label: 'Valencia & España', sub: 'marché ciblé' },
]

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function DevenirProPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden hero-grid" style={{ background: '#1A1F36', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Glow orbs */}
        <div className="glow-orange" style={{ width: 500, height: 500, top: -100, right: -100 }} />
        <div className="glow-indigo" style={{ width: 400, height: 400, bottom: -80, left: '10%' }} />

        {/* Floating accent cards — desktop only */}
        <div className="card-float hidden lg:block absolute right-[8%] top-[18%] bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-4 text-white text-xs" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="font-bold text-emerald-300 text-[11px] uppercase tracking-wider">Nouveau client</span>
          </div>
          <p className="font-black text-base text-white">+1 contact WhatsApp</p>
          <p className="text-white/50 text-[11px]">il y a 4 minutes</p>
        </div>

        <div className="card-float-2 hidden lg:block absolute right-[6%] bottom-[20%] bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-primary/20 flex items-center justify-center">
              <Star size={18} className="text-orange-primary" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-white/50">Votre visibilité</p>
              <p className="font-black text-white text-sm">× 8 ce mois</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-24 w-full">

          {/* Badge */}
          <div className="au d1 inline-flex items-center gap-2 bg-orange-primary/15 border border-orange-primary/30 text-orange-primary rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-pulse inline-block" />
            Inscription 100 % en ligne
          </div>

          {/* Headline */}
          <h1 className="au d2 font-black text-white leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', maxWidth: '720px' }}>
            Devenez la référence<br />
            <span className="gradient-text">des expatriés</span><br />
            en Espagne
          </h1>

          {/* Subtext */}
          <p className="au d3 text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
            Vendo connecte les professionnels avec une communauté de milliers d&apos;expatriés francophones installés en Espagne — une audience qualifiée qui cherche activement vos services.
          </p>

          {/* CTAs */}
          <div className="au d4 flex flex-col sm:flex-row gap-4 items-start">
            <Link
              href="/mon-compte/profil-pro/create"
              className="btn-cta inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-orange-primary/30"
            >
              Créer ma fiche pro <ArrowRight size={18} />
            </Link>
            <Link
              href="/professionnels"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold px-6 py-4 rounded-2xl border border-white/15 hover:border-white/30 transition-colors text-sm"
            >
              Voir les pros existants →
            </Link>
          </div>

          {/* Quick stats */}
          <div className="au d5 flex flex-wrap gap-6 mt-14">
            {[
              { val: '49 €', label: 'dès /mois' },
              { val: '4 min', label: 'pour créer votre fiche' },
              { val: '0', label: 'engagement requis' },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{s.val}</span>
                <span className="text-white/40 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AUDIENCE PROOF BAR
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <p className="text-center text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Pourquoi Vendo</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { icon: <Users size={20} className="text-orange-primary" />, val: 'Croissante', label: 'Audience qualifiée' },
              { icon: <Globe size={20} className="text-indigo-primary" />, val: '7 langues', label: 'Communauté multilingue' },
              { icon: <MapPin size={20} className="text-orange-primary" />, val: 'Valencia', label: 'Cœur de marché' },
              { icon: <TrendingUp size={20} className="text-indigo-primary" />, val: 'Rapide', label: 'Croissance mois après mois' },
            ].map((s, i) => (
              <div key={s.label} className={`as d${i + 1} flex flex-col items-center text-center gap-2`}>
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center mb-1">{s.icon}</div>
                <span className="text-xl font-black text-navy">{s.val}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════════ */}
      <section className="bg-[#f7f8fa] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="au text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Processus</p>
            <h2 className="au d1 text-3xl sm:text-4xl font-black text-navy mb-4">Comment ça marche ?</h2>
            <p className="au d2 text-gray-500 text-base max-w-md mx-auto">De zéro à visible en 4 étapes. Moins de 5 minutes.</p>
          </div>

          {/* Desktop — horizontal timeline */}
          <div className="hidden sm:grid grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5"
              style={{ background: 'linear-gradient(90deg, #E8571A22, #E8571A, #4F46E5, #4F46E522)' }} />

            {STEPS.map((step, i) => (
              <div key={step.n} className={`step-card as d${i + 2} flex flex-col items-center text-center`}>
                <div className="step-num w-16 h-16 rounded-full bg-white border-2 border-orange-primary flex items-center justify-center mb-5 relative z-10 shadow-lg">
                  <span className="font-black text-orange-primary text-sm">{step.n}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center mb-3 ${step.iconColor}`}>
                  {step.icon}
                </div>
                <p className="font-black text-navy text-sm mb-2">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile — vertical */}
          <div className="sm:hidden space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`step-card au d${i + 1} bg-white rounded-2xl border border-gray-100 p-5 flex gap-4`}>
                <div className="step-num w-12 h-12 rounded-full bg-orange-primary/10 border-2 border-orange-primary flex items-center justify-center shrink-0">
                  <span className="font-black text-orange-primary text-xs">{step.n}</span>
                </div>
                <div>
                  <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center mb-2 ${step.iconColor}`}>
                    {step.icon}
                  </div>
                  <p className="font-black text-navy text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Tarifs</p>
            <h2 className="text-3xl sm:text-4xl font-black text-navy mb-4">Simple et transparent</h2>
            <p className="text-gray-500 text-base max-w-sm mx-auto">Mensuel sans engagement ou annuel avec 2 mois offerts.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Premium */}
            <div className="price-card as d2 relative bg-white rounded-3xl border-2 border-orange-primary p-7 flex flex-col">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-primary text-white text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
                Populaire
              </span>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-soft flex items-center justify-center">
                  <Zap size={18} className="text-orange-primary" />
                </div>
                <span className="font-black text-navy text-lg">Premium</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-navy">49 €</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>
              <p className="text-emerald-600 text-xs font-semibold mb-6">ou 490 €/an — 2 mois offerts</p>
              <ul className="space-y-3 flex-1 mb-7">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/mon-compte/profil-pro/create"
                className="btn-cta w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl text-sm"
              >
                Commencer avec Premium <ArrowRight size={15} />
              </Link>
            </div>

            {/* Premium+ */}
            <div className="price-card as d3 relative rounded-3xl border-2 border-indigo-primary p-7 flex flex-col" style={{ background: '#1A1F36' }}>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-primary text-white text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
                Meilleure visibilité
              </span>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
                  <Star size={18} className="text-indigo-primary" fill="currentColor" />
                </div>
                <span className="font-black text-white text-lg">Premium+</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-white">99 €</span>
                <span className="text-white/50 text-sm">/mois</span>
              </div>
              <p className="text-emerald-400 text-xs font-semibold mb-6">ou 990 €/an — 2 mois offerts</p>
              <ul className="space-y-3 flex-1 mb-7">
                {PREMIUM_PLUS_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CheckCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/mon-compte/profil-pro/create"
                className="w-full flex items-center justify-center gap-2 bg-indigo-primary hover:bg-indigo-dark text-white font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                Commencer avec Premium+ <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stripe note */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
            <CreditCard size={13} />
            <span>Paiement sécurisé par Stripe · Annulation en un clic · Aucun engagement</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST SIGNALS
      ══════════════════════════════════════════ */}
      <section className="bg-[#f7f8fa] py-14 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {TRUST.map((t, i) => (
              <div key={t.label} className={`trust-badge as d${i + 1} bg-white border border-gray-100 rounded-2xl px-5 py-3.5 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center text-orange-primary shrink-0">
                  {t.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-navy">{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 px-4" style={{ background: '#1A1F36' }}>
        <div className="glow-orange" style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="hero-grid absolute inset-0 opacity-50" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="au text-orange-primary text-xs font-black uppercase tracking-widest mb-4">Prêt ?</p>
          <h2 className="au d1 text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Lancez-vous en<br /><span className="gradient-text">4 minutes</span>
          </h2>
          <p className="au d2 text-white/50 text-base mb-10 max-w-lg mx-auto">
            Rejoignez les professionnels qui font confiance à Vendo pour toucher la communauté internationale des expatriés en Espagne.
          </p>
          <div className="au d3">
            <Link
              href="/mon-compte/profil-pro/create"
              className="btn-cta inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg shadow-2xl shadow-orange-primary/30"
            >
              Créer ma fiche pro <ArrowRight size={20} />
            </Link>
          </div>
          <p className="au d4 text-white/30 text-xs mt-6">Sans engagement · Paiement sécurisé Stripe</p>
        </div>
      </section>
    </>
  )
}
