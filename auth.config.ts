import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/connexion' },
  // The app is served on several domains (multi-pays: 1000click.com, .be, .fr…),
  // resolved per-request by middleware.ts. Auth.js must derive its callback/action
  // URLs from the actual incoming request host rather than a single hardcoded
  // AUTH_URL/NEXTAUTH_URL — Vercel's proxy headers are trustworthy for this.
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
  },
} satisfies NextAuthConfig
