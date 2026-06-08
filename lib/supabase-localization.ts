import type {
  Equipment,
  EquipmentItem,
  Grade,
  Lab,
  LabStep,
  Locale,
  Resource,
  Subject,
} from '@/types'

function normalizeText(value: string | null | undefined) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function getLocalizedText({
  locale,
  baseValue,
  ruValue,
  kyValue,
  fallbackValue,
}: {
  locale: Locale
  baseValue: string | null | undefined
  ruValue?: string | null
  kyValue?: string | null
  fallbackValue?: string | null
}) {
  return locale === 'ky'
    ? normalizeText(kyValue) ??
        normalizeText(baseValue) ??
        normalizeText(fallbackValue) ??
        normalizeText(ruValue)
    : normalizeText(ruValue) ??
        normalizeText(baseValue) ??
        normalizeText(fallbackValue) ??
        normalizeText(kyValue)
}

export function buildLocalizedTextColumns(
  baseField: string,
  value: string | null | undefined,
  locale: Locale,
  { includeBase = true }: { includeBase?: boolean } = {}
) {
  const normalized = normalizeText(value)
  const columns: Record<string, string | null> = {
    [`${baseField}_${locale}`]: normalized,
  }

  if (includeBase) {
    columns[baseField] = normalized
  }

  return columns
}

export function compactRow<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined)
  ) as T
}

export function localizeSubject(
  subject: Subject,
  locale: Locale,
  fallback?: Subject | null
): Subject {
  return {
    ...subject,
    name:
      getLocalizedText({
        locale,
        baseValue: subject.name,
        ruValue: subject.name_ru,
        kyValue: subject.name_ky,
        fallbackValue: fallback?.name,
      }) ?? subject.name,
    icon: subject.icon ?? fallback?.icon ?? null,
    color: subject.color ?? fallback?.color ?? null,
    sort_order: subject.sort_order ?? fallback?.sort_order ?? 0,
  }
}

export function localizeGrade(grade: Grade, locale: Locale, fallback?: Grade | null): Grade {
  return {
    ...grade,
    label:
      getLocalizedText({
        locale,
        baseValue: grade.label,
        ruValue: grade.label_ru,
        kyValue: grade.label_ky,
        fallbackValue: fallback?.label,
      }) ?? grade.label,
  }
}

export function localizeEquipment(
  equipment: Equipment,
  locale: Locale,
  fallback?: Equipment | null
): Equipment {
  return {
    ...equipment,
    name:
      getLocalizedText({
        locale,
        baseValue: equipment.name,
        ruValue: equipment.name_ru,
        kyValue: equipment.name_ky,
        fallbackValue: fallback?.name,
      }) ?? equipment.name,
  }
}

export function localizeLab(lab: Lab, locale: Locale, fallback?: Lab | null): Lab {
  return {
    ...lab,
    title:
      getLocalizedText({
        locale,
        baseValue: lab.title,
        ruValue: lab.title_ru,
        kyValue: lab.title_ky,
        fallbackValue: fallback?.title,
      }) ?? lab.title,
    topic:
      getLocalizedText({
        locale,
        baseValue: lab.topic,
        ruValue: lab.topic_ru,
        kyValue: lab.topic_ky,
        fallbackValue: fallback?.topic,
      }) ?? null,
    goal:
      getLocalizedText({
        locale,
        baseValue: lab.goal,
        ruValue: lab.goal_ru,
        kyValue: lab.goal_ky,
        fallbackValue: fallback?.goal,
      }) ?? null,
    expected_results:
      getLocalizedText({
        locale,
        baseValue: lab.expected_results,
        ruValue: lab.expected_results_ru,
        kyValue: lab.expected_results_ky,
        fallbackValue: fallback?.expected_results,
      }) ?? null,
    teacher_notes:
      getLocalizedText({
        locale,
        baseValue: lab.teacher_notes,
        ruValue: lab.teacher_notes_ru,
        kyValue: lab.teacher_notes_ky,
        fallbackValue: fallback?.teacher_notes,
      }) ?? null,
  }
}

export function localizeLabStep(step: LabStep, locale: Locale, fallback?: LabStep | null): LabStep {
  return {
    ...step,
    content:
      getLocalizedText({
        locale,
        baseValue: step.content,
        ruValue: step.content_ru,
        kyValue: step.content_ky,
        fallbackValue: fallback?.content,
      }) ?? null,
    caption:
      getLocalizedText({
        locale,
        baseValue: step.caption,
        ruValue: step.caption_ru,
        kyValue: step.caption_ky,
        fallbackValue: fallback?.caption,
      }) ?? null,
  }
}

export function localizeResource(
  resource: Resource,
  locale: Locale,
  fallback?: Resource | null
): Resource {
  return {
    ...resource,
    title:
      getLocalizedText({
        locale,
        baseValue: resource.title,
        ruValue: resource.title_ru,
        kyValue: resource.title_ky,
        fallbackValue: fallback?.title,
      }) ?? resource.title,
  }
}

export function localizeEquipmentItem(
  item: EquipmentItem,
  locale: Locale,
  fallback?: EquipmentItem | null
): EquipmentItem {
  return {
    ...item,
    item_name:
      getLocalizedText({
        locale,
        baseValue: item.item_name,
        ruValue: item.item_name_ru,
        kyValue: item.item_name_ky,
        fallbackValue: fallback?.item_name,
      }) ?? item.item_name,
    notes:
      getLocalizedText({
        locale,
        baseValue: item.notes,
        ruValue: item.notes_ru,
        kyValue: item.notes_ky,
        fallbackValue: fallback?.notes,
      }) ?? null,
  }
}
