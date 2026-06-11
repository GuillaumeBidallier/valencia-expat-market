'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
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

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next)
    document.cookie = `vem_lang=${next}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    localStorage.setItem('vem_lang', next)
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
