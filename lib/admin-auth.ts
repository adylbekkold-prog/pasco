import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { ADMIN_LOGIN_PATH } from '@/lib/admin-routes'


const ADMIN_AUTH_COOKIE = 'pasco_admin_auth'
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_ADMIN_LOGIN_MAX_ATTEMPTS = 10

interface AdminLoginFailure {
  count: number
  firstAttemptAt: number
}

const adminLoginFailures = new Map<string, AdminLoginFailure>()

function normalize(value: string | undefined) {
  return value?.trim() ?? ''
}

function getConfiguredPassword() {
  return normalize(process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PANEL_PASSWORD)
}

function getSigningSecret() {
  const configuredSecret = normalize(process.env.ADMIN_SESSION_SECRET)
  if (configuredSecret) return configuredSecret
  if (process.env.NODE_ENV === 'production') return ''
  return getConfiguredPassword()
}

function signPayload(payload: string) {
  const signingSecret = getSigningSecret()
  if (!signingSecret) {
    throw new Error('ADMIN_SESSION_SECRET is required for admin sessions in production.')
  }

  return createHmac('sha256', signingSecret).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = createHash('sha256').update(left).digest()
  const rightBuffer = createHash('sha256').update(right).digest()
  return timingSafeEqual(leftBuffer, rightBuffer)
}

function getMaxLoginAttempts() {
  const configured = Number.parseInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? '', 10)
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_ADMIN_LOGIN_MAX_ATTEMPTS
}

function getFailureRecord(key: string, now = Date.now()) {
  const existing = adminLoginFailures.get(key)
  if (!existing) return null

  if (now - existing.firstAttemptAt > ADMIN_LOGIN_WINDOW_MS) {
    adminLoginFailures.delete(key)
    return null
  }

  return existing
}

export function isAdminPasswordConfigured() {
  return getConfiguredPassword().length > 0
}

export function isAdminSessionSecretConfigured() {
  return normalize(process.env.ADMIN_SESSION_SECRET).length > 0
}

export function isAdminAuthConfigured() {
  return (
    isAdminPasswordConfigured() &&
    (process.env.NODE_ENV !== 'production' || isAdminSessionSecretConfigured())
  )
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
  if (!isAdminAuthConfigured()) return false

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

export function getAdminLoginRateLimitState(key: string, now = Date.now()) {
  const failure = getFailureRecord(key, now)
  const count = failure?.count ?? 0
  const maxAttempts = getMaxLoginAttempts()
  const limited = count >= maxAttempts
  const retryAfterSeconds =
    limited && failure
      ? Math.max(1, Math.ceil((ADMIN_LOGIN_WINDOW_MS - (now - failure.firstAttemptAt)) / 1000))
      : 0

  return {
    limited,
    remaining: Math.max(0, maxAttempts - count),
    retryAfterSeconds,
  }
}

export function recordFailedAdminLogin(key: string, now = Date.now()) {
  const existing = getFailureRecord(key, now)
  if (!existing) {
    adminLoginFailures.set(key, { count: 1, firstAttemptAt: now })
    return
  }

  existing.count += 1
}

export function clearAdminLoginFailures(key: string) {
  adminLoginFailures.delete(key)
}

export function getAdminLoginRateLimitKey(headersList: Headers) {
  const forwardedFor = headersList
    .get('x-forwarded-for')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1)

  return (
    headersList.get('x-real-ip')?.trim() ||
    forwardedFor ||
    headersList.get('host')?.trim() ||
    'unknown'
  )
}

export function getAdminLoginPath(nextPath?: string) {
  if (!nextPath) return ADMIN_LOGIN_PATH
  return `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`
}
