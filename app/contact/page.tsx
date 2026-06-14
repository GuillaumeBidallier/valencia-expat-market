import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, MessageCircle, Clock, MapPin, ChevronDown } from 'lucide-react'
import ContactForm from './ContactForm'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Contact — Vendo',
  description: 'Contactez l\'équipe Vendo. Nous sommes là pour vous aider avec vos questions sur la plateforme, vos annonces ou votre vie d\'expatrié en Espagne.',
  alternates: { canonical: `${BASE}/contact` },
}

const FAQ = [
  {
    q: "Comment déposer une annonce ?",
    a: "Créez un compte gratuitement, puis cliquez sur « Déposer une annonce » en haut de la page. Votre annonce sera vérifiée par notre équipe sous 24h avant publication."
  },
  {
    q: "La plateforme est-elle vraiment gratuite ?",
    a: "Oui, le dépôt d'annonces est entièrement gratuit. Nous proposons des options Premium payantes (plus de photos, mise en avant) pour ceux qui souhaitent augmenter leur visibilité."
  },
  {
    q: "Je n'arrive pas à me connecter à mon compte. Que faire ?",
    a: "Utilisez la fonction « Mot de passe oublié » sur la page de connexion. Si le problème persiste, contactez-nous via ce formulaire avec l'email de votre compte."
  },
  {
    q: "Comment signaler une annonce frauduleuse ?",
    a: "Cliquez sur le bouton « Signaler » présent sur chaque annonce. Notre équipe de modération examinera le signalement sous 24h. Vous pouvez aussi nous contacter directement."
  },
  {
    q: "Je suis professionnel. Comment référencer mon activité ?",
    a: "Rendez-vous dans « Mon compte » > « Profil professionnel » pour créer votre fiche. Nos offres Premium et Premium+ offrent une visibilité maximale auprès des expatriés."
  },
  {
    q: "Comment fonctionne la messagerie Vendo ?",
    a: "La messagerie est disponible sur chaque annonce. Une fois connecté, cliquez sur « Contacter le vendeur ». Les échanges restent sur la plateforme pour votre sécurité."
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[280px] sm:min-h-[320px]">
        <Image
          src="/valencia-hero.jpg"
          alt="Contact Vendo"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/92 via-hero-dark/65 to-hero-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-dark/40 via-transparent to-hero-dark/60" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col justify-center min-h-[280px] sm:min-h-[320px]">
          <p className="text-orange-primary text-xs font-black uppercase tracking-widest mb-3">Vendo</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">Contactez-nous</h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl">Notre équipe répond à toutes vos questions sur la plateforme et la vie d&apos;expatrié en Espagne.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: info cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-soft flex items-center justify-center shrink-0">
                <Mail size={18} className="text-orange-primary" />
              </div>
              <div>
                <p className="font-black text-navy text-sm mb-1">Email</p>
                <a href="mailto:contact@vendo.es" className="text-orange-primary text-sm hover:underline font-medium">contact@vendo.es</a>
                <p className="text-xs text-gray-400 mt-1">Réponse sous 24-48h ouvrées</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#e7f9ef] flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-[#25D366]" />
              </div>
              <div>
                <p className="font-black text-navy text-sm mb-1">WhatsApp</p>
                <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer" className="text-[#25D366] text-sm hover:underline font-medium">+34 600 000 000</a>
                <p className="text-xs text-gray-400 mt-1">Disponible lun–ven 9h–18h (CET)</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center shrink-0">
                <Clock size={18} className="text-indigo-primary" />
              </div>
              <div>
                <p className="font-black text-navy text-sm mb-1">Horaires de support</p>
                <p className="text-sm text-gray-500">Lundi – Vendredi</p>
                <p className="text-sm text-gray-500">9h00 – 18h00 (heure de Valencia)</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-soft flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-orange-primary" />
              </div>
              <div>
                <p className="font-black text-navy text-sm mb-1">Communauté basée à</p>
                <p className="text-sm text-gray-500">Valencia, España</p>
                <p className="text-xs text-gray-400 mt-1">Présence dans toute l&apos;Espagne</p>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-navy rounded-2xl p-5 space-y-3">
              <p className="text-xs font-black text-white/50 uppercase tracking-widest">Accès rapide</p>
              {[
                { label: 'Déposer une annonce', href: '/deposer-annonce' },
                { label: 'Voir les professionnels', href: '/professionnels' },
                { label: 'Consulter le blog', href: '/blog' },
                { label: 'Mes annonces', href: '/mon-compte' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="flex items-center justify-between text-white/70 hover:text-white text-sm transition-colors group">
                  <span>{label}</span>
                  <ChevronDown size={13} className="-rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-black text-navy mb-1">Envoyez-nous un message</h2>
            <p className="text-sm text-gray-400 mb-6">Tous les champs marqués d&apos;un * sont obligatoires.</p>
            <ContactForm />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-orange-primary uppercase tracking-widest mb-2">Questions fréquentes</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy">Les réponses à vos questions</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer">
                <summary className="flex items-center justify-between gap-3 font-bold text-navy text-sm list-none">
                  {q}
                  <ChevronDown size={16} className="text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-gray-500 leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
