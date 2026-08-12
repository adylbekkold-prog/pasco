'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'group inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--muted)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[rgba(37,99,235,0.38)] hover:text-[var(--primary)]',
        className
      )}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      aria-pressed={isDark}
    >
      <span className="relative flex size-5 items-center justify-center">
        <Sun className={cn('absolute size-4 transition', isDark ? 'scale-50 opacity-0' : 'scale-100 opacity-100')} />
        <Moon className={cn('absolute size-4 transition', isDark ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
      </span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
