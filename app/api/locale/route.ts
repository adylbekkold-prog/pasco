import { NextResponse } from 'next/server'
import { defaultLocale, isLocale, localeCookieName } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { locale?: string } | null
  const locale = payload?.locale
  const nextLocale = isLocale(locale) ? locale : defaultLocale

  const response = NextResponse.json({ ok: true, locale: nextLocale })
  response.cookies.set(localeCookieName, nextLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}
