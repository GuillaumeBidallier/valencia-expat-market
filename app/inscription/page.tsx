'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import { BadgeCheck, MessageCircle, Heart, Phone } from 'lucide-react'

// Only what an account really gives — no invented figures here.
const PERKS = [
  { icon: BadgeCheck,    key: 'perk_free' },
  { icon: MessageCircle, key: 'reg_perk_messages' },
  { icon: Heart,         key: 'perk_favorites' },
  { icon: Phone,         key: 'reg_perk_phone' },
] as const

// 16px on mobile so iOS Safari doesn't zoom into the field on focus.
const FIELD = 'text-base sm:text-sm py-3 rounded-xl'

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

  // -mt-10 : le layout réserve la place de la barre des catégories, masquée sous md.
  return (
    <div className="bg-gray-50 min-h-[calc(100svh-4rem)] -mt-10 md:mt-0 lg:py-12 lg:px-6">
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_1.05fr] lg:rounded-3xl lg:overflow-hidden lg:shadow-[0_24px_60px_-20px_rgba(26,31,54,0.35)] bg-white">

        {/* ── Panneau marque ── */}
        <section className="relative bg-navy text-white overflow-hidden px-6 pt-10 pb-12 sm:px-10 lg:px-12 lg:pt-14 lg:pb-0 lg:flex lg:flex-col">
          <div className="sm:max-w-sm sm:mx-auto sm:w-full lg:max-w-none lg:mx-0">
            <h1 className="text-[2rem] leading-[1.05] sm:text-4xl lg:text-[2.75rem] font-black tracking-tight max-w-[14ch]">
              {t('register_headline')}
            </h1>
            <p className="mt-4 text-white/70 text-base leading-relaxed max-w-[38ch]">
              {t('register_panel_sub')}
            </p>
          </div>

          <ul className="hidden lg:flex flex-col gap-4 mt-10">
            {PERKS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3.5">
                <span className="mt-0.5 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-orange-primary" aria-hidden />
                </span>
                <span className="text-[15px] text-white/90 leading-snug pt-1.5">{t(key)}</span>
              </li>
            ))}
          </ul>

          {/* Photo du site, fondue dans le bleu nuit */}
          <div className="hidden lg:block relative mt-auto -mx-12 h-64 pointer-events-none">
            <Image
              src="/landing-test/card-immobilier-v2.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 480px, 0px"
              className="object-cover object-[50%_60%] opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/30 to-transparent" />
          </div>
        </section>

        {/* ── Formulaire ── */}
        <section className="relative -mt-5 lg:mt-0 rounded-t-3xl lg:rounded-none bg-white px-6 pt-8 pb-12 sm:px-10 lg:px-14 lg:py-14 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-black text-navy tracking-tight">{t('register_title')}</h2>
            <p className="mt-1.5 text-sm text-gray-500">{t('register_form_sub')}</p>

            {error && (
              <div role="alert" className="mt-6 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              <Input
                id="name" label={t('name')} type="text" autoComplete="name" minLength={2} maxLength={60}
                placeholder="Marie Dupont" className={FIELD}
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              />
              <Input
                id="email" label={t('email')} type="email" autoComplete="email" inputMode="email"
                placeholder="marie@exemple.com" className={FIELD}
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              />
              <div>
                <Input
                  id="password" label={t('password')} type="password" autoComplete="new-password" minLength={8} maxLength={100}
                  placeholder="••••••••" className={FIELD} aria-describedby="password-hint"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                />
                <p id="password-hint" className="mt-1.5 text-xs text-gray-500">{t('password_hint')}</p>
              </div>
              <Button type="submit" className="w-full rounded-xl py-3.5" size="lg" disabled={loading}>
                {loading ? t('registering') : t('register_btn')}
              </Button>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.rich('terms_rich', {
                  cgu: chunks => <Link href="/cgu" className="underline hover:text-navy">{chunks}</Link>,
                  privacy: chunks => <Link href="/confidentialite" className="underline hover:text-navy">{chunks}</Link>,
                })}
              </p>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-sm font-bold text-navy">{t('has_account')}</p>
              <Link
                href="/connexion"
                className="mt-4 flex items-center justify-center w-full rounded-xl border-2 border-navy text-navy font-bold text-sm py-3 hover:bg-navy hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary focus-visible:ring-offset-2"
              >
                {t('login_cta')}
              </Link>
            </div>

            {/* Rappel des avantages sur mobile, le panneau étant réduit au titre */}
            <ul className="lg:hidden mt-10 grid grid-cols-1 gap-3">
              {PERKS.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon size={16} className="text-orange-primary shrink-0" aria-hidden />
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
