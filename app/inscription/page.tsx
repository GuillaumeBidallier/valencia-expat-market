'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function InscriptionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      if (res.status === 409) { setError('Cet email est déjà utilisé.'); return }
      if (!res.ok) { setError('Une erreur est survenue.'); return }
      await login(form.email, form.password)
      router.push('/')
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
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

        <h1 className="text-xl font-bold text-navy mb-1 text-center">S&apos;inscrire gratuitement</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Rejoignez la communauté des expatriés en Espagne. C&apos;est 100% gratuit.</p>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Nom complet" type="text" placeholder="Marie Dupont" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input id="email" label="Adresse e-mail" type="email" placeholder="marie@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

          <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Création du compte...' : 'Créer mon compte gratuitement'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Déjà inscrit ? <Link href="/connexion" className="text-orange-primary hover:underline font-medium">Se connecter</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">En vous inscrivant, vous acceptez nos CGU et notre Politique de confidentialité.</p>
      </div>
    </div>
  )
}
