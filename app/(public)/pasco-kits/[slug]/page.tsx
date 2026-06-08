// D:\pasco-lab-portal\app\(public)\pasco-kits\[slug]\page.tsx
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalPascoKitBySlug, getLocalSubjects } from '@/lib/local-db'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { getPublicCopy } from '@/lib/i18n/public'

export const dynamic = 'force-dynamic'
interface KitDetailPageProps { params: Promise<{ slug: string }> }
async function KitDetailPage(props: KitDetailPageProps) {
  const locale = await getCurrentLocale()
  const params = await props.params
  const copy = getPublicCopy(locale, 'pascoKitDetail')
  const [kit, subjects] = await Promise.all([getLocalPascoKitBySlug(params.slug, locale), getLocalSubjects(locale)])
  if (!kit) notFound()
  const subject = subjects.find(s => s.id === kit.subject_id)
  return (
    <div className="space-y-8"><div><Link href="/pasco-kits"><Button variant="outline" className="gap-2 mb-4"><ArrowLeft size={18} />{copy.backToCatalog}</Button></Link></div>
    <div className="rounded-lg border border-gray-200 bg-white p-8"><div className="grid gap-8 md:grid-cols-3"><div className="md:col-span-1">{kit.thumbnail_url ? <img src={kit.thumbnail_url} alt={kit.name} className="w-full rounded-lg object-cover" /> : <div className="aspect-square flex items-center justify-center rounded-lg bg-gray-100"><Package size={48} className="text-gray-400" /></div>}</div><div className="md:col-span-2 space-y-4"><div><h1 className="text-3xl font-bold">{kit.name}</h1>{subject && <p className="mt-2 text-lg text-gray-600">{subject.icon} {subject.name}</p>}</div>{kit.description && <div><h2 className="font-semibold mb-2">Описание</h2><p className="text-gray-700 whitespace-pre-line">{kit.description}</p></div>}<div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg"><div><p className="text-sm text-gray-600">{copy.components}</p><p className="text-2xl font-bold">{kit.components?.length || 0}</p></div></div></div></div></div>
    <div className="space-y-4"><h2 className="text-2xl font-bold">{copy.components}</h2>{!kit.components || kit.components.length === 0 ? <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center"><Package size={32} className="mx-auto mb-4 text-gray-400" /><p className="text-gray-600">{copy.noComponents}</p></div> : <div className="grid gap-4">{kit.components.map(component => (<div key={component.id} className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"><div className="grid gap-6 md:grid-cols-3">{component.photo_url ? <div className="md:col-span-1"><img src={component.photo_url} alt={component.name} className="w-full rounded-lg object-cover" /></div> : <div className="md:col-span-1 aspect-square flex items-center justify-center rounded-lg bg-gray-100"><Package size={32} className="text-gray-400" /></div>}<div className="md:col-span-2 space-y-3"><div className="flex items-start justify-between"><h3 className="text-lg font-semibold">{component.name}</h3><span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">×{component.quantity}</span></div>{component.description && <div><p className="text-sm font-medium text-gray-700">{copy.description}</p><p className="text-gray-600">{component.description}</p></div>}{component.storage_location && <div><p className="text-sm font-medium text-gray-700">{copy.storageLocation}</p><p className="text-gray-600">📦 {component.storage_location}</p></div>}{component.notes && <div><p className="text-sm font-medium text-gray-700">{copy.notes}</p><p className="text-gray-600">{component.notes}</p></div>}</div></div></div>))}</div>}</div></div>
  )
}
export default KitDetailPage