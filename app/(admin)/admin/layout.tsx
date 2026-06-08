// D:\pasco-lab-portal\app\(admin)\admin\layout.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChartColumnBig, FlaskConical, FolderKanban, Plus } from 'lucide-react'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { isLocalOnlyMode } from '@/lib/data-provider'
import { getCurrentLocale } from '@/lib/locale-server'
import { createClient } from '@/lib/supabase/server'
import AdminLogout from '@/components/AdminLogout'
import { getAdminCopy } from '@/lib/i18n/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()
  const localMode = isLocalOnlyMode()

  if (localMode) {
    try {
      await assertServerLocalAdminAccess()
    } catch {
      redirect('/')
    }
  }

  const copy = getAdminCopy(locale, 'adminLayout')

  let userEmail = copy.localAdmin
  let userInitial = locale === 'ky' ? 'Ж' : 'L'

  if (!localMode) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/admin/login')

    userEmail = user.email ?? userEmail
    userInitial = user.email?.slice(0, 1).toUpperCase() ?? userInitial
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="logo-row">
            <div className="logo-icon"><FlaskConical size={15} /></div>
            <div>
              <div className="logo-name">PASCO Admin</div>
              <div className="logo-role">{copy.role}</div>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-label">{copy.nav}</div>
          <Link href="/admin" className="admin-nav-item"><ChartColumnBig size={16} />{copy.dashboard}</Link>
          <Link href="/admin/labs" className="admin-nav-item"><FolderKanban size={16} />{copy.labs}</Link>
          <Link href="/admin/labs/new" className="admin-nav-item"><Plus size={16} />{copy.newLab}</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">{userInitial}</div>
            <div className="admin-user-email">{userEmail}</div>
          </div>
          <AdminLogout locale={locale} />
          <Link href="/" className="mt-2 inline-flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]">
            {copy.back}
          </Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}