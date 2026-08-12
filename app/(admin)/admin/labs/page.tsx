// D:\pasco-lab-portal\app\(admin)\admin\labs\page.tsx
import Link from 'next/link'
import { Filter, Grid2X2, Plus, Search, Table2 } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs } from '@/lib/queries'
import LabDeleteButton from '@/components/LabDeleteButton'
import LabPublishToggle from '@/components/LabPublishToggle'
import type { Lab } from '@/types'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { adminPath } from '@/lib/admin-routes'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'

interface AdminLabsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function AdminLabsPage({ searchParams }: AdminLabsPageProps) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'labsList')
  const params = await searchParams
  const query = String(params.q ?? '').trim().toLowerCase()
  const status = String(params.status ?? 'all')

  let labs: Lab[] = []
  try { labs = await getLabs({ adminMode: true, locale }) } catch (error) { console.error(error) }
  const publishedCount = labs.filter((lab) => lab.is_published).length
  const draftCount = labs.length - publishedCount
  const visibleLabs = labs.filter((lab) => {
    const matchesStatus =
      status === 'published' ? lab.is_published : status === 'draft' ? !lab.is_published : true
    const haystack = `${lab.title} ${lab.content ?? ''} ${lab.subjects?.name ?? ''} ${lab.grades?.label ?? ''}`.toLowerCase()
    return matchesStatus && (!query || haystack.includes(query))
  })
  const labels = locale === 'ky'
    ? {
        all: 'Баары',
        published: 'Жарыяланган',
        drafts: 'Черновиктер',
        search: 'Аталышы же сүрөттөмөсү боюнча издөө',
        viewMode: 'Көрүнүш',
      }
    : {
        all: 'Все',
        published: 'Опубликованные',
        drafts: 'Черновики',
        search: 'Поиск по названию или описанию',
        viewMode: 'Вид',
      }

  return (
    <div className="space-y-8">
      <div className="pro-page-header">
        <div>
          <div className="section-kicker">{copy.kicker}</div>
          <h1 className="pro-page-title">{copy.title}</h1>
          <p className="pro-page-description">{visibleLabs.length} / {labs.length} • {copy.intro}</p>
        </div>
        <Link href={adminPath('/labs/new')} className="btn-primary shrink-0"><Plus size={16} />{copy.newLab}</Link>
      </div>
      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: labels.all, value: labs.length },
              { label: labels.published, value: publishedCount },
              { label: labels.drafts, value: draftCount },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--background-2)] px-4 py-3">
                <div className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted-soft)]">{item.label}</div>
                <div className="mt-1 text-2xl font-black text-[var(--text)]">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <form action={adminPath('/labs')} className="relative block min-w-[min(100%,340px)]">
              <input type="hidden" name="status" value={status} />
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-soft)]" />
              <input name="q" defaultValue={params.q ?? ''} className="form-input pl-10" placeholder={labels.search} aria-label={labels.search} />
            </form>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: labels.all },
                { value: 'published', label: labels.published },
                { value: 'draft', label: labels.drafts },
              ].map((item) => (
                <Link
                  key={item.value}
                  href={`${adminPath('/labs')}?status=${item.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ''}`}
                  className={`button-secondary min-h-11 px-4 ${status === item.value ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-200' : ''}`}
                >
                  <Filter size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              <button type="button" className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700 dark:bg-blue-500/12 dark:text-blue-200" aria-label="Cards"><Grid2X2 size={16} /></button>
              <button type="button" className="rounded-lg px-3 py-2 text-[var(--muted)]" aria-label="Table"><Table2 size={16} /></button>
            </div>
          </div>
        </div>
      </section>
      {visibleLabs.length === 0 ? (
        <div className="admin-empty-state">{copy.empty}</div>
      ) : (
        <>
        <div className="grid gap-3 md:hidden">
          {visibleLabs.map((lab) => (
            <article key={lab.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-bold text-[var(--text)]">{lab.title}</h2><p className="mt-1 text-xs text-[var(--muted)]">{lab.subjects?.icon} {lab.subjects?.name ?? copy.noSubject} · {lab.grades?.label ?? copy.noGrade}</p></div><LabPublishToggle labId={lab.id} isPublished={lab.is_published} locale={locale} /></div>
              <div className="mt-4 flex flex-wrap gap-2"><Link href={`/labs/${lab.slug}`} target="_blank" className="button-secondary min-h-10 flex-1 px-3 py-2 text-xs">{copy.view}</Link><Link href={adminPath(`/labs/${encodeURIComponent(lab.id)}/edit`)} className="button-primary min-h-10 flex-1 px-3 py-2 text-xs">{copy.edit}</Link><LabDeleteButton labId={lab.id} labTitle={lab.title} locale={locale} /></div>
            </article>
          ))}
        </div>
        <section className="admin-table-wrap hidden md:block">
          <div className="admin-table-header"><div className="admin-table-title">{copy.title}</div><Link href={adminPath('/labs/new')} className="btn-primary">{copy.newLab}</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th>{copy.title}</th><th>{copy.subject}</th><th>{copy.grade}</th><th>{copy.status}</th><th style={{ textAlign: 'right' }}>{copy.actions}</th></tr></thead>
              <tbody>
                {visibleLabs.map(lab => (
                  <tr key={lab.id}>
                    <td><div className="td-lab-name">{lab.title}</div><div className="td-lab-slug">/{lab.slug}</div></td>
                    <td><div className="td-subject"><div className="td-subject-dot" style={{ background: lab.subjects?.color ?? '#3b72ff', boxShadow: `0 0 6px ${lab.subjects?.color ?? '#3b72ff'}` }} />{lab.subjects?.icon} {lab.subjects?.name ?? copy.noSubject}</div></td>
                    <td>{lab.grades?.label ?? copy.noGrade}</td>
                    <td><LabPublishToggle labId={lab.id} isPublished={lab.is_published} locale={locale} /></td>
                    <td><div className="td-actions"><Link href={`/labs/${lab.slug}`} target="_blank" className="td-action-link">{copy.view}</Link><Link href={adminPath(`/labs/${encodeURIComponent(lab.id)}/edit`)} className="td-action-link">{copy.edit}</Link><LabDeleteButton labId={lab.id} labTitle={lab.title} locale={locale} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        </>
      )}
    </div>
  )
}
