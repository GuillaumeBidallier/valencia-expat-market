import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { headers } from 'next/headers'
import { authConfig } from './auth.config'

const USER_RECHECK_MS = 5 * 60 * 1000

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials)
          if (!parsed.success) return null

          const siteId = (await headers()).get('x-site-id')
          if (!siteId) return null

          const user = await prisma.user.findFirst({
            where: { email: parsed.data.email, siteId },
          })
          if (!user || user.blocked) return null

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
          if (!valid) return null

          return { id: user.id, name: user.name, email: user.email, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.checkedAt = Date.now()
        return token
      }
      // A JWT outlives its account: re-check every few minutes that the user still
      // exists and isn't blocked. Returning null makes Auth.js clear the session
      // cookie, instead of letting writes fail on a dangling user id.
      if (token.id && Date.now() - ((token.checkedAt as number | undefined) ?? 0) > USER_RECHECK_MS) {
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { blocked: true, role: true },
        })
        if (!current || current.blocked) return null
        token.role = current.role
        token.checkedAt = Date.now()
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role?: string }).role = token.role as string
      return session
    },
  },
})
