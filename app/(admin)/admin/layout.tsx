import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getAdminLoginPath } from '@/lib/admin-auth'
import { ADMIN_BASE_PATH } from '@/lib/admin-routes'
import { getCurrentLocale } from '@/lib/locale-server'
import AdminNavigation from '@/components/AdminNavigation'
import { getAdminCopy } from '@/lib/i18n/admin'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()

  try {
    await assertServerLocalAdminAccess()
  } catch {
    redirect(getAdminLoginPath(ADMIN_BASE_PATH))
  }

  const copy = getAdminCopy(locale, 'adminLayout')
  const userEmail = copy.localAdmin
  const userInitial = userEmail.slice(0, 1).toUpperCase() || (locale === 'ky' ? 'Ж' : 'L')

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_9%,transparent),transparent_34%),var(--background)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <AdminNavigation locale={locale} copy={copy} userEmail={userEmail} userInitial={userInitial} />
      <main className="min-w-0 p-4 md:p-6 lg:p-10">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
