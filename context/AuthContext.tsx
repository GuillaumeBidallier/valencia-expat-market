'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { loginAction } from '@/app/actions/login'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean | string>
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

  const login = async (email: string, password: string): Promise<boolean | string> => {
    const { error, debug } = await loginAction(email, password)
    if (!error) return true
    return debug ? `${error} [${debug}]` : error
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
