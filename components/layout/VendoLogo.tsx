interface VendoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
}

export default function VendoLogo({ size = 'md', theme = 'dark' }: VendoLogoProps) {
  const configs = {
    sm: { fontSize: 20, circleSize: 22 },
    md: { fontSize: 30, circleSize: 33 },
    lg: { fontSize: 48, circleSize: 52 },
    xl: { fontSize: 72, circleSize: 78 },
  }

  const { fontSize, circleSize } = configs[size]
  const textColor = theme === 'light' ? '#ffffff' : '#1A1F36'
  // Vertical alignment: align circle center with text cap-height (~72% of fontSize)
  const capHeight = fontSize * 0.72
  const circleRadius = circleSize / 2
  const svgHeight = fontSize * 1.2
  const svgWidth = circleSize + fontSize * 0.2 // extra for the decorative arc sticking out
  const cy = svgHeight / 2 + (fontSize * 0.05)

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1, userSelect: 'none' }}
    >
      {/* "vend" text */}
      <span
        style={{
          fontSize,
          fontWeight: 900,
          color: textColor,
          letterSpacing: '-0.02em',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1,
        }}
      >
        vend
      </span>

      {/* The 'o' — SVG smiley circle */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', marginLeft: fontSize * 0.02 }}
      >
        {/* Main orange circle */}
        <circle
          cx={circleRadius}
          cy={cy}
          r={circleRadius * 0.9}
          fill="#E8571A"
        />

        {/* Left eye */}
        <circle
          cx={circleRadius - circleRadius * 0.28}
          cy={cy - circleRadius * 0.18}
          r={circleRadius * 0.12}
          fill="white"
        />

        {/* Right eye */}
        <circle
          cx={circleRadius + circleRadius * 0.28}
          cy={cy - circleRadius * 0.18}
          r={circleRadius * 0.12}
          fill="white"
        />

        {/* Smile — wide curved arc */}
        <path
          d={`M ${circleRadius - circleRadius * 0.42} ${cy + circleRadius * 0.12}
              Q ${circleRadius} ${cy + circleRadius * 0.55}
              ${circleRadius + circleRadius * 0.42} ${cy + circleRadius * 0.12}`}
          stroke="white"
          strokeWidth={circleRadius * 0.13}
          fill="none"
          strokeLinecap="round"
        />

        {/* Decorative arc top-right (outside the circle — like a sparkle/shine) */}
        <path
          d={`M ${circleRadius + circleRadius * 0.55} ${cy - circleRadius * 0.7}
              Q ${circleRadius + circleRadius * 1.0} ${cy - circleRadius * 0.9}
              ${circleRadius + circleRadius * 0.85} ${cy - circleRadius * 0.35}`}
          stroke="#E8571A"
          strokeWidth={circleRadius * 0.18}
          fill="none"
          strokeLinecap="round"
          opacity="0"
        />

        {/* Decorative small arc — top right outside, white on dark or orange tint */}
        <path
          d={`M ${circleRadius + circleRadius * 0.62} ${cy - circleRadius * 0.75}
              A ${circleRadius * 0.35} ${circleRadius * 0.35} 0 0 1
              ${circleRadius + circleRadius * 0.9} ${cy - circleRadius * 0.38}`}
          stroke={theme === 'light' ? 'rgba(255,255,255,0.7)' : '#E8571A'}
          strokeWidth={circleRadius * 0.14}
          fill="none"
          strokeLinecap="round"
        />

        {/* Tiny dot at end of arc */}
        <circle
          cx={circleRadius + circleRadius * 0.94}
          cy={cy - circleRadius * 0.28}
          r={circleRadius * 0.08}
          fill={theme === 'light' ? 'rgba(255,255,255,0.7)' : '#E8571A'}
        />
      </svg>
    </div>
  )
}
