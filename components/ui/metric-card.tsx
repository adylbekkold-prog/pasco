import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: string | number
  meta?: string
  icon?: LucideIcon
  tone?: 'blue' | 'green' | 'amber' | 'red'
}

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-200',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-200',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-200',
}

export function MetricCard({ label, value, meta, icon: Icon, tone = 'blue' }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
        </div>
        {Icon && (
          <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', toneClasses[tone])}>
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
      </div>
      {meta && <div className="metric-meta">{meta}</div>}
    </article>
  )
}
