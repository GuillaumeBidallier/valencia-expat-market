interface VendoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
}

export default function VendoLogo({ size = 'md', theme = 'dark' }: VendoLogoProps) {
  const configs = {
    sm: { fontSize: 20 },
    md: { fontSize: 30 },
    lg: { fontSize: 48 },
    xl: { fontSize: 72 },
  }

  const { fontSize } = configs[size]
  const textColor = theme === 'light' ? '#ffffff' : '#1A1F36'

  // Circle proportions — same cap-height as the letters
  const r = fontSize * 0.42          // radius of the 'o' circle
  const cx = r                       // circle center X
  const cy = fontSize * 0.50         // circle center Y (vertically centered)
  const svgW = r * 2 + r * 0.9      // extra space on right for the decorative marks
  const svgH = fontSize * 1.0

  // Decorative arc outside, top-right (~1 o'clock, extending outward)
  // Arc start: on circle edge at ~45°
  const ax1 = cx + r * 0.90 * Math.cos(-Math.PI / 4)  // ~top-right edge
  const ay1 = cy + r * 0.90 * Math.sin(-Math.PI / 4)
  // Arc end: further out
  const ax2 = cx + r * 1.40
  const ay2 = cy - r * 0.15
  // Arc control point
  const acx = cx + r * 1.55
  const acy = cy - r * 0.80

  // Dot position: above the arc end
  const dotX = cx + r * 1.65
  const dotY = cy - r * 0.80

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1, userSelect: 'none', gap: 0 }}>
      {/* "vend" */}
      <span
        style={{
          fontSize,
          fontWeight: 900,
          color: textColor,
          letterSpacing: '-0.03em',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1,
          marginRight: fontSize * 0.02,
        }}
      >
        vend
      </span>

      {/* The 'o' as SVG */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Orange filled circle */}
        <circle cx={cx} cy={cy} r={r * 0.92} fill="#E8571A" />

        {/* Smile — white curved arc in bottom half */}
        <path
          d={`M ${cx - r * 0.40} ${cy + r * 0.08}
              Q ${cx} ${cy + r * 0.58}
              ${cx + r * 0.40} ${cy + r * 0.08}`}
          stroke="white"
          strokeWidth={r * 0.155}
          fill="none"
          strokeLinecap="round"
        />

        {/* Left eye */}
        <circle cx={cx - r * 0.26} cy={cy - r * 0.20} r={r * 0.105} fill="white" />
        {/* Right eye */}
        <circle cx={cx + r * 0.26} cy={cy - r * 0.20} r={r * 0.105} fill="white" />

        {/* Decorative arc OUTSIDE circle, top-right — orange */}
        <path
          d={`M ${ax1} ${ay1} Q ${acx} ${acy} ${ax2} ${ay2}`}
          stroke="#E8571A"
          strokeWidth={r * 0.18}
          fill="none"
          strokeLinecap="round"
        />

        {/* Dot — orange, above the arc */}
        <circle cx={dotX} cy={dotY} r={r * 0.115} fill="#E8571A" />
      </svg>
    </div>
  )
}
