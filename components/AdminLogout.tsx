'use client'

import { useRouter } from 'next/navigation'
import { getDataProvider, isLocalOnlyMode } from '@/lib/data-provider'
import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/types'

export default function AdminLogout({ locale = 'ru' }: { locale?: Locale }) {
  const router = useRouter()
  const localMode = isLocalOnlyMode(getDataProvider())

  const logout = async () => {
    if (localMode) {
      router.push('/')
      router.refresh()
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="w-full rounded-[10px] border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[rgba(255,77,106,.24)] hover:bg-[rgba(255,77,106,.10)] hover:text-[var(--danger)]"
    >
      {localMode
        ? locale === 'ky'
          ? 'Админканы жабуу'
          : 'Закрыть админку'
        : locale === 'ky'
          ? 'Панелден чыгуу'
          : 'Выйти из панели'}
    </button>
  )
}
