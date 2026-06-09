'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function loginAction(
  email: string,
  password: string,
): Promise<{ error?: string; debug?: string }> {
  try {
    await signIn('credentials', { email, password, redirect: false })
    return {}
  } catch (e: unknown) {
    // Next.js redirect object thrown on success: { digest: 'NEXT_REDIRECT;...' }
    if (typeof e === 'object' && e !== null && 'digest' in e) {
      const digest = String((e as Record<string, unknown>).digest ?? '')
      if (digest.startsWith('NEXT_REDIRECT')) return {}
    }
    if (e instanceof AuthError) {
      return { error: 'Email ou mot de passe incorrect.' }
    }
    const debug = e instanceof Error
      ? `${e.constructor.name}: ${e.message}`
      : JSON.stringify(e)
    return { error: 'Email ou mot de passe incorrect.', debug }
  }
}
