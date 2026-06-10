'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { KeyRound, CheckCircle2, XCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function ResetForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token') ?? ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  if (!token) {
    return (
      <div className="text-center py-4">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-black text-navy mb-2">Lien invalide</h1>
        <p className="text-sm text-gray-400 mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>
        <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-orange-primary hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Lien invalide ou expiré.')
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/connexion'), 3000)
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-xl font-black text-navy mb-3">Mot de passe modifié !</h1>
        <p className="text-sm text-gray-500 mb-6">Vous allez être redirigé vers la page de connexion…</p>
        <Link href="/connexion" className="inline-block text-sm font-semibold text-orange-primary hover:underline">
          Se connecter maintenant
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mb-5">
        <KeyRound size={24} className="text-white" />
      </div>
      <h1 className="text-xl font-black text-navy mb-2">Nouveau mot de passe</h1>
      <p className="text-sm text-gray-400 mb-7">Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          label="Nouveau mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          id="confirm"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <Suspense fallback={<div className="h-40 flex items-center justify-center text-gray-400 text-sm">Chargement…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
