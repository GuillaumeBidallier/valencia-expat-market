interface DayPoint { label: string; count: number }

/** Simple two-series line chart (this week vs. previous week), pure SVG, no client JS needed. */
export function ActivityLineChart({ current, previous }: { current: DayPoint[]; previous: DayPoint[] }) {
  const width = 560
  const height = 160
  const padTop = 10
  const padBottom = 24
  const plotH = height - padTop - padBottom
  const maxVal = Math.max(5, ...current.map(d => d.count), ...previous.map(d => d.count))
  const step = current.length > 1 ? width / (current.length - 1) : width

  const toPoints = (data: DayPoint[]) =>
    data.map((d, i) => ({
      x: i * step,
      y: padTop + plotH - (d.count / maxVal) * plotH,
    }))

  const currentPts = toPoints(current)
  const prevPts = toPoints(previous)
  const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const yTicks = 4
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i))

  return (
    <div>
      <svg viewBox={`0 -10 ${width} ${height + 10}`} className="w-full h-40" preserveAspectRatio="none">
        {tickValues.map(v => {
          const y = padTop + plotH - (v / maxVal) * plotH
          return (
            <g key={v}>
              <line x1={0} x2={width} y1={y} y2={y} stroke="#F1F2F4" strokeWidth={1} />
              <text x={0} y={y - 3} fontSize={9} fill="#9CA3AF">{v}</text>
            </g>
          )
        })}
        <path d={toPath(prevPts)} fill="none" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="4 3" />
        <path d={toPath(currentPts)} fill="none" stroke="#E8571A" strokeWidth={2.5} />
        {currentPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#E8571A" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-0.5">
        {current.map(d => (
          <span key={d.label} className="text-[10px] text-gray-400 capitalize">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

interface DonutSegment { label: string; value: number; color: string; dot: string }

/** Simple donut chart built from stacked SVG circle strokes. */
export function DonutChart({ segments, centerValue, centerLabel }: { segments: DonutSegment[]; centerValue: number; centerLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0 w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
          <circle cx={50} cy={50} r={radius} fill="none" stroke="#F1F2F4" strokeWidth={14} />
          {total > 0 && segments.filter(s => s.value > 0).map(s => {
            const frac = s.value / total
            const dash = frac * circumference
            const circle = (
              <circle
                key={s.label}
                cx={50}
                cy={50}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={14}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-navy leading-none">{centerValue}</span>
          <span className="text-[10px] text-gray-400 text-center leading-tight mt-1 max-w-[70px]">{centerLabel}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center justify-between text-xs gap-2">
            <span className="flex items-center gap-1.5 text-gray-500 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-bold text-navy tabular-nums shrink-0">
              {s.value} {total > 0 ? `(${Math.round((s.value / total) * 100)}%)` : '(0%)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
