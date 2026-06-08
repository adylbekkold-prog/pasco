// D:\pasco-lab-portal\app\(admin)\admin\page.tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs } from '@/lib/queries'
import type { Lab } from '@/types'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'dashboard')

  let totalLabs = 0, publishedLabs = 0, draftLabs = 0
  let recentLabs: Lab[] = []

  try {
    const labs = await getLabs({ adminMode: true, locale })
    totalLabs = labs.length
    publishedLabs = labs.filter(l => l.is_published).length
    draftLabs = labs.filter(l => !l.is_published).length
    recentLabs = labs.slice(0, 5)
  } catch (error) { console.error('AdminDashboard data error:', error) }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">{copy.kicker}</div>
          <h1 className="admin-page-title mb-0 mt-4">{copy.title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{copy.intro}</p>
        </div>
        <Link href="/admin/labs/new" className="btn-primary">{copy.newLab}</Link>
      </div>
      <section className="stats-grid">
        {[
          { label: copy.total, value: totalLabs, delta: copy.totalMeta },
          { label: copy.published, value: publishedLabs, delta: copy.publishedMeta },
          { label: copy.drafts, value: draftLabs, delta: copy.draftsMeta },
        ].map(item => (
          <article key={item.label} className="stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
            <span className="stat-delta up">{item.delta}</span>
          </article>
        ))}
      </section>
      <section className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-table-title">{copy.updates}</div>
          <Link href="/admin/labs" className="td-action-link">{copy.openList}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th>{copy.lab}</th><th>{copy.subject}</th><th>{copy.status}</th><th style={{ textAlign: 'right' }}>{copy.actions}</th></tr></thead>
            <tbody>
              {recentLabs.map(lab => (
                <tr key={lab.id}>
                  <td><div className="td-lab-name">{lab.title}</div><div className="td-lab-slug">/{lab.slug}</div></td>
                  <td><div className="td-subject"><div className="td-subject-dot" style={{ background: lab.subjects?.color ?? '#3b72ff', boxShadow: `0 0 6px ${lab.subjects?.color ?? '#3b72ff'}` }} />{lab.subjects?.icon} {lab.subjects?.name ?? copy.noSubject}</div></td>
                  <td><span className={`status-pill ${lab.is_published ? 'status-published' : 'status-draft'}`}>{lab.is_published ? copy.publishedStatus : copy.draftStatus}</span></td>
                  <td><div className="td-actions"><Link href={`/labs/${lab.slug}`} target="_blank" className="td-action-link">{copy.view}</Link><Link href={`/admin/labs/${encodeURIComponent(lab.id)}/edit`} className="td-action-link">{copy.edit}</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}