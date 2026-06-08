// D:\pasco-lab-portal\app\(admin)\admin\labs\[id]\edit\page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale-server'
import { getEquipment, getGrades, getLabById, getLabBySlug, getSubjects } from '@/lib/queries'
import LabEditForm from '@/components/LabEditForm'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
interface EditLabPageProps { params: Promise<{ id: string }> }
function isUUID(str: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) }
async function resolveLabForEdit(ref: string, locale: 'ru' | 'ky') {
  try {
    if (isUUID(ref)) return await getLabById(ref, locale)
    else return await getLabBySlug(ref, locale)
  } catch { return null }
}

export default async function EditLabPage({ params }: EditLabPageProps) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()
  const copy = getAdminCopy(locale, 'labEdit')
  const { id } = await params
  const decodedRef = decodeURIComponent(id)
  const lab = await resolveLabForEdit(decodedRef, locale)
  if (!lab) notFound()

  const [subjects, grades, equipment] = await Promise.all([
    getSubjects(locale).catch(e => (console.error(e), [])),
    getGrades(locale).catch(e => (console.error(e), [])),
    getEquipment(locale).catch(e => (console.error(e), []))
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3"><Link href="/admin/labs" className="td-action-link">{copy.back}</Link><h1 className="admin-page-title mb-0">{copy.title}</h1></div>
      <LabEditForm lab={lab} subjects={subjects} grades={grades} equipment={equipment} locale={locale} />
    </div>
  )
}