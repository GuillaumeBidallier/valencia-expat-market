interface VendoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
}

export default function VendoLogo({ size = 'md', theme = 'dark' }: VendoLogoProps) {
  const configs = {
    sm: { text: 'text-xl',   circle: 28, inner: 10, stroke: 2,   gap: 1 },
    md: { text: 'text-3xl',  circle: 38, inner: 14, stroke: 2.5, gap: 1 },
    lg: { text: 'text-5xl',  circle: 54, inner: 20, stroke: 3,   gap: 2 },
    xl: { text: 'text-7xl',  circle: 74, inner: 28, stroke: 4,   gap: 3 },
  }
  const c = configs[size]
  const textColor = theme === 'light' ? 'text-white' : 'text-navy'

  return (
    <div className={`flex items-center font-black tracking-tight leading-none ${c.text}`}>
      <span className={textColor}>vend</span>

      {/* The 'o' — orange circle with smile arc + decorative dots */}
      <span className="relative inline-block" style={{ width: c.circle, height: c.circle, marginLeft: c.gap, marginRight: c.gap, verticalAlign: 'middle', flexShrink: 0 }}>
        <svg
          viewBox="0 0 40 40"
          width={c.circle}
          height={c.circle}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main orange circle */}
          <circle cx="20" cy="20" r="18" fill="#E8571A" />

          {/* Smile arc in white */}
          <path
            d="M 11 22 Q 20 30 29 22"
            stroke="white"
            strokeWidth={c.stroke}
            fill="none"
            strokeLinecap="round"
          />

          {/* Eyes */}
          <circle cx="14" cy="16" r="2.5" fill="white" />
          <circle cx="26" cy="16" r="2.5" fill="white" />

          {/* Decorative arc at top-right (highlight effect) */}
          <path
            d="M 28 8 Q 34 14 32 22"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Small dot accent */}
          <circle cx="33" cy="10" r="1.5" fill="white" opacity="0.6" />
        </svg>
      </span>
    </div>
  )
}
