'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const user: User | null = session?.user
    ? {
        id: (session.user as { id: string }).id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        subscriptionStatus: 'active',
        subscriptionRenewal: '',
      }
    : null

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn('credentials', { email, password, redirect: false })
    return result?.ok ?? false
  }

  const logout = () => signOut({ callbackUrl: '/' })

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: status === 'authenticated', login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
