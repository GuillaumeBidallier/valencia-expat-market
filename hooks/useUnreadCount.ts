'use client'
import { useState, useEffect, useCallback } from 'react'

export function useUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await fetch('/api/messages/unread-count')
      if (res.ok) {
        const data = await res.json()
        setCount(data.count ?? 0)
      }
    } catch { /* ignore */ }
  }, [enabled])

  useEffect(() => {
    if (!enabled) { setCount(0); return }
    refresh()
    const interval = setInterval(refresh, 15_000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [enabled, refresh])

  return count
}
