'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    await signIn('credentials', { email, password, redirect: false })
    return {}
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Email ou mot de passe incorrect.' }
    }
    // NEXT_REDIRECT is thrown on successful redirect — treat as success
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('NEXT_REDIRECT') || msg.includes('redirect')) return {}
    return { error: 'Email ou mot de passe incorrect.' }
  }
}
