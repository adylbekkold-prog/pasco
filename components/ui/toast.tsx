'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'

type Toast = {
  id: string
  kind: ToastKind
  title: string
  description?: string
}

type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current.slice(-2), { ...toast, id }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] grid w-[min(92vw,380px)] gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = icons[toast.kind]
          return (
            <div key={toast.id} className={cn('toast-card', `toast-${toast.kind}`)}>
              <Icon size={19} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-[var(--text)]">{toast.title}</div>
                {toast.description && <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{toast.description}</div>}
              </div>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted-soft)] transition hover:bg-black/5 hover:text-[var(--text)] dark:hover:bg-white/10"
                onClick={() => dismiss(toast.id)}
                aria-label="Закрыть уведомление"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
