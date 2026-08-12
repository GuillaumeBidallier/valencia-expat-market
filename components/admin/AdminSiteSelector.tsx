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
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
      <Globe size={15} className="text-gray-400" />
      <select
        value={currentSiteId}
        onChange={e => handleChange(e.target.value)}
        disabled={switching}
        className="bg-transparent text-navy text-sm font-medium outline-none cursor-pointer disabled:opacity-50"
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
