import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { isLocalOnlyMode } from '@/lib/data-provider'

function normalizeHost(value: string | null | undefined) {
  const raw = value?.split(',')[0]?.trim().toLowerCase() ?? ''

  if (!raw) return ''

  if (raw.startsWith('[')) {
    const closingBracketIndex = raw.indexOf(']')
    return closingBracketIndex >= 0 ? raw.slice(1, closingBracketIndex) : raw
  }

  return raw.split(':')[0] ?? raw
}

function isLoopbackHost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

function isPrivateNetworkHost(host: string) {
  return (
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.startsWith('169.254.')
  )
}

function isClientFromTrustedProxy(request: NextRequest): boolean {
  const trustedProxies = process.env.TRUSTED_PROXIES
  if (!trustedProxies) return false

  const clientIp =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  if (!clientIp) return false

  const allowed = trustedProxies
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return allowed.some((cidr) => {
    if (cidr === clientIp) return true
    // Simple prefix match for CIDR-like values (e.g. "192.168.0.")
    if (cidr.endsWith('/')) return clientIp.startsWith(cidr)
    return false
  })
}

export function isAllowedLocalAdminHost(host: string | null | undefined) {
  const normalized = normalizeHost(host)
  const allowedHosts = [
    process.env.NEXT_PUBLIC_ADMIN_HOST,
    process.env.ADMIN_HOST,
    process.env.VPS_HOST,
  ].filter(Boolean) as string[]

  return (
    isLoopbackHost(normalized) ||
    isPrivateNetworkHost(normalized) ||
    allowedHosts.some((allowedHost) => normalizeHost(allowedHost) === normalized)
  )
}

export function isAllowedLocalAdminRequest(request: NextRequest) {
  const xForwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host') ?? request.nextUrl.host

  // Only trust X-Forwarded-Host when the client connects through a
  // known proxy (e.g. LAN nginx).  Without TRUSTED_PROXIES the header
  // is attacker-controlled and must be ignored.
  const effectiveHost =
    xForwardedHost && isClientFromTrustedProxy(request)
      ? xForwardedHost
      : host

  return isAllowedLocalAdminHost(effectiveHost)
}

export async function assertServerLocalAdminAccess() {
  if (!(await hasAdminSession())) {
    throw new Error('Для доступа к админке требуется пароль.')
  }

  if (!isLocalOnlyMode()) return

  const headersList = await headers()
  const xForwardedHost = headersList.get('x-forwarded-host')
  const host = headersList.get('host')

  // For server actions there is no NextRequest, so we fall back to
  // always using the direct Host header unless TRUSTED_PROXIES is set.
  const useForwarded = Boolean(process.env.TRUSTED_PROXIES) && Boolean(xForwardedHost)
  const effectiveHost = useForwarded ? xForwardedHost : host

  if (!isAllowedLocalAdminHost(effectiveHost)) {
    throw new Error('Локальная админка доступна только на этом компьютере.')
  }
}
