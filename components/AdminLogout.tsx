'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { ADMIN_LOGIN_PATH } from '@/lib/admin-routes'
import type { Locale } from '@/types'

export default function AdminLogout({ locale = 'ru' }: { locale?: Locale }) {
  const router = useRouter()
  const { showToast } = useToast()

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      showToast({
        kind: 'success',
        title: locale === 'ky' ? 'Сессия жабылды' : 'Сессия завершена',
        description: locale === 'ky' ? 'Админ-панелден чыктыңыз.' : 'Вы вышли из админ-панели.',
      })
    } catch {
      showToast({
        kind: 'error',
        title: locale === 'ky' ? 'Чыгуу ишке ашкан жок' : 'Не удалось выйти',
        description: locale === 'ky' ? 'Баракты жаңыртып көрүңүз.' : 'Попробуйте обновить страницу.',
      })
    }
    router.push(ADMIN_LOGIN_PATH)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="w-full rounded-[10px] border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[rgba(255,77,106,.24)] hover:bg-[rgba(255,77,106,.10)] hover:text-[var(--danger)]"
    >
      {locale === 'ky' ? 'Панелден чыгуу' : 'Выйти из панели'}
    </button>
  )
}
