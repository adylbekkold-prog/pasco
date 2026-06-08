// D:\pasco-lab-portal\app\(admin)\login\page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCurrentLocale } from '@/lib/locale-server'
import { isLocalOnlyMode } from '@/lib/data-provider'
import { createClient } from '@/lib/supabase/server'
import { getSupabasePublicEnvIssue } from '@/lib/supabase/env'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
export default async function LoginPage() {
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'login')
  const localMode = isLocalOnlyMode()
  const envIssue = getSupabasePublicEnvIssue()
  if (localMode) redirect('/admin')

  async function handleLogin(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: copy.loginError }
    redirect('/admin')
  }

  return (
    <div className="login-shell"><div className="login-bg-glow" /><div className="login-card"><div className="login-logo"><div className="login-logo-icon"><FlaskConical size={20} /></div><span className="login-logo-text">PASCO Labs</span></div>
      <h1 className="login-title">{copy.title}</h1><p className="login-sub">{copy.remoteText}</p>
      {envIssue && <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">{envIssue}</div>}
      <form action={handleLogin}>
        <div className="login-form-group"><Label htmlFor="email">{copy.email}</Label><Input id="email" name="email" type="email" placeholder="admin@school.edu" required /></div>
        <div className="login-form-group"><div className="flex justify-between"><Label htmlFor="password">{copy.password}</Label><Link href="/reset-password" className="text-sm font-semibold text-[var(--secondary)]">{copy.forgot}</Link></div><Input id="password" name="password" type="password" placeholder={copy.enterPassword} required /></div>
        <Button type="submit" size="lg" className="w-full rounded-[14px]">{copy.login}</Button>
      </form>
      <p className="login-note">{copy.note}</p>
    </div></div>
  )
}