'use client'
import { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

const BANNER_HEIGHT = '42px'
const STORAGE_KEY = 'vem_announcement_dismissed'

/**
 * Key the dismissal on the message itself, so editing the announcement makes it
 * reappear for everyone who had closed the previous one.
 */
function messageKey(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return String(hash)
}

/* localStorage read as an external store: no setState in an effect, and the
   server snapshot (null) keeps SSR and the first client render in agreement. */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getDismissedKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setDismissedKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    /* private browsing — the banner simply returns on the next page load */
  }
  listeners.forEach(l => l())
}

/**
 * Sets --announcement-h, which Navbar's `top` and ConditionalMain's padding are
 * expressed against. Defaults to 0px in globals.css, so nothing shifts when no
 * announcement is active.
 */
export default function AnnouncementBanner({ text }: { text: string }) {
  const pathname = usePathname()
  const dismissedKey = useSyncExternalStore(subscribe, getDismissedKey, () => null)

  const hidden = dismissedKey === messageKey(text) || pathname.startsWith('/admin')

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--announcement-h', hidden ? '0px' : BANNER_HEIGHT)
    return () => root.style.setProperty('--announcement-h', '0px')
  }, [hidden])

  if (hidden) return null

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-400 text-navy text-sm font-semibold px-4 flex items-center justify-between gap-3"
      style={{ height: BANNER_HEIGHT }}
    >
      <span className="truncate">{text}</span>
      <button
        type="button"
        onClick={() => setDismissedKey(messageKey(text))}
        aria-label="Fermer l'annonce"
        className="shrink-0 p-1 -mr-1 rounded hover:bg-black/10 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
