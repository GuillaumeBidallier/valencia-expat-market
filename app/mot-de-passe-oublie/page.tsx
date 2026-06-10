'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch {
      setError('Impossible de contacter le serveur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <Link href="/connexion" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors mb-6">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-black text-navy mb-3">Email envoyé !</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Si un compte existe avec l&apos;adresse <strong className="text-navy">{email}</strong>, vous allez recevoir un email avec un lien de réinitialisation dans les prochaines minutes.
            </p>
            <p className="text-xs text-gray-400 mb-6">Pensez à vérifier vos spams.</p>
            <Link href="/connexion" className="inline-block text-sm font-semibold text-orange-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-orange-soft rounded-2xl flex items-center justify-center mb-5">
              <Mail size={24} className="text-orange-primary" />
            </div>
            <h1 className="text-xl font-black text-navy mb-2">Mot de passe oublié ?</h1>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="Adresse e-mail"
                type="email"
                placeholder="marie@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
