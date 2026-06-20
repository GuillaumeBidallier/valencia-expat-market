import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Database, Users, Clock, Globe, UserCog, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Vendo',
  description: 'Politique de confidentialité de Vendo. RGPD, données collectées, droits des utilisateurs.',
}

const SECTIONS = [
  { id: 'responsable', label: 'Responsable du traitement', icon: <ShieldCheck size={14} /> },
  { id: 'donnees', label: 'Données collectées', icon: <Database size={14} /> },
  { id: 'bases', label: 'Base légale', icon: <Globe size={14} /> },
  { id: 'conservation', label: 'Durée de conservation', icon: <Clock size={14} /> },
  { id: 'partage', label: 'Partage des données', icon: <Users size={14} /> },
  { id: 'droits', label: 'Vos droits (RGPD)', icon: <UserCog size={14} /> },
  { id: 'contact', label: 'Contact DPO', icon: <Mail size={14} /> },
]

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[200px] sm:min-h-[240px]">
        <Image src="/valencia-hero.jpg" alt="Politique de confidentialité Vendo" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/95 via-hero-dark/75 to-hero-dark/30" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 flex flex-col justify-center min-h-[200px] sm:min-h-[240px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Légal · RGPD</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">Politique de confidentialité</h1>
          <p className="text-white/60 text-sm mt-2">Dernière mise à jour : juin 2026 — Conforme RGPD (UE 2016/679) & LOPDGDD</p>
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
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                <Link href="/cookies" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium">
                  → Politique cookies
                </Link>
                <Link href="/mentions-legales" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium">
                  → Mentions légales
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-5">

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Vendo s&apos;engage à ne jamais vendre vos données personnelles et à ne les utiliser que dans le cadre strictement nécessaire au fonctionnement de la plateforme.
              </p>
            </div>

            <section id="responsable" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center"><ShieldCheck size={16} className="text-orange-primary" /></div>
                <h2 className="text-lg font-black text-navy">Responsable du traitement</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                <p><strong className="text-navy">Nom :</strong> Vendo</p>
                <p><strong className="text-navy">Statut :</strong> Plateforme communautaire de petites annonces</p>
                <p><strong className="text-navy">Pays d&apos;exploitation :</strong> Espagne (Comunitat Valenciana)</p>
                <p><strong className="text-navy">Contact DPO :</strong> <a href="mailto:privacy@vendo.es" className="text-orange-primary hover:underline">privacy@vendo.es</a></p>
                <p><strong className="text-navy">Autorité de contrôle espagnole :</strong> AEPD — <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-orange-primary hover:underline">aepd.es</a></p>
                <p><strong className="text-navy">Autorité française :</strong> CNIL — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-orange-primary hover:underline">cnil.fr</a></p>
              </div>
            </section>

            <section id="donnees" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Database size={16} className="text-blue-600" /></div>
                <h2 className="text-lg font-black text-navy">Données collectées</h2>
              </div>
              <div className="space-y-3">
                {[
                  { category: 'Compte utilisateur', color: 'bg-orange-soft', data: 'Nom, adresse email, mot de passe (hashé bcrypt), photo de profil (optionnel)', purpose: 'Identification, connexion et gestion du compte' },
                  { category: 'Annonces', color: 'bg-blue-50', data: 'Titre, description, prix, photos, catégorie, localisation approximative', purpose: 'Publication et référencement des annonces' },
                  { category: 'Messagerie', color: 'bg-purple-50', data: 'Contenu des messages, horodatage, identifiants des parties', purpose: 'Communication entre acheteurs et vendeurs' },
                  { category: 'Données techniques', color: 'bg-gray-50', data: 'Adresse IP, navigateur, système d\'exploitation, logs de connexion', purpose: 'Sécurité, détection des fraudes, débogage' },
                  { category: 'Préférences', color: 'bg-emerald-50', data: 'Langue choisie, consentement cookies, favoris', purpose: 'Personnalisation de l\'expérience utilisateur' },
                ].map(row => (
                  <div key={row.category} className={`${row.color} rounded-xl p-4`}>
                    <p className="font-bold text-navy text-sm mb-1">{row.category}</p>
                    <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Données :</span> {row.data}</p>
                    <p className="text-xs text-gray-500"><span className="font-medium">Finalité :</span> {row.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="bases" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center"><Globe size={16} className="text-indigo-primary" /></div>
                <h2 className="text-lg font-black text-navy">Base légale des traitements</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {[
                  { label: 'Exécution du contrat', desc: 'Données indispensables à la fourniture du service (compte, annonces, messages)', badge: 'Art. 6.1.b RGPD' },
                  { label: 'Intérêt légitime', desc: 'Sécurité de la plateforme, lutte contre la fraude, amélioration du service', badge: 'Art. 6.1.f RGPD' },
                  { label: 'Consentement', desc: 'Cookies publicitaires et analytiques tiers — révocable à tout moment', badge: 'Art. 6.1.a RGPD' },
                ].map(b => (
                  <div key={b.label} className="bg-gray-50 rounded-xl p-4">
                    <span className="text-xs font-black text-orange-primary bg-orange-soft px-2 py-0.5 rounded-full">{b.badge}</span>
                    <p className="font-bold text-navy text-sm mt-2 mb-1">{b.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="conservation" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Clock size={16} className="text-amber-600" /></div>
                <h2 className="text-lg font-black text-navy">Durée de conservation</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Compte utilisateur actif', duration: 'Durée d\'utilisation + 1 an' },
                  { label: 'Compte supprimé par l\'utilisateur', duration: '30 jours (suppression définitive)' },
                  { label: 'Annonces expirées ou supprimées', duration: '30 jours (suppression définitive)' },
                  { label: 'Messages échangés', duration: '2 ans après le dernier message' },
                  { label: 'Logs de connexion et sécurité', duration: '12 mois maximum' },
                  { label: 'Données de facturation (si applicable)', duration: '10 ans (obligation comptable)' },
                  { label: 'Consentement cookies', duration: '13 mois maximum (CNIL)' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className="text-xs font-bold text-navy bg-gray-50 px-2.5 py-1 rounded-full shrink-0">{row.duration}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="partage" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Users size={16} className="text-purple-600" /></div>
                <h2 className="text-lg font-black text-navy">Partage des données</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <strong className="text-navy">Vos données ne sont jamais vendues.</strong> Elles peuvent être partagées uniquement avec les sous-traitants techniques suivants, dans le cadre strictement nécessaire :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'Vercel Inc.', role: 'Hébergement', zone: '🇺🇸 USA (CCT UE)', color: 'border-orange-200' },
                  { name: 'Neon Inc.', role: 'Base de données', zone: '🇪🇺 Union Européenne', color: 'border-blue-200' },
                  { name: 'Resend', role: 'Emails transactionnels', zone: '🇪🇺 Union Européenne', color: 'border-blue-200' },
                  { name: 'Pusher Ltd.', role: 'Messagerie temps réel', zone: '🇪🇺 Union Européenne', color: 'border-blue-200' },
                  { name: 'Google AdSense', role: 'Publicités (avec consentement)', zone: '🇺🇸 USA (CCT UE)', color: 'border-yellow-200' },
                ].map(p => (
                  <div key={p.name} className={`border ${p.color} rounded-xl p-4 bg-white`}>
                    <p className="font-bold text-navy text-sm">{p.name}</p>
                    <p className="text-xs text-orange-primary font-medium">{p.role}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.zone}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Les transferts hors UE sont encadrés par les Clauses Contractuelles Types (CCT) approuvées par la Commission Européenne.
              </p>
            </section>

            <section id="droits" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><UserCog size={16} className="text-emerald-600" /></div>
                <h2 className="text-lg font-black text-navy">Vos droits (RGPD)</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Conformément au RGPD et à la LOPDGDD espagnole, vous disposez des droits suivants :</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { right: 'Droit d\'accès', desc: 'Obtenir une copie de toutes vos données personnelles détenues par Vendo.', art: 'Art. 15' },
                  { right: 'Droit de rectification', desc: 'Corriger des données inexactes ou incomplètes vous concernant.', art: 'Art. 16' },
                  { right: 'Droit à l\'effacement', desc: 'Supprimer votre compte et vos données (« droit à l\'oubli »).', art: 'Art. 17' },
                  { right: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré et lisible par machine.', art: 'Art. 20' },
                  { right: 'Droit d\'opposition', desc: 'Vous opposer aux traitements basés sur l\'intérêt légitime.', art: 'Art. 21' },
                  { right: 'Retrait du consentement', desc: 'Retirer votre consentement aux cookies non essentiels à tout moment.', art: 'Art. 7' },
                ].map(r => (
                  <div key={r.right} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-navy text-sm">{r.right}</p>
                      <span className="text-xs text-gray-400 font-mono">{r.art}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-orange-soft rounded-xl p-4 text-sm">
                <p className="font-medium text-navy mb-1">Comment exercer vos droits ?</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Envoyez votre demande à <a href="mailto:privacy@vendo.es" className="text-orange-primary hover:underline font-medium">privacy@vendo.es</a> en précisant votre identité et le droit que vous souhaitez exercer. Réponse garantie sous 30 jours calendaires. En cas de non-réponse satisfaisante, vous pouvez saisir l&apos;AEPD (Espagne) ou la CNIL (France).
                </p>
              </div>
            </section>

            <section id="contact" className="bg-navy rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Mail size={16} className="text-white" /></div>
                <h2 className="text-lg font-black text-white">Contact — Délégué à la Protection des Données</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Pour toute question relative à cette politique, pour exercer vos droits ou pour signaler une violation de données :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="mailto:privacy@vendo.es" className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center gap-2">
                  <Mail size={14} /> privacy@vendo.es
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
