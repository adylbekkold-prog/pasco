import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
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
  // Check for standard private IP ranges
  return (
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.16.') ||
    host.startsWith('172.17.') ||
    host.startsWith('172.18.') ||
    host.startsWith('172.19.') ||
    host.startsWith('172.20.') ||
    host.startsWith('172.21.') ||
    host.startsWith('172.22.') ||
    host.startsWith('172.23.') ||
    host.startsWith('172.24.') ||
    host.startsWith('172.25.') ||
    host.startsWith('172.26.') ||
    host.startsWith('172.27.') ||
    host.startsWith('172.28.') ||
    host.startsWith('172.29.') ||
    host.startsWith('172.30.') ||
    host.startsWith('172.31.') ||
    host.startsWith('169.254.')
  )
}

export function isAllowedLocalAdminHost(host: string | null | undefined) {
  const normalized = normalizeHost(host)
  return isLoopbackHost(normalized) || isPrivateNetworkHost(normalized)
}

export function isAllowedLocalAdminRequest(request: NextRequest) {
  return isAllowedLocalAdminHost(
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host
  )
}

export async function assertServerLocalAdminAccess() {
  if (!isLocalOnlyMode()) return

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')

  if (!isAllowedLocalAdminHost(host)) {
    throw new Error('Локальная админка доступна только на этом компьютере.')
  }
}
