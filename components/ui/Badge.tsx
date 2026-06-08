import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn('inline-block bg-orange-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full', className)}>
      {children}
    </span>
  )
}
