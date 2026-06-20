import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Cookie, ShieldCheck, BarChart3, Megaphone, Settings, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: "Politique cookies — Vendo",
  description: "Politique d'utilisation des cookies de Vendo. Cookies essentiels, analytiques, publicitaires et gestion des préférences.",
}

const SECTIONS = [
  { id: 'cest-quoi', label: 'Qu\'est-ce qu\'un cookie ?', icon: <Cookie size={14} /> },
  { id: 'essentiels', label: 'Cookies essentiels', icon: <ShieldCheck size={14} /> },
  { id: 'analytiques', label: 'Cookies analytiques', icon: <BarChart3 size={14} /> },
  { id: 'publicitaires', label: 'Cookies publicitaires', icon: <Megaphone size={14} /> },
  { id: 'gestion', label: 'Gérer vos préférences', icon: <Settings size={14} /> },
  { id: 'contact', label: 'Contact', icon: <Mail size={14} /> },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[200px] sm:min-h-[240px]">
        <Image src="/valencia-hero.jpg" alt="Politique cookies Vendo" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/95 via-hero-dark/75 to-hero-dark/30" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 flex flex-col justify-center min-h-[200px] sm:min-h-[240px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-2">Légal · Cookies</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">Politique cookies</h1>
          <p className="text-white/60 text-sm mt-2">Dernière mise à jour : juin 2026 — Conforme directive ePrivacy & RGPD</p>
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
                <Link href="/confidentialite" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium">
                  → Politique de confidentialité
                </Link>
                <Link href="/mentions-legales" className="flex items-center gap-1.5 text-xs text-orange-primary hover:underline font-medium">
                  → Mentions légales
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-5">

            <section id="cest-quoi" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-orange-soft flex items-center justify-center"><Cookie size={16} className="text-orange-primary" /></div>
                <h2 className="text-lg font-black text-navy">Qu&apos;est-ce qu&apos;un cookie ?</h2>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>Un <strong className="text-navy">cookie</strong> est un petit fichier texte déposé sur votre appareil (ordinateur, téléphone, tablette) par votre navigateur lors de votre visite sur un site web. Il permet de mémoriser des informations d&apos;une session à l&apos;autre.</p>
                <p>Il existe plusieurs types de cookies :</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Cookies de session', desc: 'Supprimés automatiquement à la fermeture du navigateur.' },
                    { label: 'Cookies persistants', desc: 'Conservés pendant une durée définie, même après la fermeture du navigateur.' },
                    { label: 'Cookies tiers', desc: 'Déposés par des services externes intégrés à la page (publicités, vidéos, réseaux sociaux).' },
                  ].map(c => (
                    <div key={c.label} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-navy text-xs mb-1">{c.label}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="essentiels" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><ShieldCheck size={16} className="text-emerald-600" /></div>
                <h2 className="text-lg font-black text-navy">Cookies essentiels</h2>
                <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Toujours actifs</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés sans empêcher l&apos;utilisation du service.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 text-xs font-black text-gray-400 uppercase tracking-wider">Nom du cookie</th>
                      <th className="text-left py-2 pr-4 text-xs font-black text-gray-400 uppercase tracking-wider">Finalité</th>
                      <th className="text-left py-2 text-xs font-black text-gray-400 uppercase tracking-wider">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: 'next-auth.session-token', purpose: 'Maintien de la session utilisateur après connexion', duration: '30 jours' },
                      { name: '__Secure-next-auth.session-token', purpose: 'Version sécurisée (HTTPS) du cookie de session', duration: '30 jours' },
                      { name: 'next-auth.csrf-token', purpose: 'Protection contre les attaques CSRF', duration: 'Session' },
                      { name: 'vem_lang', purpose: 'Mémorisation de la langue choisie (fr/en/es/de/nl)', duration: '1 an' },
                      { name: 'vem_cookie_consent', purpose: 'Mémorisation de vos préférences cookies', duration: '13 mois' },
                    ].map(row => (
                      <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4"><code className="text-xs bg-gray-100 text-navy px-1.5 py-0.5 rounded font-mono">{row.name}</code></td>
                        <td className="py-3 pr-4 text-gray-600 text-xs">{row.purpose}</td>
                        <td className="py-3 text-xs font-medium text-gray-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="analytiques" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart3 size={16} className="text-blue-600" /></div>
                <h2 className="text-lg font-black text-navy">Cookies analytiques</h2>
                <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Consentement requis</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ces cookies nous permettent de comprendre comment les visiteurs utilisent la plateforme, afin d&apos;améliorer l&apos;expérience utilisateur. Ils ne collectent aucune donnée personnelle identifiable.</p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-bold text-navy text-sm mb-1">Actuellement : aucun cookie analytique tiers</p>
                <p className="text-xs text-gray-600">Vendo n&apos;utilise pas encore de service d&apos;analyse tiers (Google Analytics, Plausible, etc.). Si cela venait à changer, cette politique serait mise à jour et votre consentement serait demandé.</p>
              </div>
            </section>

            <section id="publicitaires" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center"><Megaphone size={16} className="text-yellow-600" /></div>
                <h2 className="text-lg font-black text-navy">Cookies publicitaires</h2>
                <span className="ml-auto text-xs font-bold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">Consentement requis</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ces cookies permettent d&apos;afficher des publicités personnalisées correspondant à vos centres d&apos;intérêt. Ils sont déposés <strong className="text-navy">uniquement après votre accord explicite</strong>.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 text-xs font-black text-gray-400 uppercase tracking-wider">Service</th>
                      <th className="text-left py-2 pr-4 text-xs font-black text-gray-400 uppercase tracking-wider">Finalité</th>
                      <th className="text-left py-2 text-xs font-black text-gray-400 uppercase tracking-wider">Politique</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-bold text-navy text-sm">Google AdSense</td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">Publicité personnalisée, mesure de performance des annonces</td>
                      <td className="py-3">
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-primary hover:underline font-medium">
                          policies.google.com →
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Vous pouvez également personnaliser vos préférences publicitaires Google sur <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-primary hover:underline">adssettings.google.com</a>.
              </p>
            </section>

            <section id="gestion" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Settings size={16} className="text-purple-600" /></div>
                <h2 className="text-lg font-black text-navy">Gérer vos préférences</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>Vous disposez de plusieurs options pour gérer les cookies :</p>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Via Vendo',
                      desc: 'Notre bandeau de consentement apparaît à votre première visite. Vous pouvez modifier vos choix à tout moment en effaçant le cookie <code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">vem_cookie_consent</code> depuis les outils développeur de votre navigateur.',
                    },
                    {
                      title: 'Via votre navigateur',
                      desc: 'Chaque navigateur propose des paramètres de gestion des cookies : <strong>Chrome</strong> → Paramètres › Confidentialité ; <strong>Firefox</strong> → Préférences › Vie privée ; <strong>Safari</strong> → Préférences › Confidentialité.',
                    },
                    {
                      title: 'Via des outils tiers',
                      desc: 'Des extensions comme <em>uBlock Origin</em> ou <em>Privacy Badger</em> permettent de bloquer les cookies tiers de façon globale.',
                    },
                  ].map(opt => (
                    <div key={opt.title} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-navy text-sm mb-1">{opt.title}</p>
                      <p
                        className="text-xs text-gray-500 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: opt.desc }}
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-orange-soft rounded-xl p-4 border-l-4 border-orange-primary">
                  <p className="text-sm font-medium text-navy mb-1">⚠️ À noter</p>
                  <p className="text-xs text-gray-600">Désactiver les cookies essentiels empêchera la connexion à votre compte et le bon fonctionnement de la plateforme. Seuls les cookies non essentiels peuvent être refusés sans impact sur le service de base.</p>
                </div>
              </div>
            </section>

            <section id="contact" className="bg-navy rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Mail size={16} className="text-white" /></div>
                <h2 className="text-lg font-black text-white">Questions sur les cookies</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Pour toute question relative à notre utilisation des cookies, ou pour exercer vos droits RGPD en lien avec les données collectées via les cookies :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="mailto:privacy@vendo.es" className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center gap-2">
                  <Mail size={14} /> privacy@vendo.es
                </a>
                <Link href="/confidentialite" className="bg-orange-primary hover:bg-orange-dark rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center gap-2 justify-center">
                  Politique de confidentialité →
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
