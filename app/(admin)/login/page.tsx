import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { FlaskConical, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeToggle from '@/components/ThemeToggle'
import { getAdminCopy } from '@/lib/i18n/admin'
import { getCurrentLocale } from '@/lib/locale-server'
import { adminPath, ADMIN_BASE_PATH } from '@/lib/admin-routes'
import {
  clearAdminLoginFailures,
  getAdminLoginRateLimitKey,
  getAdminLoginRateLimitState,
  hasAdminSession,
  isAdminAuthConfigured,
  isAdminPasswordConfigured,
  isAdminSessionSecretConfigured,
  recordFailedAdminLogin,
  setAdminSessionCookie,
  verifyAdminPassword,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>
}

function normalizeNextPath(value: string | undefined) {
  if (!value) return ADMIN_BASE_PATH
  if (value === ADMIN_BASE_PATH || value.startsWith(`${ADMIN_BASE_PATH}/`)) return value
  if (value === '/admin') return ADMIN_BASE_PATH
  if (value.startsWith('/admin/')) return adminPath(value.slice('/admin'.length))
  return ADMIN_BASE_PATH
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'login')
  const params = await searchParams
  const nextPath = normalizeNextPath(params.next)
  const passwordConfigured = isAdminPasswordConfigured()
  const sessionSecretConfigured = isAdminSessionSecretConfigured()
  const adminAuthConfigured = isAdminAuthConfigured()

  if (await hasAdminSession()) redirect(nextPath)

  async function handleLogin(formData: FormData) {
    'use server'

    const password = String(formData.get('password') ?? '')
    const next = normalizeNextPath(String(formData.get('next') ?? ''))
    const rateLimitKey = getAdminLoginRateLimitKey(await headers())
    const rateLimit = getAdminLoginRateLimitState(rateLimitKey)

    if (rateLimit.limited) {
      redirect(`${adminPath('/login')}?error=rate_limited&next=${encodeURIComponent(next)}`)
    }

    if (!isAdminAuthConfigured() || !verifyAdminPassword(password)) {
      recordFailedAdminLogin(rateLimitKey)
      redirect(`${adminPath('/login')}?error=1&next=${encodeURIComponent(next)}`)
    }

    clearAdminLoginFailures(rateLimitKey)
    await setAdminSessionCookie()
    redirect(next)
  }

  return (
    <div className="login-shell">
      <div className="login-bg-glow" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <FlaskConical size={20} />
          </div>
          <span className="login-logo-text">PASCO Lab</span>
          <ThemeToggle className="ml-auto" />
        </div>

        <h1 className="login-title">{copy.title}</h1>
        <p className="login-sub">
          {locale === 'ky'
            ? 'Админ панелге кирүү үчүн сырсөздү жазыңыз.'
            : 'Введите пароль, чтобы открыть админ-панель.'}
        </p>

        {!passwordConfigured && (
          <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {locale === 'ky'
              ? 'ADMIN_PASSWORD .env.local ичинде коюлган эмес.'
              : 'ADMIN_PASSWORD не задан в .env.local.'}
          </div>
        )}

        {passwordConfigured && process.env.NODE_ENV === 'production' && !sessionSecretConfigured && (
          <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {locale === 'ky'
              ? 'ADMIN_SESSION_SECRET production үчүн коюлган эмес.'
              : 'ADMIN_SESSION_SECRET не задан для production.'}
          </div>
        )}

        {params.error && (
          <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {params.error === 'rate_limited'
              ? locale === 'ky'
                ? 'Өтө көп аракет. Бир аздан кийин кайра аракет кылыңыз.'
                : 'Слишком много попыток. Попробуйте позже.'
              : locale === 'ky'
                ? 'Сырсөз туура эмес.'
                : 'Неверный пароль.'}
          </div>
        )}

        <form action={handleLogin}>
          <input type="hidden" name="next" value={nextPath} />
          <div className="login-form-group">
            <Label htmlFor="password">{copy.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={locale === 'ky' ? 'Админ сырсөзү' : 'Пароль админки'}
              required
              disabled={!adminAuthConfigured}
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-[14px]" disabled={!adminAuthConfigured}>
            <LockKeyhole size={16} />
            {copy.login}
          </Button>
        </form>

        <p className="login-note">
          <ShieldCheck size={15} />
          {locale === 'ky'
            ? 'Дарек жашырылды: /sersdp. Сырсөздү эч кимге бербеңиз.'
            : 'Адрес скрыт: /sersdp. Не передавайте пароль посторонним.'}
        </p>
      </div>
    </div>
  )
}
