'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getPusherClient } from '@/lib/pusher-client'

export function useUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0)
  const { user } = useAuth()
  const userId = user?.id

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

  // Initial load + periodic fallback refresh
  useEffect(() => {
    if (!enabled) { setCount(0); return }
    refresh()
    const interval = setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [enabled, refresh])

  // Pusher real-time subscription
  useEffect(() => {
    if (!enabled || !userId) return
    const pusher = getPusherClient()
    if (!pusher) return

    const channel = pusher.subscribe(`private-user-${userId}`)
    channel.bind('new-message', () => { refresh() })
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`private-user-${userId}`)
    }
  }, [enabled, userId, refresh])

  return count
}
