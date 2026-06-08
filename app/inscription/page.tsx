'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const features = [
  'Annonces illimitées',
  'Ajout de photos',
  'Contact via WhatsApp',
  'Support par e-mail',
]

export default function InscriptionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login(form.email, form.password)
      router.push('/mon-compte')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
            <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">S&apos;inscrire</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Rejoignez la communauté des expatriés de Valencia.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          <Input id="name" label="Nom complet" type="text" placeholder="Marie Dupont" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input id="email" label="Adresse e-mail" type="email" placeholder="marie@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

          {/* Subscription box */}
          <div className="bg-orange-soft border border-orange-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-navy text-sm">Abonnement annuel</span>
              <span className="font-extrabold text-orange-primary text-lg">20 € <span className="text-xs font-normal text-gray-400">/ an</span></span>
            </div>
            <ul className="space-y-1.5">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-orange-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Traitement...' : "S'inscrire et payer 20 €"}
          </Button>
        </form>

        {/* Payment icons */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Paiement sécurisé par Stripe</span>
        </div>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {['VISA', 'MC', 'AMEX', 'CB'].map(p => (
            <span key={p} className="border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-400 font-mono">{p}</span>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Déjà inscrit ? <Link href="/connexion" className="text-orange-primary hover:underline font-medium">Se connecter</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">En vous inscrivant, vous acceptez nos CGU et notre Politique de confidentialité.</p>
      </div>
    </div>
  )
}
