// D:\pasco-lab-portal\app\(admin)\admin\pasco-kits\[id]\page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalPascoKitById, getLocalSubjects } from '@/lib/local-db'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { Button } from '@/components/ui/button'
import { PascoKitForm } from '@/components/PascoKitForm'
import { PascoKitComponentsList } from '@/components/PascoKitComponentsList'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
interface KitEditPageProps { params: Promise<{ id: string }> }
async function KitEditPage(props: KitEditPageProps) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const params = await props.params
  const copy = getAdminCopy(locale, 'pascoKitEdit')
  const [kit, subjects] = await Promise.all([getLocalPascoKitById(params.id, locale), getLocalSubjects(locale)])
  if (!kit) notFound()
  return (
    <div className="max-w-4xl space-y-8">
      <div><Link href="/admin/pasco-kits"><Button variant="outline" className="gap-2 mb-4"><ArrowLeft size={18} />{copy.back}</Button></Link></div>
      <PascoKitForm subjects={subjects} locale={locale} initialKit={kit} onSuccess={() => {}} />
      <div className="rounded-lg border border-gray-200 bg-white p-6"><PascoKitComponentsList kitId={kit.id} components={kit.components || []} locale={locale} /></div>
    </div>
  )
}
export default KitEditPage