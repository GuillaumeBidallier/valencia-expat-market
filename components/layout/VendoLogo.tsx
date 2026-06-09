interface VendoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
}

const ORANGE = '#F97316'
const PURPLE = '#6929C4'

export default function VendoLogo({ size = 'md', theme = 'dark' }: VendoLogoProps) {
  const fontSizes = { sm: 18, md: 28, lg: 44, xl: 68 }
  const fontSize = fontSizes[size]

  // Circle sized to match cap-height of the letters
  const r = fontSize * 0.44        // outer radius of the ring
  const strokeW = r * 0.28         // ring thickness
  const innerR = r - strokeW / 2   // inner edge of ring (for smile positioning)

  // SVG canvas: circle + rays extending top-right
  // Circle centered at (cx, cy)
  const cx = r + 2
  const cy = r * 1.05
  const svgW = cx + r * 1.9       // room for rays to the right
  const svgH = cy + r + 4

  // "vend" text color
  const textColor = theme === 'light' ? '#ffffff' : PURPLE

  // Smile arc — inside the ring, lower half
  const smileR = innerR * 0.58
  const smileStartX = cx - smileR * 0.85
  const smileStartY = cy + smileR * 0.25
  const smileEndX   = cx + smileR * 0.85
  const smileEndY   = cy + smileR * 0.25
  const smileCtrlY  = cy + smileR * 1.10

  // 3 rays: angles in degrees, measured CCW from rightward horizontal (SVG: y-down so CCW = upward)
  // In SVG math: x += cos(deg), y -= sin(deg)  [y-down coords]
  const rays = [
    { angleDeg: 18, lenStart: r * 1.28, lenEnd: r * 1.72 },   // nearly horizontal
    { angleDeg: 45, lenStart: r * 1.28, lenEnd: r * 1.72 },   // diagonal
    { angleDeg: 72, lenStart: r * 1.28, lenEnd: r * 1.72 },   // nearly vertical
  ]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1, userSelect: 'none' }}>
      {/* "vend" — Nunito font, rounded look */}
      <span
        style={{
          fontSize,
          fontWeight: 900,
          color: textColor,
          fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        vend
      </span>

      {/* The 'o' + rays SVG */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible', marginLeft: fontSize * 0.01 }}
      >
        {/* Orange ring (outline circle) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={ORANGE}
          strokeWidth={strokeW}
        />

        {/* Smile arc inside the ring */}
        <path
          d={`M ${smileStartX} ${smileStartY} Q ${cx} ${smileCtrlY} ${smileEndX} ${smileEndY}`}
          stroke={ORANGE}
          strokeWidth={strokeW * 0.85}
          fill="none"
          strokeLinecap="round"
        />

        {/* 3 rays — orange, rounded caps */}
        {rays.map(({ angleDeg, lenStart, lenEnd }, i) => {
          const rad = (angleDeg * Math.PI) / 180
          const x1 = cx + Math.cos(rad) * lenStart
          const y1 = cy - Math.sin(rad) * lenStart   // y-down: subtract to go up
          const x2 = cx + Math.cos(rad) * lenEnd
          const y2 = cy - Math.sin(rad) * lenEnd
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke={ORANGE}
              strokeWidth={strokeW * 0.80}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    </div>
  )
}
