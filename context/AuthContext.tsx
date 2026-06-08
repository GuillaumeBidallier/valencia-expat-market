'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'

const DEMO_USER: User = {
  id: 'demo',
  name: 'Marie Dupont',
  email: 'demo@valenciaexpat.com',
  subscriptionStatus: 'active',
  subscriptionRenewal: '20 mai 2027',
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vem_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('vem_user')
    }
  }, [])

  const login = (email: string, _password: string): boolean => {
    const u = { ...DEMO_USER, email }
    setUser(u)
    localStorage.setItem('vem_user', JSON.stringify(u))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vem_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
