// D:\pasco-lab-portal\app\(admin)\admin\pasco-kits\new\page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalSubjects } from '@/lib/local-db'
import { adminPath } from '@/lib/admin-routes'

import { Button } from '@/components/ui/button'
import { PascoKitForm } from '@/components/PascoKitForm'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
async function NewKitPage() {
  const locale = await getCurrentLocale()

  const copy = getAdminCopy(locale, 'pascoKitNew')
  const subjects = await getLocalSubjects(locale)
  return (
    <div className="max-w-2xl space-y-8">
      <div><Link href={adminPath('/pasco-kits')}><Button variant="outline" className="gap-2 mb-4"><ArrowLeft size={18} />{copy.back}</Button></Link></div>
      <PascoKitForm subjects={subjects} locale={locale} />
    </div>
  )
}
export default NewKitPage
