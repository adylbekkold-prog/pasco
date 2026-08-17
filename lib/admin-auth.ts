import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { ADMIN_LOGIN_PATH } from '@/lib/admin-routes'


const ADMIN_AUTH_COOKIE = 'pasco_admin_auth'
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

function normalize(value: string | undefined) {
  return value?.trim() ?? ''
}

function getConfiguredPassword() {
  return normalize(process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PANEL_PASSWORD)
}

function getSigningSecret() {
  return normalize(process.env.ADMIN_SESSION_SECRET) || getConfiguredPassword()
}

function signPayload(payload: string) {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function isAdminPasswordConfigured() {
  return getConfiguredPassword().length > 0
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getConfiguredPassword()
  if (!configuredPassword) return false
  return safeEqual(password, configuredPassword)
}

export function createAdminSessionValue() {
  const payload = `${Date.now()}.${randomBytes(16).toString('base64url')}`
  return `${payload}.${signPayload(payload)}`
}

export function verifyAdminSessionValue(value: string | undefined) {
  if (!value || !getSigningSecret()) return false

  const parts = value.split('.')
  if (parts.length !== 3) return false

  const [createdAtValue, nonce, signature] = parts
  const createdAt = Number.parseInt(createdAtValue, 10)
  if (!Number.isFinite(createdAt)) return false

  const ageMs = Date.now() - createdAt
  if (ageMs < 0 || ageMs > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) return false

  const payload = `${createdAtValue}.${nonce}`
  return safeEqual(signature, signPayload(payload))
}

export async function hasAdminSession() {
  if (!isAdminPasswordConfigured()) return false

  const cookieStore = await cookies()
  return verifyAdminSessionValue(cookieStore.get(ADMIN_AUTH_COOKIE)?.value)
}

/**
 * Determines whether the current request arrived over a secure (HTTPS)
 * connection. When the app is served behind a reverse proxy (nginx), the
 * protocol is exposed via the X-Forwarded-Proto header. This matters because
 * a `Secure` cookie is only sent by browsers over HTTPS — if the site is
 * served over plain HTTP, marking the session cookie `Secure` would silently
 * break admin login (the cookie would never be sent back).
 */
async function isSecureConnection() {
  const headersList = await headers()
  const proto = headersList.get('x-forwarded-proto') ?? headersList.get('x-forwarded-protocol')
  if (proto) return proto.split(',')[0].trim() === 'https'
  return false
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_AUTH_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: await isSecureConnection(),
  })
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_AUTH_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: await isSecureConnection(),
  })
}


export function getAdminLoginPath(nextPath?: string) {
  if (!nextPath) return ADMIN_LOGIN_PATH
  return `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`
}
