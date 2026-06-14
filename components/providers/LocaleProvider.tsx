'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import type { AbstractIntlMessages } from 'next-intl'

import frMessages from '@/messages/fr.json'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import deMessages from '@/messages/de.json'
import nlMessages from '@/messages/nl.json'

export type SupportedLocale = 'fr' | 'en' | 'es' | 'de' | 'nl'

const allMessages: Record<SupportedLocale, AbstractIntlMessages> = {
  fr: frMessages,
  en: enMessages,
  es: esMessages,
  de: deMessages,
  nl: nlMessages,
}

const LocaleContext = createContext<{
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}>({ locale: 'fr', setLocale: () => {} })

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: SupportedLocale
  children: ReactNode
}) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale)
  const router = useRouter()

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next)
    document.cookie = `vem_lang=${next}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    localStorage.setItem('vem_lang', next)
    // Refresh server components so data (blog articles, etc.) re-fetches with the new locale
    router.refresh()
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
