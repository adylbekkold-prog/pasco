import Link from 'next/link'
import { Boxes, Plus } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalSubjects } from '@/lib/local-db'
import { getPascoKits } from '@/lib/queries'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'

import { adminPath } from '@/lib/admin-routes'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'

export default async function PascoKitsPage() {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'pascoKitsList')
  const [kits, subjects] = await Promise.all([getPascoKits(undefined, locale), getLocalSubjects(locale)])

  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="section-kicker">{copy.kicker}</div><h1 className="admin-page-title mb-0 mt-4">{copy.title}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{copy.intro}</p></div>
        <Link href={adminPath('/pasco-kits/new')} className="btn-primary"><Plus size={16} />{copy.newKit}</Link>
      </div>

      <section className="stats-grid"><article className="stat-card"><div className="stat-label">{copy.total}</div><div className="stat-value">{kits.length}</div><span className="stat-delta">PASCO Education</span></article></section>

      {kits.length === 0 ? <div className="admin-empty-state">{copy.empty}</div> : (
        <>
          <div className="grid gap-3 md:hidden">
            {kits.map((kit) => { const subject = subjectMap.get(kit.subject_id); return <article key={kit.id} className="surface-card p-5"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary)]"><Boxes size={19} /></span><div className="min-w-0"><h2 className="font-bold">{kit.name}</h2><p className="mt-1 text-xs text-[var(--muted)]">{subject?.icon} {subject?.name} · {kit.components?.length || 0} {copy.components.toLowerCase()}</p></div></div><Link href={adminPath(`/pasco-kits/${kit.id}`)} className="button-primary mt-4 w-full">{copy.edit}</Link></article> })}
          </div>
          <section className="admin-table-wrap hidden md:block">
            <div className="admin-table-header"><div className="admin-table-title">{copy.title}</div><Link href={adminPath('/pasco-kits/new')} className="btn-primary">{copy.newKit}</Link></div>
            <div className="overflow-x-auto"><table><thead><tr><th>{copy.kit}</th><th>{copy.subject}</th><th>{copy.components}</th><th>{copy.actions}</th></tr></thead><tbody>{kits.map((kit) => { const subject = subjectMap.get(kit.subject_id); return <tr key={kit.id}><td><div className="td-lab-name">{kit.name}</div>{kit.description && <div className="td-lab-slug line-clamp-1">{kit.description}</div>}</td><td>{subject?.icon} {subject?.name}</td><td>{kit.components?.length || 0}</td><td><Link href={adminPath(`/pasco-kits/${kit.id}`)} className="td-action-link">{copy.edit}</Link></td></tr> })}</tbody></table></div>
          </section>
        </>
      )}
    </div>
  )
}
