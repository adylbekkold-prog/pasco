// D:\pasco-lab-portal\app\(admin)\admin\labs\page.tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs } from '@/lib/queries'
import LabDeleteButton from '@/components/LabDeleteButton'
import LabPublishToggle from '@/components/LabPublishToggle'
import type { Lab } from '@/types'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'

export default async function AdminLabsPage() {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'labsList')

  let labs: Lab[] = []
  try { labs = await getLabs({ adminMode: true, locale }) } catch (error) { console.error(error) }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">{copy.kicker}</div>
          <h1 className="admin-page-title mb-0 mt-4">{copy.title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{labs.length} • {copy.intro}</p>
        </div>
        <Link href="/admin/labs/new" className="btn-primary">{copy.newLab}</Link>
      </div>
      {labs.length === 0 ? (
        <div className="admin-empty-state">{copy.empty}</div>
      ) : (
        <section className="admin-table-wrap">
          <div className="admin-table-header"><div className="admin-table-title">{copy.title}</div><Link href="/admin/labs/new" className="btn-primary">{copy.newLab}</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th>{copy.title}</th><th>{copy.subject}</th><th>{copy.grade}</th><th>{copy.status}</th><th style={{ textAlign: 'right' }}>{copy.actions}</th></tr></thead>
              <tbody>
                {labs.map(lab => (
                  <tr key={lab.id}>
                    <td><div className="td-lab-name">{lab.title}</div><div className="td-lab-slug">/{lab.slug}</div></td>
                    <td><div className="td-subject"><div className="td-subject-dot" style={{ background: lab.subjects?.color ?? '#3b72ff', boxShadow: `0 0 6px ${lab.subjects?.color ?? '#3b72ff'}` }} />{lab.subjects?.icon} {lab.subjects?.name ?? copy.noSubject}</div></td>
                    <td>{lab.grades?.label ?? copy.noGrade}</td>
                    <td><LabPublishToggle labId={lab.id} isPublished={lab.is_published} locale={locale} /></td>
                    <td><div className="td-actions"><Link href={`/labs/${lab.slug}`} target="_blank" className="td-action-link">{copy.view}</Link><Link href={`/admin/labs/${encodeURIComponent(lab.id)}/edit`} className="td-action-link">{copy.edit}</Link><LabDeleteButton labId={lab.id} labTitle={lab.title} locale={locale} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}