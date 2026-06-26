'use client'
import { useEffect, useState } from 'react'
import { BarChart2, MousePointerClick, Phone, Globe, Eye } from 'lucide-react'

type Stats = {
  totals: Record<string, number>
  daily: { date: string; count: number }[]
  period: '30d'
}

const WA_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function ProStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pro/stats')
      .then(r => r.json())
      .then((data: Stats) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const t = stats?.totals ?? {}
  const total = Object.values(t).reduce((a, b) => a + b, 0)

  const kpis = [
    { label: 'Vues du profil',      icon: <Eye size={16} />,             key: 'profile_view', color: 'text-indigo-primary bg-indigo-soft' },
    { label: 'Clics pub',           icon: <MousePointerClick size={16} />, key: 'ad_click',   color: 'text-orange-primary bg-orange-soft' },
    { label: 'Appels téléphone',    icon: <Phone size={16} />,            key: 'phone',       color: 'text-navy bg-gray-100'              },
    { label: 'Clics WhatsApp',      icon: WA_ICON,                        key: 'whatsapp',    color: 'text-green-700 bg-green-50'         },
    { label: 'Visites site web',    icon: <Globe size={16} />,            key: 'website',     color: 'text-blue-600 bg-blue-50'           },
  ]

  const maxDay = Math.max(...(stats?.daily.map(d => d.count) ?? [1]), 1)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <section className="bg-white rounded-2xl border border-indigo-primary/20 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
          <BarChart2 size={18} className="text-indigo-primary" />
        </div>
        <div>
          <p className="font-black text-navy text-sm">Statistiques de clics</p>
          <p className="text-xs text-gray-400">30 derniers jours</p>
        </div>
        <span className="ml-auto text-xs font-bold bg-indigo-soft text-indigo-primary px-2.5 py-1 rounded-full">Premium+</span>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-primary border-t-transparent animate-spin" />
        </div>
      ) : !stats ? (
        <p className="text-sm text-gray-400 text-center py-8">Impossible de charger les statistiques.</p>
      ) : (
        <>
          {/* Total */}
          <p className="text-3xl font-black text-navy mb-1">{total}</p>
          <p className="text-xs text-gray-400 mb-5">interactions totales · 30 jours</p>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {kpis.map(kpi => (
              <div key={kpi.key} className="flex items-center gap-2.5 bg-[#f7f8fa] rounded-xl p-3 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-navy text-base leading-none">{t[kpi.key] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily bar chart — CSS only */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Activité quotidienne</p>
            <div className="flex items-end gap-0.5 h-20">
              {stats.daily.map(day => {
                const pct = Math.round((day.count / maxDay) * 100)
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-0.5 group relative"
                    title={`${formatDate(day.date)}: ${day.count}`}
                  >
                    <div
                      className="w-full rounded-t bg-indigo-primary/70 group-hover:bg-indigo-primary transition-colors"
                      style={{ height: `${Math.max(pct, day.count > 0 ? 4 : 1)}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                      <div className="bg-navy text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                        {day.count} · {formatDate(day.date)}
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-navy" />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-300">{stats.daily[0] ? formatDate(stats.daily[0].date) : ''}</span>
              <span className="text-[10px] text-gray-300">{stats.daily[29] ? formatDate(stats.daily[29].date) : ''}</span>
            </div>
          </div>

          {total === 0 && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Aucun clic enregistré pour le moment. Les statistiques apparaîtront dès que des visiteurs interagiront avec votre fiche.
            </p>
          )}
        </>
      )}
    </section>
  )
}
