'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

export default function InscriptionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const t = useTranslations('Auth')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, website }),
      })
      if (res.status === 409) { setError(t('err_taken')); return }
      if (res.status === 429) { setError('Trop de tentatives, réessayez dans quelques minutes.'); return }
      if (!res.ok) { setError(t('err_generic')); return }
      await login(form.email, form.password)
      router.push('/')
    } catch {
      setError(t('err_server'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-navy font-bold text-lg tracking-wider uppercase">Vendo</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">{t('register_title')}</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">{t('register_sub')}</p>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot — hidden from real users via CSS, bots tend to fill every field */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] w-px h-px opacity-0"
          />
          <Input id="name" label={t('name')} type="text" placeholder="Marie Dupont" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input id="email" label={t('email')} type="email" placeholder="marie@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label={t('password')} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

          <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={loading}>
            {loading ? t('registering') : t('register_btn')}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('has_account')}{' '}
          <Link href="/connexion" className="text-orange-primary hover:underline font-medium">{t('login_cta')}</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">{t('terms')}</p>
      </div>
    </div>
  )
}
