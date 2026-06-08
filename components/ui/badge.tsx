interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
  style?: React.CSSProperties
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  style,
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.01em]'

  const variants: Record<string, string> = {
    default:
      'border-[rgba(100,100,100,.28)] bg-[rgba(100,100,100,.12)] text-[#666666]',
    secondary:
      'border-[var(--border)] bg-[var(--background-2)] text-[var(--muted)]',
    outline: 'border-[var(--border)] bg-white text-[var(--text)]',
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} style={style}>
      {children}
    </span>
  )
}
