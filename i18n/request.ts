import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED = ['fr', 'en', 'es', 'de', 'nl']
const DEFAULT = 'fr'

export default getRequestConfig(async () => {
  const store = await cookies()
  const raw = store.get('vem_lang')?.value ?? DEFAULT
  const locale = SUPPORTED.includes(raw) ? raw : DEFAULT

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
