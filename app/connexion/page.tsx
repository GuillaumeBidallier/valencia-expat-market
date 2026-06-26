'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

export default function ConnexionPage() {
  const { login } = useAuth()
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(form.email, form.password)
    if (result === true) {
      window.location.href = redirectTo
    } else {
      setError(typeof result === 'string' ? result : t('err_credentials'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-orange-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 bg-orange-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-navy font-bold text-lg tracking-wider uppercase">Vendo</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-navy mb-1 text-center">{t('login_title')}</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">{t('demo_hint')}</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label={t('email')} type="email" placeholder="demo@vendo.es" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="password" label={t('password')} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div className="text-right">
            <Link href="/mot-de-passe-oublie" className="text-xs text-orange-primary hover:underline">{t('forgot')}</Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t('logging_in') : t('login_btn')}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('no_account')}{' '}
          <Link href="/inscription" className="text-orange-primary hover:underline font-medium">{t('register_cta')}</Link>
        </p>
      </div>
    </div>
  )
}
