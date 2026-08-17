// D:\pasco-lab-portal\app\(admin)\admin\labs\new\page.tsx
import { getCurrentLocale } from '@/lib/locale-server'
import { getEquipment, getGrades, getSubjects } from '@/lib/queries'
import LabForm from '@/components/LabForm'
import { getAdminCopy } from '@/lib/i18n/admin'

export default async function NewLabPage() {
  const locale = await getCurrentLocale()

  const copy = getAdminCopy(locale, 'labNew')
  const [subjects, grades, equipment] = await Promise.all([getSubjects(locale), getGrades(locale), getEquipment(locale)])

  return (
    <div className="space-y-8">
      <div><div className="section-kicker">{copy.kicker}</div><h1 className="admin-page-title mb-0 mt-4">{copy.title}</h1><p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{copy.text}</p></div>
      <LabForm subjects={subjects} grades={grades} equipment={equipment} locale={locale} />
    </div>
  )
}