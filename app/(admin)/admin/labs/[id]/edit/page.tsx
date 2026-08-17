// D:\pasco-lab-portal\app\(admin)\admin\labs\[id]\edit\page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale-server'
import { getEquipment, getGrades, getLabById, getLabBySlug, getSubjects } from '@/lib/queries'
import LabEditForm from '@/components/LabEditForm'
import { adminPath } from '@/lib/admin-routes'

import { getAdminCopy } from '@/lib/i18n/admin'

export const dynamic = 'force-dynamic'
interface EditLabPageProps { params: Promise<{ id: string }> }
function isUUID(str: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) }
async function resolveLabForEdit(ref: string, locale: 'ru' | 'ky') {
  try {
    if (isUUID(ref)) {
      return await getLabById(ref, locale)
    }

    const direct = await getLabBySlug(ref, locale)
    if (direct) return direct

    const fallback = await getLabBySlug(ref, locale === 'ky' ? 'ru' : 'ky')
    return fallback ?? null
  } catch {
    return null
  }
}

export default async function EditLabPage({ params }: EditLabPageProps) {
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
      <div className="flex flex-wrap items-center gap-3"><Link href={adminPath('/labs')} className="td-action-link">{copy.back}</Link><h1 className="admin-page-title mb-0">{copy.title}</h1></div>
      <LabEditForm lab={lab} subjects={subjects} grades={grades} equipment={equipment} locale={locale} />
    </div>
  )
}
