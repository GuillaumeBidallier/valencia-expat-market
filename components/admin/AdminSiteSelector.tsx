'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

type SiteOption = { id: string; domain: string; name: string; country: string }

export default function AdminSiteSelector({ sites, currentSiteId }: { sites: SiteOption[]; currentSiteId: string }) {
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  async function handleChange(siteId: string) {
    if (siteId === currentSiteId) return
    setSwitching(true)
    await fetch('/api/admin/site-selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    })
    router.refresh()
    setSwitching(false)
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
      <Globe size={16} className="text-white/60" />
      <select
        value={currentSiteId}
        onChange={e => handleChange(e.target.value)}
        disabled={switching}
        className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer disabled:opacity-50"
      >
        {sites.map(site => (
          <option key={site.id} value={site.id} className="text-navy">
            {site.name} ({site.country})
          </option>
        ))}
      </select>
    </div>
  )
}
