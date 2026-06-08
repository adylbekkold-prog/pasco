import 'server-only'

import { cookies } from 'next/headers'
import { defaultLocale, localeCookieName, resolveLocale } from '@/lib/locale'
import type { Locale } from '@/types'

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return resolveLocale(cookieStore.get(localeCookieName)?.value ?? defaultLocale)
}
