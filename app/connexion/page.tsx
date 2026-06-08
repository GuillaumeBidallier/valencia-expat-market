'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ConnexionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      login(form.email, form.password)
      router.push('/mon-compte')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-orange-primary font-bold text-sm tracking-wider uppercase">Valencia</div>
            <div className="text-navy font-bold text-sm tracking-wider uppercase">Expat Market</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">Se connecter</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Compte démo : <strong>demo@valenciaexpat.com</strong> / <strong>demo1234</strong></p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Adresse e-mail" type="email" placeholder="demo@valenciaexpat.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div className="text-right">
            <a href="#" className="text-xs text-orange-primary hover:underline">Mot de passe oublié ?</a>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pas encore de compte ? <Link href="/inscription" className="text-orange-primary hover:underline font-medium">S&apos;inscrire pour 20 €/an</Link>
        </p>
      </div>
    </div>
  )
}
