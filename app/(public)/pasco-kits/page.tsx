// D:\pasco-lab-portal\app\(public)\pasco-kits\page.tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalPascoKits, getLocalSubjects } from '@/lib/local-db'
import { Button } from '@/components/ui/button'
import { getPublicCopy } from '@/lib/i18n/public'

export const dynamic = 'force-dynamic'
async function PascoKitsCatalogPage() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'pascoKitsCatalog')
  const [kits, subjects] = await Promise.all([getLocalPascoKits(undefined, locale), getLocalSubjects(locale)])
  return (
    <div className="space-y-8"><div><div className="section-kicker">{copy.kicker}</div><h1 className="section-title">{copy.title}</h1><p className="mt-2 text-gray-600">{copy.intro}</p></div>{kits.length === 0 ? <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center"><p className="text-gray-600">{copy.noKits}</p></div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{kits.map(kit => { const subject = subjects.find(s => s.id === kit.subject_id); return (<Link key={kit.id} href={`/pasco-kits/${kit.slug}`} className="group rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow">{kit.thumbnail_url && <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100"><img src={kit.thumbnail_url} alt={kit.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" /></div>}<div className="space-y-2"><h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{kit.name}</h3>{subject && <p className="text-sm text-gray-600">{subject.icon} {subject.name}</p>}{kit.description && <p className="text-sm text-gray-600 line-clamp-2">{kit.description}</p>}<div className="pt-3 flex items-center justify-between text-sm"><span className="text-gray-500">{kit.components?.length || 0} {copy.components}</span><Button size="sm" variant="outline">{copy.view}</Button></div></div></Link>)})}</div>}</div>
  )
}
export default PascoKitsCatalogPage