'use server'
import { cookies } from 'next/headers'

const SUPPORTED = ['fr', 'en', 'es', 'de', 'nl']

export async function setLocale(locale: string) {
  if (!SUPPORTED.includes(locale)) return
  const store = await cookies()
  store.set('vem_lang', locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  })
}
