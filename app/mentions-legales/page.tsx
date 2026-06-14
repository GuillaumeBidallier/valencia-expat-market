import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Server, Scale, ShieldCheck, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions légales — Vendo',
  description: 'Mentions légales de Vendo — Valencia Expat Market. Éditeur, hébergeur, propriété intellectuelle et responsabilité.',
}

const SECTIONS = [
  { id: 'editeur', label: 'Éditeur du site', icon: <Building2 size={14} /> },
  { id: 'hebergement', label: 'Hébergement', icon: <Server size={14} /> },
  { id: 'propriete', label: 'Propriété intellectuelle', icon: <Scale size={14} /> },
  { id: 'responsabilite', label: 'Responsabilité', icon: <ShieldCheck size={14} /> },
  { id: 'donnees', label: 'Données personnelles', icon: <FileText size={14} /> },
  { id: 'contact', label: 'Contact', icon: <Mail size={14} /> },
]

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[200px] sm:min-h-[240px]">
        <Image src="/valencia-hero.jpg" alt="Mentions légales Vendo" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/95 via-hero-dark/75 to-hero-dark/30" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 flex flex-col justify-center min-h-[200px] sm:min-h-[240px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">Mentions légales</h1>
          <p className="text-white/60 text-sm mt-2">Dernière mise à jour : juin 2026</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sommaire</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                    <span className="text-orange-primary">{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/confidentialite" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium">
                  → Politique de confidentialité
                </Link>
                <Link href="/cookies" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium mt-1">
                  → Politique cookies
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">

            <section id="editeur" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center"><Building2 size={16} className="text-orange-primary" /></div>
                <h2 className="text-lg font-black text-navy">Éditeur du site</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Le site <strong className="text-navy">Vendo</strong> (<span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded">valencia-expat-market.vercel.app</span>) est édité par :</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                  <p><strong className="text-navy">Dénomination :</strong> Vendo — Valencia Expat Market</p>
                  <p><strong className="text-navy">Nature :</strong> Plateforme communautaire de petites annonces entre expatriés francophones en Espagne</p>
                  <p><strong className="text-navy">Directeur de la publication :</strong> Équipe Vendo</p>
                  <p><strong className="text-navy">Email :</strong> <a href="mailto:contact@vendo.es" className="text-orange-primary hover:underline">contact@vendo.es</a></p>
                  <p><strong className="text-navy">Pays d&apos;exploitation :</strong> Espagne (Comunitat Valenciana)</p>
                </div>
              </div>
            </section>

            <section id="hebergement" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center"><Server size={16} className="text-indigo-primary" /></div>
                <h2 className="text-lg font-black text-navy">Hébergement</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Vercel Inc.', role: 'Hébergement web & CDN', detail: '340 Pine Street, San Francisco CA 94104, USA', link: 'vercel.com' },
                    { name: 'Neon Inc.', role: 'Base de données PostgreSQL', detail: 'Infrastructure déployée en Union Européenne', link: 'neon.tech' },
                    { name: 'Resend', role: 'Emails transactionnels', detail: 'Infrastructure déployée en Union Européenne', link: 'resend.com' },
                    { name: 'Pusher Ltd.', role: 'Messagerie temps réel', detail: 'Infrastructure déployée en Union Européenne', link: 'pusher.com' },
                  ].map(p => (
                    <div key={p.name} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-navy text-sm mb-1">{p.name}</p>
                      <p className="text-xs text-orange-primary font-medium mb-1">{p.role}</p>
                      <p className="text-xs text-gray-500">{p.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                  Les transferts de données vers les États-Unis sont encadrés par les clauses contractuelles types (CCT) de la Commission Européenne conformément au RGPD.
                </p>
              </div>
            </section>

            <section id="propriete" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Scale size={16} className="text-purple-600" /></div>
                <h2 className="text-lg font-black text-navy">Propriété intellectuelle</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>L&apos;ensemble des éléments constituant le site Vendo — notamment les textes, le logo, l&apos;interface graphique, les icônes, l&apos;architecture et le code source — sont protégés par le droit d&apos;auteur et, le cas échéant, par le droit des marques.</p>
                <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de l&apos;éditeur.</p>
                <div className="bg-orange-soft rounded-xl p-4 border-l-4 border-orange-primary">
                  <p className="text-sm font-medium text-navy mb-1">Contenu des utilisateurs</p>
                  <p className="text-xs text-gray-600">Les annonces publiées par les utilisateurs restent leur propriété exclusive. En les publiant sur Vendo, l&apos;utilisateur accorde à Vendo une licence non-exclusive, mondiale et gratuite d&apos;affichage, de reproduction et de diffusion sur la plateforme aux fins du service.</p>
                </div>
              </div>
            </section>

            <section id="responsabilite" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><ShieldCheck size={16} className="text-emerald-600" /></div>
                <h2 className="text-lg font-black text-navy">Responsabilité</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>Vendo est une plateforme de mise en relation entre particuliers. À ce titre :</p>
                <ul className="space-y-2 pl-4">
                  {[
                    "Vendo n'est pas partie aux transactions réalisées entre utilisateurs et n'intervient ni dans la vente ni dans le paiement.",
                    "Vendo ne peut garantir la véracité, la légalité ou la qualité des annonces publiées par les utilisateurs.",
                    "La responsabilité de Vendo ne pourra être engagée en cas de litige entre un acheteur et un vendeur.",
                    "Chaque utilisateur est seul responsable du contenu qu'il publie sur la plateforme.",
                    "Tout contenu illicite, frauduleux ou contraire aux CGU sera supprimé. Son auteur pourra être exclu et faire l'objet d'un signalement aux autorités compétentes.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>Vendo s&apos;efforce d&apos;assurer la disponibilité permanente du service mais ne peut garantir une disponibilité ininterrompue. Des interruptions pour maintenance ou pour des raisons techniques peuvent survenir.</p>
              </div>
            </section>

            <section id="donnees" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                <h2 className="text-lg font-black text-navy">Données personnelles & cookies</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Le traitement des données personnelles collectées via Vendo est effectué dans le respect du Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et de la Loi Organique Espagnole 3/2018 de Protection des Données (LOPDGDD).
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/confidentialite" className="flex-1 bg-orange-soft hover:bg-orange-100 text-orange-primary font-bold text-sm text-center px-4 py-3 rounded-xl transition-colors">
                  Politique de confidentialité →
                </Link>
                <Link href="/cookies" className="flex-1 bg-gray-50 hover:bg-gray-100 text-navy font-bold text-sm text-center px-4 py-3 rounded-xl transition-colors">
                  Politique cookies →
                </Link>
              </div>
            </section>

            <section id="contact" className="bg-navy rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Mail size={16} className="text-white" /></div>
                <h2 className="text-lg font-black text-white">Contact légal</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Pour toute question d&apos;ordre légal, pour exercer vos droits sur vos données personnelles, ou pour signaler un contenu illicite :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="mailto:contact@vendo.es" className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center gap-2">
                  <Mail size={14} /> contact@vendo.es
                </a>
                <Link href="/contact" className="bg-orange-primary hover:bg-orange-dark rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center gap-2 justify-center">
                  Formulaire de contact →
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
