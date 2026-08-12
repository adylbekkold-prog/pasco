import { NextResponse } from 'next/server'
import { defaultLocale, isLocale, localeCookieName } from '@/lib/locale'

export const dynamic = 'force-dynamic'

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

function isLocalHostname(hostname: string) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return true

  const parts = hostname.split('.').map(Number)
  return parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31
}

function getRequestOrigin(request: Request, requestUrl: URL) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const hostHeader = request.headers.get('host') || forwardedHost

  if (!hostHeader) return requestUrl.origin

  try {
    const hostUrl = new URL(`http://${hostHeader}`)
    if (!isLocalHostname(hostUrl.hostname)) return requestUrl.origin

    const forwardedProtocol = request.headers.get('x-forwarded-proto')
    const protocol = forwardedProtocol === 'https' ? 'https:' : requestUrl.protocol
    return `${protocol}//${hostHeader}`
  } catch {
    return requestUrl.origin
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const requestedLocale = requestUrl.searchParams.get('locale')
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale
  const redirectPath = getSafeRedirect(requestUrl.searchParams.get('redirect'))
  const response = NextResponse.redirect(
    new URL(redirectPath, getRequestOrigin(request, requestUrl))
  )

  response.cookies.set(localeCookieName, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}
