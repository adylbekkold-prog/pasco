// D:\pasco-lab-portal\app\(admin)\admin\pasco-kits\page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalPascoKits, getLocalSubjects } from '@/lib/local-db'
import { Button } from '@/components/ui/button'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
async function PascoKitsPage() {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'pascoKitsList')
  const [kits, subjects] = await Promise.all([getLocalPascoKits(undefined, locale), getLocalSubjects(locale)])
  const subjectMap = new Map(subjects.map(s => [s.id, s]))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="section-kicker">{copy.kicker}</div><h1 className="section-title">{copy.title}</h1><p className="mt-2 text-gray-600">{copy.intro}</p></div><Link href="/admin/pasco-kits/new"><Button className="gap-2"><Plus size={18} />{copy.newKit}</Button></Link></div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-lg border border-gray-200 bg-white p-6"><div className="text-sm text-gray-600">{copy.total}</div><div className="mt-2 text-3xl font-bold">{kits.length}</div></div></div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {kits.length === 0 ? <div className="p-12 text-center"><p className="text-gray-600">{copy.empty}</p></div> : (
          <div className="overflow-x-auto"><table className="w-full"><thead className="border-b border-gray-200 bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{copy.kit}</th><th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{copy.subject}</th><th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{copy.components}</th><th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{copy.actions}</th></tr></thead><tbody className="divide-y divide-gray-200">
            {kits.map(kit => { const subject = subjectMap.get(kit.subject_id); return (
              <tr key={kit.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="font-medium">{kit.name}</div>{kit.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{kit.description}</p>}</td>
              <td className="px-6 py-4 text-sm">{subject && <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">{subject.icon} {subject.name}</span>}</td>
              <td className="px-6 py-4 text-sm">{kit.components?.length || 0}</td>
              <td className="px-6 py-4 text-sm"><div className="flex gap-2"><Link href={`/admin/pasco-kits/${kit.id}`}><Button size="sm" variant="outline">{copy.edit}</Button></Link></div></td></tr>
            )})}
          </tbody></table></div>
        )}
      </div>
    </div>
  )
}
export default PascoKitsPage