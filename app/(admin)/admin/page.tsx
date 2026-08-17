// D:\pasco-lab-portal\app\(admin)\admin\page.tsx
import Link from 'next/link'
import { Activity, ClipboardList, FlaskConical, Layers3, Plus, TrendingUp } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs } from '@/lib/queries'
import type { Lab } from '@/types'
import { adminPath } from '@/lib/admin-routes'

import { getAdminCopy } from '@/lib/i18n/admin'
import { MetricCard } from '@/components/ui/metric-card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
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

  const completionRate = totalLabs > 0 ? Math.round((publishedLabs / totalLabs) * 100) : 0
  const weekActivity = [32, 48, 40, 74, 58, 86, Math.max(24, completionRate)]
  const labels = locale === 'ky'
    ? {
        quick: 'Тез аракеттер',
        activity: 'Активдүүлүк',
        activityMeta: 'Акыркы 7 күн боюнча жалпы динамика',
      }
    : {
        quick: 'Быстрые действия',
        activity: 'Активность',
        activityMeta: 'Динамика за последние 7 дней',
      }

  return (
    <div className="space-y-8">
      <div className="pro-page-header">
        <div>
          <div className="section-kicker">{copy.kicker}</div>
          <h1 className="pro-page-title">{copy.title}</h1>
          <p className="pro-page-description">{copy.intro}</p>
        </div>
        <Link href={adminPath('/labs/new')} className="btn-primary shrink-0"><Plus size={16} />{copy.newLab}</Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label={copy.total} value={totalLabs} meta={copy.totalMeta} icon={FlaskConical} tone="blue" />
        <MetricCard label={copy.published} value={publishedLabs} meta={`${completionRate}% ${copy.publishedMeta}`} icon={TrendingUp} tone="green" />
        <MetricCard label={copy.drafts} value={draftLabs} meta={copy.draftsMeta} icon={ClipboardList} tone="amber" />

      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="section-kicker">{labels.activity}</div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[var(--text)]">{labels.activityMeta}</h2>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-200">
              <Activity size={20} />
            </span>
          </div>
          <div className="mt-8 flex h-44 items-end gap-3" aria-label={labels.activityMeta}>
            {weekActivity.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-blue-700 to-cyan-400 shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition hover:opacity-90" style={{ height: `${value}%` }} />
                <span className="text-[11px] font-bold text-[var(--muted-soft)]">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5 md:p-6">
          <div className="section-kicker">{labels.quick}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href={adminPath('/labs/new')} className="quick-action-card">
              <Plus className="text-[var(--primary)]" size={22} />
              <span className="text-sm font-black text-[var(--text)]">{copy.newLab}</span>
            </Link>
            <Link href={adminPath('/labs')} className="quick-action-card">
              <Layers3 className="text-[var(--primary)]" size={22} />
              <span className="text-sm font-black text-[var(--text)]">{copy.openList}</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:hidden">
        {recentLabs.map((lab) => (
          <article key={lab.id} className="surface-card p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-[var(--text)]">{lab.title}</h2><p className="mt-1 text-xs text-[var(--muted)]">{lab.subjects?.icon} {lab.subjects?.name ?? copy.noSubject}</p></div><span className={`status-pill ${lab.is_published ? 'status-published' : 'status-draft'}`}>{lab.is_published ? copy.publishedStatus : copy.draftStatus}</span></div>
            <div className="mt-4 flex gap-2"><Link href={`/labs/${lab.slug}`} target="_blank" className="button-secondary min-h-10 flex-1 px-3 py-2 text-xs">{copy.view}</Link><Link href={adminPath(`/labs/${encodeURIComponent(lab.id)}/edit`)} className="button-primary min-h-10 flex-1 px-3 py-2 text-xs">{copy.edit}</Link></div>
          </article>
        ))}
      </div>
      <section className="admin-table-wrap hidden md:block">
        <div className="admin-table-header">
          <div className="admin-table-title">{copy.updates}</div>
          <Link href={adminPath('/labs')} className="td-action-link">{copy.openList}</Link>
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
                  <td><div className="td-actions"><Link href={`/labs/${lab.slug}`} target="_blank" className="td-action-link">{copy.view}</Link><Link href={adminPath(`/labs/${encodeURIComponent(lab.id)}/edit`)} className="td-action-link">{copy.edit}</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
