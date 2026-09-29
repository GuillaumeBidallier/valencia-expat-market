'use client'
import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'
import AdminTour from './tour/AdminTour'

interface Site { id: string; name: string; domain: string; country: string }

export default function AdminShell({
  adminName,
  notificationCount,
  sites,
  currentSiteId,
  tourAutoStart,
  children,
}: {
  adminName: string
  notificationCount: number
  sites: Site[]
  currentSiteId: string
  tourAutoStart: boolean
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-screen flex bg-[#F4F5F7] overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <AdminTopBar
          adminName={adminName}
          notificationCount={notificationCount}
          sites={sites}
          currentSiteId={currentSiteId}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
      <AdminTour autoStart={tourAutoStart} />
    </div>
  )
}
