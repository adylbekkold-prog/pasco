'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { localeCookieName } from '@/lib/locale'
import type { Locale } from '@/types'

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 год
    path: '/',
    sameSite: 'lax',
  })

  // Пересчитать все пути
  revalidatePath('/', 'layout')
}
