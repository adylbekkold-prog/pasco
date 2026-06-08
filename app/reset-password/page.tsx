// D:\pasco-lab-portal\app\reset-password\page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FlaskConical, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getSupabasePublicEnvIssue } from '@/lib/supabase/env'
import { getPublicCopy } from '@/lib/i18n/public'

type PageMode = 'request' | 'recover'
function normalizeAuthError(message: string, code?: string | null, description?: string | null) {
  const normalized = `${message} ${description ?? ''}`.toLowerCase()
  if (code === 'otp_expired' || normalized.includes('expired')) return 'Ссылка для восстановления уже истекла. Запросите новую ниже.'
  if (normalized.includes('invalid') || normalized.includes('access_denied')) return 'Ссылка недействительна или уже была использована. Запросите новую.'
  if (normalized.includes('code verifier')) return 'Ссылку нужно открыть в том же браузере, где был запрошен сброс. Проще всего запросить новую ссылку.'
  return message || 'Не удалось подтвердить ссылку для восстановления. Запросите новое письмо.'
}
function replaceResetUrl() { if (typeof window !== 'undefined') window.history.replaceState(window.history.state, '', '/reset-password') }

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<PageMode>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestPending, setRequestPending] = useState(false)
  const [passwordPending, setPasswordPending] = useState(false)
  const router = useRouter()
  const envIssue = getSupabasePublicEnvIssue()
  const locale = typeof document !== 'undefined' && document.documentElement.lang === 'ky' ? 'ky' : 'ru'
  const copy = getPublicCopy(locale, 'resetPassword')

  useEffect(() => {
    if (envIssue) { setError(envIssue); setLoading(false); return }
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') { setMode('recover'); setInfo(copy.infoRecover); setError(''); setLoading(false); replaceResetUrl() }
    })
    const prepareRecovery = async () => {
      const currentUrl = new URL(window.location.href)
      const hashParams = new URLSearchParams(currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash)
      const errorCode = hashParams.get('error_code') ?? currentUrl.searchParams.get('error_code')
      const errorDescription = hashParams.get('error_description') ?? currentUrl.searchParams.get('error_description')
      const authError = hashParams.get('error') ?? currentUrl.searchParams.get('error')
      if (authError || errorDescription) { setMode('request'); setInfo(copy.infoRequest); setError(normalizeAuthError(authError ?? '', errorCode, errorDescription)); replaceResetUrl(); setLoading(false); return }
      const tokenHash = currentUrl.searchParams.get('token_hash')
      const recoveryType = currentUrl.searchParams.get('type')
      const authCode = currentUrl.searchParams.get('code')
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const hashType = hashParams.get('type')
      if (tokenHash && recoveryType === 'recovery') {
        setInfo('Подтверждаем ссылку для смены пароля...')
        const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        if (verifyError) { setMode('request'); setError(normalizeAuthError(verifyError.message)); setInfo(copy.infoRequest); replaceResetUrl(); setLoading(false); return }
        setMode('recover'); setInfo(copy.infoRecover); setError(''); replaceResetUrl(); setLoading(false); return
      }
      if (authCode) {
        setInfo('Подтверждаем ссылку для смены пароля...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)
        if (exchangeError) { setMode('request'); setError(normalizeAuthError(exchangeError.message)); setInfo(copy.infoRequest); replaceResetUrl(); setLoading(false); return }
        setMode('recover'); setInfo(copy.infoRecover); setError(''); replaceResetUrl(); setLoading(false); return
      }
      if (hashType === 'recovery' && accessToken && refreshToken) {
        setInfo('Подготавливаем защищённую сессию...')
        const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (sessionError) { setMode('request'); setError(normalizeAuthError(sessionError.message)); setInfo(copy.infoRequest); replaceResetUrl(); setLoading(false); return }
        setMode('recover'); setInfo(copy.infoRecover); setError(''); replaceResetUrl(); setLoading(false); return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setMode('recover'); setInfo(copy.infoRecover) } else { setMode('request'); setInfo(copy.infoRequest) }
      setLoading(false)
    }
    prepareRecovery()
    return () => data.subscription.unsubscribe()
  }, [envIssue, copy])

  const handleResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (envIssue) { setError(envIssue); return }
    setRequestPending(true); setError(''); setInfo('')
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
      if (resetError) { setError(normalizeAuthError(resetError.message)); setRequestPending(false); return }
      setInfo(copy.resetSuccessInfo)
    } catch { setError(copy.errorRequest) } finally { setRequestPending(false) }
  }

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (envIssue) { setError(envIssue); return }
    if (password.length < 8) { setError(copy.errorShortPassword); return }
    if (password !== confirmPassword) { setError(copy.errorMismatch); return }
    setPasswordPending(true); setError(''); setInfo('')
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError(normalizeAuthError(updateError.message)); setPasswordPending(false); return }
      await supabase.auth.signOut()
      router.replace('/login?reset=success')
      router.refresh()
    } catch { setError(copy.errorDefault); setPasswordPending(false) }
  }

  return (
    <div className="login-shell"><div className="login-bg-glow" /><div className="login-card"><div className="login-logo"><div className="login-logo-icon"><FlaskConical size={20} /></div><span className="login-logo-text">PASCO Labs</span></div><h1 className="login-title">{mode === 'recover' ? copy.title : copy.requestTitle}</h1><p className="login-sub">{mode === 'recover' ? copy.subtitle : copy.requestSub}</p>{loading ? <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--muted)]">{copy.loadingCheck}</div> : <>{info && <div className="mb-4 rounded-[14px] border border-[rgba(0,212,255,.22)] bg-[rgba(0,212,255,.08)] px-4 py-3 text-sm font-medium text-[var(--secondary)]">{info}</div>}{error && <div className="mb-4 rounded-[14px] border border-[rgba(255,77,106,.24)] bg-[rgba(255,77,106,.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{error}</div>}{mode === 'recover' ? (<form onSubmit={handlePasswordUpdate}><div className="login-form-group"><Label htmlFor="password">{copy.newPassword}</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={copy.passwordMin} required /></div><div className="login-form-group"><Label htmlFor="confirm-password">{copy.confirmPassword}</Label><Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={copy.confirmPassword} required /></div><Button type="submit" size="lg" className="w-full rounded-[14px]" disabled={passwordPending}><KeyRound size={16} />{passwordPending ? copy.saving : copy.save}</Button></form>) : (<form onSubmit={handleResetRequest}><div className="login-form-group"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={copy.emailPlaceholder} required /></div><Button type="submit" size="lg" className="w-full rounded-[14px]" disabled={requestPending}><Mail size={16} />{requestPending ? copy.sending : copy.send}</Button></form>)}</>}<div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/login" className="inline-flex items-center gap-2 font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"><ArrowLeft size={15} />{copy.backToLogin}</Link><span className="inline-flex items-center gap-2 text-[var(--muted-soft)]"><ShieldCheck size={15} />{copy.linkExpires}</span></div></div></div>
  )
}