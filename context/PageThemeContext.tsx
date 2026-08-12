'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface PageThemeContextValue {
  vehiculesPage: boolean
  setVehiculesPage: (v: boolean) => void
}

const PageThemeContext = createContext<PageThemeContextValue | null>(null)

export function PageThemeProvider({ children }: { children: ReactNode }) {
  const [vehiculesPage, setVehiculesPage] = useState(false)
  return (
    <PageThemeContext.Provider value={{ vehiculesPage, setVehiculesPage }}>
      {children}
    </PageThemeContext.Provider>
  )
}

export function usePageTheme() {
  const ctx = useContext(PageThemeContext)
  if (!ctx) throw new Error('usePageTheme must be used within PageThemeProvider')
  return ctx
}

// Lets a page declare itself vehicules-themed while mounted, so the globally-mounted
// Navbar can switch to the dark/red theme even on routes with no `cat` query param
// to watch (e.g. /annonces/[id]).
export function useVehiculesPageTheme(active: boolean) {
  const { setVehiculesPage } = usePageTheme()
  useEffect(() => {
    if (!active) return
    setVehiculesPage(true)
    return () => setVehiculesPage(false)
  }, [active, setVehiculesPage])
}
