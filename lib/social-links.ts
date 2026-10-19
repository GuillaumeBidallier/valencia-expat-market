// Social links set in /admin/parametres and shown in the site footer.
// Pure helpers, safe to import from client and server code.

export interface SocialLinks {
  facebook: string | null
  instagram: string | null
  whatsapp: string | null // ready-to-use https://wa.me/… link
}

export const NO_SOCIAL_LINKS: SocialLinks = { facebook: null, instagram: null, whatsapp: null }

/** Empty → null, missing scheme → https://, anything that isn't an http(s) URL → 'invalid'. */
export function normalizeSocialUrl(raw: unknown): string | null | 'invalid' {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const value = raw.trim()
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return 'invalid'
    return url.toString()
  } catch {
    return 'invalid'
  }
}

/**
 * International number only (+32… or 0032…), since wa.me links need the country
 * code. Returns +digits, or 'invalid' for anything else.
 */
export function normalizeWhatsapp(raw: unknown): string | null | 'invalid' {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const value = raw.trim()
  if (!value.startsWith('+') && !value.startsWith('00')) return 'invalid'
  const digits = value.replace(/\D/g, '').replace(/^00/, '')
  if (digits.length < 8 || digits.length > 15) return 'invalid'
  return `+${digits}`
}

export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}`
}
