'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const RESET_PASSWORD_PATH = '/reset-password'

export default function AuthHashRouter() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === RESET_PASSWORD_PATH || typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash

    const hashParams = new URLSearchParams(hash)

    const shouldHandleRecovery =
      searchParams.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery' ||
      searchParams.has('token_hash') ||
      hashParams.has('access_token') ||
      hashParams.has('refresh_token') ||
      hashParams.has('error_description') ||
      searchParams.has('code')

    if (!shouldHandleRecovery) return

    const query = searchParams.toString()
    const target = `${RESET_PASSWORD_PATH}${query ? `?${query}` : ''}${window.location.hash}`

    router.replace(target)
  }, [pathname, router])

  return null
}
