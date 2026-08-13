import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveLocale } from '@/lib/locale'
import type {
  Difficulty,
  Equipment,
  EquipmentItem,
  Grade,
  Lab,
  LabStep,
  LabStepDraft,
  Locale,
  PascoKit,
  PascoKitComponent,
  Resource,
  Subject,
} from '@/types'

export type StoredLab = Omit<
  Lab,
  'subjects' | 'grades' | 'equipment' | 'lab_steps' | 'resources' | 'lab_equipment_items'
> & { photo_urls?: string[] | null }

export type StoredPascoKit = Omit<PascoKit, 'subject' | 'components'>

export interface LocalLabMutationInput {
  title: string
  slug: string
  content: string | null
  subject_id: string | null
  grade_id: string | null
  equipment_ids: string[]
  photo_urls?: string[] | null
  difficulty?: Difficulty | null
  duration_minutes?: number | null
  steps?: LabStepDraft[]
  is_published: boolean
}

interface LocalDb {
  subjects: Subject[]
  grades: Grade[]
  equipment: Equipment[]
  labs: StoredLab[]
  lab_steps: LabStep[]
  resources: Resource[]
  lab_equipment_items: EquipmentItem[]
  pasco_kits: StoredPascoKit[]
  pasco_kit_components: PascoKitComponent[]
}

interface PascoKitReadOptions {
  fallbackLocale?: Locale
}

const DATA_DIRECTORY_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data')
const LEGACY_DB_FILE_PATH = path.join(DATA_DIRECTORY_PATH, 'local-db.json')
const DB_FILE_PATHS: Record<Locale, string> = {
  ru: path.join(DATA_DIRECTORY_PATH, 'local-db.ru.json'),
  ky: path.join(DATA_DIRECTORY_PATH, 'local-db.ky.json'),
}

const writeQueues: Record<Locale, Promise<void>> = {
  ru: Promise.resolve(),
  ky: Promise.resolve(),
}

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subject-physics',
    name: 'Физика',
    slug: 'physics',
    icon: '⚡',
    color: '#2b6fff',
    sort_order: 1,
  },
  {
    id: 'subject-chemistry',
    name: 'Химия',
    slug: 'chemistry',
    icon: '🧪',
    color: '#15b679',
    sort_order: 2,
  },
  {
    id: 'subject-biology',
    name: 'Биология',
    slug: 'biology',
    icon: '🧬',
    color: '#f0a229',
    sort_order: 3,
  },
]

const DEFAULT_SUBJECTS_KY: Subject[] = [
  {
    id: 'subject-physics',
    name: 'Физика',
    slug: 'physics',
    icon: '⚡',
    color: '#2b6fff',
    sort_order: 1,
  },
  {
    id: 'subject-chemistry',
    name: 'Химия',
    slug: 'chemistry',
    icon: '🧪',
    color: '#15b679',
    sort_order: 2,
  },
  {
    id: 'subject-biology',
    name: 'Биология',
    slug: 'biology',
    icon: '🧬',
    color: '#f0a229',
    sort_order: 3,
  },
]

const DEFAULT_GRADES: Grade[] = [
  { id: 'grade-7', level: 7, label: '7 класс' },
  { id: 'grade-8', level: 8, label: '8 класс' },
  { id: 'grade-9', level: 9, label: '9 класс' },
  { id: 'grade-10', level: 10, label: '10 класс' },
  { id: 'grade-11', level: 11, label: '11 класс' },
  { id: 'grade-12', level: 12, label: '12 класс' },
]

const DEFAULT_GRADES_KY: Grade[] = [
  { id: 'grade-7', level: 7, label: '7-класс' },
  { id: 'grade-8', level: 8, label: '8-класс' },
  { id: 'grade-9', level: 9, label: '9-класс' },
  { id: 'grade-10', level: 10, label: '10-класс' },
  { id: 'grade-11', level: 11, label: '11-класс' },
  { id: 'grade-12', level: 12, label: '12-класс' },
]

const DEFAULT_EQUIPMENT: Equipment[] = [
  {
    id: 'equipment-mechanics-kit',
    name: 'Комплект по механике',
    slug: 'mechanics-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-em-kit',
    name: 'Комплект по электричеству и магнетизму',
    slug: 'em-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-optics-kit',
    name: 'Комплект по оптике',
    slug: 'optics-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-fluids-kit',
    name: 'Комплект по жидкостям',
    slug: 'fluids-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-waves-kit',
    name: 'Комплект по волнам и звуку',
    slug: 'waves-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-chem-starter',
    name: 'Стартовый набор по химии',
    slug: 'chem-starter',
    subject_id: 'subject-chemistry',
  },
  {
    id: 'equipment-bio-starter',
    name: 'Стартовый набор по биологии',
    slug: 'bio-starter',
    subject_id: 'subject-biology',
  },
]

const DEFAULT_EQUIPMENT_KY: Equipment[] = [
  {
    id: 'equipment-mechanics-kit',
    name: 'Механика комплекти',
    slug: 'mechanics-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-em-kit',
    name: 'Электр жана магнетизм комплекти',
    slug: 'em-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-optics-kit',
    name: 'Оптика комплекти',
    slug: 'optics-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-fluids-kit',
    name: 'Суюктуктар комплекти',
    slug: 'fluids-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-waves-kit',
    name: 'Толкундар жана үн комплекти',
    slug: 'waves-kit',
    subject_id: 'subject-physics',
  },
  {
    id: 'equipment-chem-starter',
    name: 'Химия боюнча баштапкы комплект',
    slug: 'chem-starter',
    subject_id: 'subject-chemistry',
  },
  {
    id: 'equipment-bio-starter',
    name: 'Биология боюнча баштапкы комплект',
    slug: 'bio-starter',
    subject_id: 'subject-biology',
  },
]

const DEFAULT_PASCO_KITS: StoredPascoKit[] = [
  {
    id: 'pasco-kit-1',
    name: 'Комплект по механике',
    slug: 'pasco-mechanics',
    description: 'Полный набор для изучения основ механики и движения',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-2',
    name: 'Комплект по электричеству и магнетизму',
    slug: 'pasco-em',
    description: 'Набор для экспериментов с электричеством, магнитными полями и электромагнетизмом',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-3',
    name: 'Комплект по оптике и свету',
    slug: 'pasco-optics',
    description: 'Оборудование для исследования свойств света, линз и зеркал',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-4',
    name: 'Комплект по волнам и акустике',
    slug: 'pasco-waves',
    description: 'Набор для изучения волновых явлений, звука и колебаний',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-5',
    name: 'Комплект по гидродинамике',
    slug: 'pasco-fluids',
    description: 'Оборудование для исследования свойств жидкостей и гидравлики',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-6',
    name: 'Стартовый набор по химии',
    slug: 'pasco-chemistry',
    description: 'Базовый набор для проведения безопасных химических экспериментов',
    thumbnail_url: null,
    subject_id: 'subject-chemistry',
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-7',
    name: 'Стартовый набор по биологии',
    slug: 'pasco-biology',
    description: 'Оборудование для микробиологических и биологических исследований',
    thumbnail_url: null,
    subject_id: 'subject-biology',
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEFAULT_PASCO_KITS_KY: StoredPascoKit[] = [
  {
    id: 'pasco-kit-1',
    name: 'Механика комплекти',
    slug: 'pasco-mechanics',
    description: 'Механика жана кыймылдын негиздерин изилдөө үчүн толук комплект',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-2',
    name: 'Электр жана магнетизм комплекти',
    slug: 'pasco-em',
    description: 'Электр, магнит талаалары жана электромагнетизм менен экспериментдер үчүн',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-3',
    name: 'Оптика жана жарык комплекти',
    slug: 'pasco-optics',
    description: 'Жарыктын касиеттерин, линзаларын жана айнектарын изилдөө үчүн',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-4',
    name: 'Толкундар жана акустика комплекти',
    slug: 'pasco-waves',
    description: 'Толкун кубулушун, үнүн жана колебанияларды изилдөө үчүн',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-5',
    name: 'Гидродинамика комплекти',
    slug: 'pasco-fluids',
    description: 'Суюктуктардын касиеттерин жана гидравликасын изилдөө үчүн',
    thumbnail_url: null,
    subject_id: 'subject-physics',
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-6',
    name: 'Химия боюнча баштапкы комплект',
    slug: 'pasco-chemistry',
    description: 'Коопсуз химиялык эксперименттерди жүргүзүү үчүн базалык комплект',
    thumbnail_url: null,
    subject_id: 'subject-chemistry',
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pasco-kit-7',
    name: 'Биология боюнча баштапкы комплект',
    slug: 'pasco-biology',
    description: 'Микробиологиялык жана биологиялык изилдөөлөр үчүн жабдуу',
    thumbnail_url: null,
    subject_id: 'subject-biology',
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEFAULT_LABS: StoredLab[] = []

const DEFAULT_LABS_KY: StoredLab[] = []

const DEFAULT_PASCO_KIT_COMPONENTS: PascoKitComponent[] = [
  // Комплект по механике
  {
    id: 'comp-mech-1',
    kit_id: 'pasco-kit-1',
    name: 'Динамометр 5Н',
    quantity: 2,
    photo_url: null,
    description: 'Измеритель силы до 5 Ньютонов',
    storage_location: 'Box 1',
    notes: 'Требует бережного обращения',
    sort_order: 1,
  },
  {
    id: 'comp-mech-2',
    kit_id: 'pasco-kit-1',
    name: 'Линейка метровая',
    quantity: 3,
    photo_url: null,
    description: 'Для измерения расстояний',
    storage_location: 'Box 1',
    notes: null,
    sort_order: 2,
  },
  {
    id: 'comp-mech-3',
    kit_id: 'pasco-kit-1',
    name: 'Секундомер спортивный',
    quantity: 2,
    photo_url: null,
    description: 'Для измерения временных интервалов',
    storage_location: 'Box 1',
    notes: 'Батарея 1.5V AAA',
    sort_order: 3,
  },
  {
    id: 'comp-mech-4',
    kit_id: 'pasco-kit-1',
    name: 'Тележка с датчиком',
    quantity: 2,
    photo_url: null,
    description: 'Беспроводная тележка для измерения скорости',
    storage_location: 'Box 2',
    notes: 'Полностью заряжена',
    sort_order: 4,
  },
  {
    id: 'comp-mech-5',
    kit_id: 'pasco-kit-1',
    name: 'Наклонная плоскость',
    quantity: 1,
    photo_url: null,
    description: 'Регулируемый угол от 0° до 45°',
    storage_location: 'Box 2',
    notes: null,
    sort_order: 5,
  },
  // Комплект по электричеству
  {
    id: 'comp-em-1',
    kit_id: 'pasco-kit-2',
    name: 'Источник питания регулируемый',
    quantity: 2,
    photo_url: null,
    description: 'Переменное напряжение 0-12V',
    storage_location: 'Box 3',
    notes: 'Требует розетки 220V',
    sort_order: 1,
  },
  {
    id: 'comp-em-2',
    kit_id: 'pasco-kit-2',
    name: 'Датчик тока PASCO',
    quantity: 3,
    photo_url: null,
    description: 'Для измерения силы тока',
    storage_location: 'Box 3',
    notes: 'Беспроводной',
    sort_order: 2,
  },
  {
    id: 'comp-em-3',
    kit_id: 'pasco-kit-2',
    name: 'Датчик напряжения PASCO',
    quantity: 3,
    photo_url: null,
    description: 'Для измерения напряжения',
    storage_location: 'Box 3',
    notes: 'Беспроводной',
    sort_order: 3,
  },
  {
    id: 'comp-em-4',
    kit_id: 'pasco-kit-2',
    name: 'Резисторы ассортимент',
    quantity: 30,
    photo_url: null,
    description: 'Различные значения сопротивления',
    storage_location: 'Box 4',
    notes: null,
    sort_order: 4,
  },
  {
    id: 'comp-em-5',
    kit_id: 'pasco-kit-2',
    name: 'Провода соединительные',
    quantity: 50,
    photo_url: null,
    description: 'С зажимами для соединения элементов цепи',
    storage_location: 'Box 4',
    notes: null,
    sort_order: 5,
  },
  // Комплект по оптике
  {
    id: 'comp-opt-1',
    kit_id: 'pasco-kit-3',
    name: 'Лазер гелий-неон',
    quantity: 1,
    photo_url: null,
    description: 'Красный лазер 5mW',
    storage_location: 'Box 5',
    notes: 'Опасно для глаз! Требует защитных очков',
    sort_order: 1,
  },
  {
    id: 'comp-opt-2',
    kit_id: 'pasco-kit-3',
    name: 'Линза собирающая',
    quantity: 5,
    photo_url: null,
    description: 'Различные фокусные расстояния',
    storage_location: 'Box 5',
    notes: 'Беречь от пыли',
    sort_order: 2,
  },
  {
    id: 'comp-opt-3',
    kit_id: 'pasco-kit-3',
    name: 'Зеркало плоское',
    quantity: 3,
    photo_url: null,
    description: 'Для опытов отражения',
    storage_location: 'Box 5',
    notes: null,
    sort_order: 3,
  },
  {
    id: 'comp-opt-4',
    kit_id: 'pasco-kit-3',
    name: 'Щель для дифракции',
    quantity: 1,
    photo_url: null,
    description: 'Для наблюдения дифракционной картины',
    storage_location: 'Box 5',
    notes: null,
    sort_order: 4,
  },
  // Волны и акустика
  {
    id: 'comp-wav-1',
    kit_id: 'pasco-kit-4',
    name: 'Камертон набор',
    quantity: 8,
    photo_url: null,
    description: 'Разные частоты 256Hz - 512Hz',
    storage_location: 'Box 6',
    notes: null,
    sort_order: 1,
  },
  {
    id: 'comp-wav-2',
    kit_id: 'pasco-kit-4',
    name: 'Датчик звука PASCO',
    quantity: 2,
    photo_url: null,
    description: 'Для измерения интенсивности звука',
    storage_location: 'Box 6',
    notes: 'Беспроводной',
    sort_order: 2,
  },
  {
    id: 'comp-wav-3',
    kit_id: 'pasco-kit-4',
    name: 'Струна на резонаторе',
    quantity: 1,
    photo_url: null,
    description: 'Для опытов со стоячими волнами',
    storage_location: 'Box 6',
    notes: null,
    sort_order: 3,
  },
]

const DEFAULT_DB: LocalDb = {
  subjects: DEFAULT_SUBJECTS,
  grades: DEFAULT_GRADES,
  equipment: DEFAULT_EQUIPMENT,
  labs: DEFAULT_LABS,
  lab_steps: [],
  resources: [],
  lab_equipment_items: [],
  pasco_kits: DEFAULT_PASCO_KITS,
  pasco_kit_components: DEFAULT_PASCO_KIT_COMPONENTS,
}

const DEFAULT_DB_KY: LocalDb = {
  subjects: DEFAULT_SUBJECTS_KY,
  grades: DEFAULT_GRADES_KY,
  equipment: DEFAULT_EQUIPMENT_KY,
  labs: DEFAULT_LABS_KY,
  lab_steps: [],
  resources: [],
  lab_equipment_items: [],
  pasco_kits: DEFAULT_PASCO_KITS_KY,
  pasco_kit_components: [],
}

const DEFAULT_PASCO_KIT_COMPONENT_IDS = new Set(
  DEFAULT_PASCO_KIT_COMPONENTS.map((component) => component.id)
)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function getDbFilePath(locale: Locale) {
  return DB_FILE_PATHS[locale]
}

function getDefaultDb(locale: Locale) {
  return locale === 'ky' ? DEFAULT_DB_KY : DEFAULT_DB
}

function getEquipmentSortLocale(locale: Locale) {
  return locale === 'ky' ? 'ky' : 'ru'
}

function mergeById<T extends { id: string }>(preferred: T[], fallback: T[]) {
  const merged = new Map<string, T>(fallback.map((item) => [item.id, item]))

  for (const item of preferred) {
    merged.set(item.id, item)
  }

  return Array.from(merged.values())
}

function removeAlternateLocaleFields<T extends object>(
  value: T,
  fields: string[],
  locale: Locale
) {
  const normalized = { ...value } as Record<string, unknown>
  const alternateLocale = locale === 'ky' ? 'ru' : 'ky'

  for (const field of fields) {
    delete normalized[`${field}_${alternateLocale}`]
  }

  return normalized as T
}

function normalizeDb(value: Partial<LocalDb> | null | undefined, locale: Locale): LocalDb {
  const defaults = getDefaultDb(locale)
  const legacySubjects = Array.isArray(value?.subjects) ? value.subjects : []
  const legacyGrades = Array.isArray(value?.grades) ? value.grades : []

  const subjectIdToSlug = new Map(
    legacySubjects
      .filter((subject): subject is Subject => Boolean(subject?.id && subject?.slug))
      .map((subject) => [subject.id, subject.slug])
  )
  const gradeIdToLevel = new Map(
    legacyGrades
      .filter((grade): grade is Grade => Boolean(grade?.id && typeof grade?.level === 'number'))
      .map((grade) => [grade.id, grade.level])
  )
  const subjectSlugToId = new Map(defaults.subjects.map((subject) => [subject.slug, subject.id]))
  const subjectIds = new Set(defaults.subjects.map((subject) => subject.id))
  const gradeLevelToId = new Map(defaults.grades.map((grade) => [grade.level, grade.id]))
  const normalizedLabs = Array.isArray(value?.labs) ? value.labs : []

  const resolveSubjectId = (subjectId: string | null | undefined) => {
    if (!subjectId) return null
    if (subjectIds.has(subjectId)) return subjectId

    const slug = subjectIdToSlug.get(subjectId) ?? subjectId
    return subjectSlugToId.get(slug) ?? null
  }

  const resolveGradeId = (gradeId: string | null | undefined) => {
    if (!gradeId) return null

    const explicitLevel = Number(gradeId.replace('grade-', ''))
    if (!Number.isNaN(explicitLevel)) {
      return gradeLevelToId.get(explicitLevel) ?? null
    }

    const level = gradeIdToLevel.get(gradeId)
    return typeof level === 'number' ? (gradeLevelToId.get(level) ?? null) : null
  }

  const ALLOWED_LAB_FIELDS = new Set([
    'id', 'title', 'title_ru', 'title_ky', 'slug', 'content', 'content_ru', 'content_ky',
    'thumbnail_url', 'photo_urls', 'is_published', 'subject_id', 'grade_id', 'equipment_ids',
    'difficulty', 'duration_minutes', 'created_at', 'updated_at',
  ])

  return {
    subjects: clone(defaults.subjects),
    grades: clone(defaults.grades),
    equipment: clone(defaults.equipment),
    labs: mergeById(
      normalizedLabs.map((lab) => {
        const cleaned: Record<string, unknown> = {}
        for (const key of Object.keys(lab)) {
          if (ALLOWED_LAB_FIELDS.has(key)) {
            cleaned[key] = (lab as Record<string, unknown>)[key]
          }
        }
        return removeAlternateLocaleFields({
          ...cleaned,
          subject_id: resolveSubjectId(lab.subject_id),
          grade_id: resolveGradeId(lab.grade_id),
          equipment_ids: lab.equipment_ids ?? null,
        } as StoredLab, ['title', 'content'], locale)
      }),
      defaults.labs
    ),
    lab_steps: Array.isArray(value?.lab_steps)
      ? value.lab_steps.map((step) =>
          removeAlternateLocaleFields(step, ['content', 'caption'], locale)
        )
      : [],
    resources: Array.isArray(value?.resources)
      ? value.resources
          .map((resource) =>
            removeAlternateLocaleFields(resource, ['title', 'description'], locale)
          )
          .sort((left, right) => left.sort_order - right.sort_order)
      : [],
    lab_equipment_items: Array.isArray(value?.lab_equipment_items)
      ? value.lab_equipment_items.map((item) =>
          removeAlternateLocaleFields(item, ['item_name', 'notes'], locale)
        )
      : [],
    pasco_kits: (
      Array.isArray(value?.pasco_kits)
        ? value.pasco_kits.map((kit) =>
            removeAlternateLocaleFields(kit, ['name', 'description'], locale)
          )
        : defaults.pasco_kits
    ).sort((a, b) => a.sort_order - b.sort_order),
    pasco_kit_components: (
      Array.isArray(value?.pasco_kit_components)
        ? value.pasco_kit_components
            .filter(
              (component) =>
                locale !== 'ky' ||
                !DEFAULT_PASCO_KIT_COMPONENT_IDS.has(component.id) ||
                Boolean(component.name_ky?.trim())
            )
            .map((component) =>
              removeAlternateLocaleFields(
                component,
                ['name', 'description', 'storage_location', 'notes'],
                locale
              )
            )
        : defaults.pasco_kit_components
    ).sort((a, b) => a.kit_id.localeCompare(b.kit_id) || a.sort_order - b.sort_order),
  }
}

async function ensureDbFile(locale: Locale) {
  const filePath = getDbFilePath(locale)
  await mkdir(/*turbopackIgnore: true*/ path.dirname(filePath), { recursive: true })

  try {
    await readFile(/*turbopackIgnore: true*/ filePath, 'utf8')
  } catch {
    if (locale === 'ru') {
      try {
        const legacyRaw = await readFile(/*turbopackIgnore: true*/ LEGACY_DB_FILE_PATH, 'utf8')
        await writeFile(/*turbopackIgnore: true*/ filePath, legacyRaw, 'utf8')
        return
      } catch {}
    }

    await writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(getDefaultDb(locale), null, 2), 'utf8')
  }
}

async function readLocalDb(locale: Locale): Promise<LocalDb> {
  const filePath = getDbFilePath(locale)
  await ensureDbFile(locale)

  const raw = await readFile(/*turbopackIgnore: true*/ filePath, 'utf8')

  try {
    return normalizeDb(JSON.parse(raw) as Partial<LocalDb>, locale)
  } catch (error) {
    console.error(`[local-db] Failed to read ${locale} database:`, error)
    // Файл повреждён — не падаем, а безопасно восстанавливаем из дефолта.
    // Запись восстановленного файла выполняется через очередь (writeLocalDb),
    // чтобы не создавать гонку с другими записями.
    const recovered = getDefaultDb(locale)
    await writeLocalDb(recovered, locale)
    return recovered
  }
}


async function writeLocalDb(db: LocalDb, locale: Locale) {
  const filePath = getDbFilePath(locale)
  await ensureDbFile(locale)
  const tempFilePath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(/*turbopackIgnore: true*/ tempFilePath, JSON.stringify(db, null, 2), 'utf8')
  await rename(/*turbopackIgnore: true*/ tempFilePath, filePath)
}

async function withLocalDbWrite<T>(
  mutate: (db: LocalDb) => T | Promise<T>,
  locale: Locale
) {
  let result!: T

  const task = writeQueues[locale].then(async () => {
    const db = await readLocalDb(locale)
    result = await mutate(db)
    await writeLocalDb(db, locale)
  })

  // Keep the chain alive but propagate errors to the caller instead of
  // swallowing them.  The chain itself must stay non-rejecting so that
  // subsequent writes can still be queued after a failure.
  writeQueues[locale] = task.catch((error) => {
    console.error('[local-db] Write error:', error)
  })

  await task
  return result
}

function buildLab(row: StoredLab, db: LocalDb, relationsDb: LocalDb = db): Lab {
  const subject =
    row.subject_id ? relationsDb.subjects.find((item) => item.id === row.subject_id) ?? null : null
  const grade =
    row.grade_id ? relationsDb.grades.find((item) => item.id === row.grade_id) ?? null : null
  const equipment =
    row.equipment_ids && row.equipment_ids.length > 0
      ? row.equipment_ids
          .map((eqId) => relationsDb.equipment.find((item) => item.id === eqId))
          .filter((eq): eq is Equipment => eq !== undefined)
      : []

  return {
    ...row,
    subjects: subject,
    grades: grade,
    equipment,
    lab_steps: db.lab_steps
      .filter((step) => step.lab_id === row.id)
      .sort((a, b) => a.step_order - b.step_order),
    resources: db.resources
      .filter((resource) => resource.lab_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    equipment_items: db.lab_equipment_items
      .filter((item) => item.lab_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }
}

function sortLabsByDate(labs: Lab[]) {
  return [...labs].sort(
    (left, right) =>
      new Date(right.updated_at ?? right.created_at).getTime() -
      new Date(left.updated_at ?? left.created_at).getTime()
  )
}

function normalizeSearchText(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLocaleLowerCase('ru')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchTokens(search?: string) {
  return normalizeSearchText(search)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
}

function buildLocalLabSearchText(row: StoredLab, db: LocalDb, relationsDb: LocalDb = db) {
  const subject =
    row.subject_id ? relationsDb.subjects.find((item) => item.id === row.subject_id) ?? null : null
  const grade = row.grade_id ? relationsDb.grades.find((item) => item.id === row.grade_id) ?? null : null
  const equipment =
    row.equipment_ids && row.equipment_ids.length > 0
      ? row.equipment_ids
          .map((eqId) => relationsDb.equipment.find((item) => item.id === eqId))
          .filter((eq): eq is Equipment => eq !== undefined)
      : []
  const resources = db.resources.filter((resource) => resource.lab_id === row.id)
  const steps = db.lab_steps.filter((step) => step.lab_id === row.id)
  const equipmentItems = db.lab_equipment_items.filter((item) => item.lab_id === row.id)
  const values = [
    row.title,
    row.title_ru,
    row.title_ky,
    row.slug,
    row.content,
    row.content_ru,
    row.content_ky,
    row.difficulty,
    row.duration_minutes,
    ...(row.photo_urls ?? []),
    subject?.name,
    subject?.name_ru,
    subject?.name_ky,
    subject?.slug,
    grade?.label,
    grade?.label_ru,
    grade?.label_ky,
    grade?.level,
    ...equipment.flatMap((item) => [item.name, item.name_ru, item.name_ky, item.slug]),
    ...resources.flatMap((resource) => [
      resource.title,
      resource.title_ru,
      resource.title_ky,
      resource.description,
      resource.description_ru,
      resource.description_ky,
      resource.resource_type,
      resource.url,
    ]),
    ...steps.flatMap((step) => [
      step.content,
      step.content_ru,
      step.content_ky,
      step.caption,
      step.caption_ru,
      step.caption_ky,
      step.block_type,
    ]),
    ...equipmentItems.flatMap((item) => [
      item.item_name,
      item.item_name_ru,
      item.item_name_ky,
      item.notes,
      item.notes_ru,
      item.notes_ky,
      item.quantity,
    ]),
  ]

  return normalizeSearchText(values.filter((value) => value != null && value !== '').join(' '))
}

function matchesLocalLabSearch(
  row: StoredLab,
  db: LocalDb,
  relationsDb: LocalDb,
  searchTokens: string[]
) {
  if (searchTokens.length === 0) return true

  const haystack = buildLocalLabSearchText(row, db, relationsDb)
  return searchTokens.every((token) => haystack.includes(token))
}

function normalizeSteps(labId: string, steps: LabStepDraft[]) {
  return steps.map((step, index) => ({
    id: step.id || crypto.randomUUID(),
    lab_id: labId,
    step_order: index + 1,
    block_type: step.block_type,
    content: step.content || null,
    caption: step.caption || null,
  }))
}

function normalizeResources(labId: string, resources: Resource[]) {
  return resources.map((resource, index) => ({
    ...resource,
    id: resource.id || crypto.randomUUID(),
    lab_id: labId,
    sort_order: resource.sort_order ?? index,
  }))
}

export function toStoredLab(lab: Lab | StoredLab): StoredLab {
  const stored = { ...(lab as Lab) }
  delete stored.subjects
  delete stored.grades
  delete stored.equipment
  delete stored.lab_steps
  delete stored.resources
  delete stored.equipment_items

  return stored
}

export async function syncLocalCatalogs(input: {
  subjects?: Subject[]
  grades?: Grade[]
  equipment?: Equipment[]
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  await withLocalDbWrite((db) => {
    if (input.subjects?.length) {
      db.subjects = mergeById(input.subjects, db.subjects).sort(
        (a, b) => a.sort_order - b.sort_order
      )
    }

    if (input.grades?.length) {
      db.grades = mergeById(input.grades, db.grades).sort((a, b) => a.level - b.level)
    }

    if (input.equipment?.length) {
      db.equipment = mergeById(input.equipment, db.equipment).sort((a, b) =>
        a.name.localeCompare(b.name, getEquipmentSortLocale(currentLocale))
      )
    }
  }, resolveLocale(locale))
}

export async function getLocalSubjects(locale?: Locale) {
  const db = await readLocalDb(resolveLocale(locale))
  return [...db.subjects].sort((a, b) => a.sort_order - b.sort_order)
}

export async function getLocalGrades(locale?: Locale) {
  const db = await readLocalDb(resolveLocale(locale))
  return [...db.grades].sort((a, b) => a.level - b.level)
}

export async function getLocalEquipment(locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  return [...db.equipment].sort((a, b) => a.name.localeCompare(b.name, getEquipmentSortLocale(currentLocale)))
}

export async function getLocalLabs({
  subjectSlug,
  gradeLevel,
  search,
  adminMode = false,
}: {
  subjectSlug?: string
  gradeLevel?: number
  search?: string
  adminMode?: boolean
} = {}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const relationsDb = db
  const subject = subjectSlug ? relationsDb.subjects.find((item) => item.slug === subjectSlug) : null
  const grade = gradeLevel ? relationsDb.grades.find((item) => item.level === gradeLevel) : null
  const searchTokens = getSearchTokens(search)

  const rows = db.labs.filter((row) => {
    if (!adminMode && !row.is_published) return false
    if (subject && row.subject_id !== subject.id) return false
    if (grade && row.grade_id !== grade.id) return false
    if (!matchesLocalLabSearch(row, db, relationsDb, searchTokens)) return false

    return true
  })

  return sortLabsByDate(rows.map((row) => buildLab(row, db, relationsDb)))
}

export async function getLocalLabBySlug(slug: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const row = db.labs.find((lab) => lab.slug === slug)
  return row ? buildLab(row, db) : null
}

export async function getLocalLabById(id: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const row = db.labs.find((lab) => lab.id === id)
  return row ? buildLab(row, db) : null
}

export async function syncLocalLabMirror(input: {
  lab: StoredLab
  steps?: LabStep[]
  resources?: Resource[]
  equipmentItems?: EquipmentItem[]
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  return withLocalDbWrite((db) => {
    const row = input.lab
    const existingIndex = db.labs.findIndex((lab) => lab.id === row.id)

    if (existingIndex >= 0) {
      db.labs[existingIndex] = row
    } else {
      db.labs.unshift(row)
    }

    if (input.steps) {
      db.lab_steps = [
        ...db.lab_steps.filter((step) => step.lab_id !== row.id),
        ...input.steps.map((step, index) => ({
          ...step,
          id: step.id || crypto.randomUUID(),
          lab_id: row.id,
          step_order: step.step_order ?? index + 1,
        })),
      ]
    }

    if (input.resources) {
      db.resources = [
        ...db.resources.filter((resource) => resource.lab_id !== row.id),
        ...normalizeResources(row.id, input.resources),
      ]
    }

    if (input.equipmentItems) {
      db.lab_equipment_items = [
        ...db.lab_equipment_items.filter((item) => item.lab_id !== row.id),
        ...input.equipmentItems.map((item, index) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
          lab_id: row.id,
          sort_order: item.sort_order ?? index,
        })),
      ]
    }

    return buildLab(row, db)
  }, currentLocale)
}

export async function createLocalLab(input: LocalLabMutationInput, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const now = new Date().toISOString()
    const labId = crypto.randomUUID()

    const row: StoredLab = {
      id: labId,
      title: input.title,
      slug: input.slug,
      content: input.content,
      thumbnail_url: null,
      photo_urls: input.photo_urls ?? null,
      is_published: input.is_published,
      subject_id: input.subject_id,
      grade_id: input.grade_id,
      equipment_ids: input.equipment_ids,
      difficulty: input.difficulty ?? undefined,
      duration_minutes: input.duration_minutes ?? null,
      created_at: now,
      updated_at: now,
    }

    db.labs.unshift(row)

    if (input.steps?.length) {
      db.lab_steps.push(...normalizeSteps(labId, input.steps))
    }

    return buildLab(row, db)
  }, currentLocale)
}

export async function updateLocalLab(labId: string, input: LocalLabMutationInput, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const index = db.labs.findIndex((lab) => lab.id === labId)
    const existing = index >= 0 ? db.labs[index] : null

    if (!existing) {
      throw new Error('Локальная лаборатория не найдена')
    }

    const row: StoredLab = {
      ...existing,
      id: existing.id || labId,
      title: input.title,
      slug: existing.slug || input.slug,
      content: input.content,
      thumbnail_url: existing.thumbnail_url ?? null,
      is_published: input.is_published,
      subject_id: input.subject_id,
      grade_id: input.grade_id,
      equipment_ids: input.equipment_ids,
      difficulty: input.difficulty ?? existing.difficulty,
      duration_minutes: input.duration_minutes ?? existing.duration_minutes ?? null,
      updated_at: new Date().toISOString(),
    }

    if (index >= 0) {
      db.labs[index] = row
    } else {
      db.labs.unshift(row)
    }

    if (input.steps) {
      db.lab_steps = [
        ...db.lab_steps.filter((step) => step.lab_id !== row.id),
        ...normalizeSteps(row.id, input.steps),
      ]
    }

    return buildLab(row, db)
  }, currentLocale)
}

export async function deleteLocalLab(labId: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  await withLocalDbWrite((db) => {
    db.labs = db.labs.filter((lab) => lab.id !== labId)
    db.lab_steps = db.lab_steps.filter((step) => step.lab_id !== labId)
    db.resources = db.resources.filter((resource) => resource.lab_id !== labId)
    db.lab_equipment_items = db.lab_equipment_items.filter((item) => item.lab_id !== labId)
  }, currentLocale)
}

export async function toggleLocalLab(labId: string, published: boolean, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  await withLocalDbWrite((db) => {
    const index = db.labs.findIndex((lab) => lab.id === labId)

    if (index < 0) return

    db.labs[index] = {
      ...db.labs[index],
      is_published: published,
      updated_at: new Date().toISOString(),
    }
  }, currentLocale)
}

// PASCO Kit functions

async function readPascoFallbackDb(currentLocale: Locale, options?: PascoKitReadOptions) {
  const fallbackLocale = options?.fallbackLocale
  if (!fallbackLocale || fallbackLocale === currentLocale) return null

  return readLocalDb(fallbackLocale)
}

function findFallbackPascoKit(kit: StoredPascoKit, fallbackDb: LocalDb | null) {
  return fallbackDb?.pasco_kits.find(
    (fallbackKit) => fallbackKit.id === kit.id || fallbackKit.slug === kit.slug
  ) ?? null
}

function getPascoKitWithFallback(kit: StoredPascoKit, fallbackDb: LocalDb | null) {
  const fallbackKit = findFallbackPascoKit(kit, fallbackDb)

  return {
    ...kit,
    subject_id: kit.subject_id || fallbackKit?.subject_id || kit.subject_id,
    thumbnail_url: kit.thumbnail_url || fallbackKit?.thumbnail_url || null,
    description: kit.description || fallbackKit?.description || null,
  }
}

function getPascoKitComponentsWithFallback(
  kit: StoredPascoKit,
  db: LocalDb,
  fallbackDb: LocalDb | null
) {
  const components = db.pasco_kit_components
    .filter((component) => component.kit_id === kit.id)
    .sort((a, b) => a.sort_order - b.sort_order)

  if (components.length > 0 || !fallbackDb) return components

  return fallbackDb.pasco_kit_components
    .filter((component) => component.kit_id === kit.id)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export async function getLocalPascoKits(
  subjectSlug?: string,
  locale?: Locale,
  options?: PascoKitReadOptions
) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const fallbackDb = await readPascoFallbackDb(currentLocale, options)
  const relationsDb = db

  let kits = db.pasco_kits.map((kit) => {
    const displayKit = getPascoKitWithFallback(kit, fallbackDb)

    return {
      ...displayKit,
      subject: displayKit.subject_id
        ? relationsDb.subjects.find((subject) => subject.id === displayKit.subject_id) ?? null
        : null,
      components: getPascoKitComponentsWithFallback(kit, db, fallbackDb),
    }
  })

  if (subjectSlug) {
    const subject = relationsDb.subjects.find((s) => s.slug === subjectSlug)
    if (subject) {
      kits = kits.filter((kit) => kit.subject_id === subject.id)
    }
  }

  return kits.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getLocalPascoKitBySlug(
  slug: string,
  locale?: Locale,
  options?: PascoKitReadOptions
) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const fallbackDb = await readPascoFallbackDb(currentLocale, options)
  const relationsDb = db

  const kit =
    db.pasco_kits.find((k) => k.slug === slug) ??
    fallbackDb?.pasco_kits.find((k) => k.slug === slug)
  if (!kit) return null

  const displayKit = getPascoKitWithFallback(kit, fallbackDb)

  return {
    ...displayKit,
    subject: displayKit.subject_id
      ? relationsDb.subjects.find((subject) => subject.id === displayKit.subject_id) ?? null
      : null,
    components: getPascoKitComponentsWithFallback(kit, db, fallbackDb),
  }
}

export async function getLocalPascoKitById(id: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)
  const db = await readLocalDb(currentLocale)
  const relationsDb = db

  const kit = db.pasco_kits.find((k) => k.id === id)
  if (!kit) return null

  return {
    ...kit,
    subject: kit.subject_id ? relationsDb.subjects.find((s) => s.id === kit.subject_id) ?? null : null,
    components: db.pasco_kit_components
      .filter((comp) => comp.kit_id === kit.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }
}

export async function createLocalPascoKit(input: {
  name: string
  slug: string
  description: string | null
  subject_id: string
  thumbnail_url?: string | null
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const now = new Date().toISOString()
    const kit: StoredPascoKit = {
      id: crypto.randomUUID(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      thumbnail_url: input.thumbnail_url ?? null,
      subject_id: input.subject_id,
      sort_order: Math.max(...db.pasco_kits.map((k) => k.sort_order), 0) + 1,
      created_at: now,
      updated_at: now,
    }

    db.pasco_kits.push(kit)
    return kit
  }, currentLocale)
}

export async function updateLocalPascoKit(kitId: string, input: {
  name: string
  slug: string
  description: string | null
  subject_id: string
  thumbnail_url?: string | null
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const index = db.pasco_kits.findIndex((k) => k.id === kitId)
    if (index < 0) throw new Error('Kit not found')

    db.pasco_kits[index] = {
      ...db.pasco_kits[index],
      name: input.name,
      slug: input.slug,
      description: input.description,
      thumbnail_url: input.thumbnail_url ?? db.pasco_kits[index].thumbnail_url,
      subject_id: input.subject_id,
      updated_at: new Date().toISOString(),
    }

    return db.pasco_kits[index]
  }, currentLocale)
}

export async function deleteLocalPascoKit(kitId: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  await withLocalDbWrite((db) => {
    db.pasco_kits = db.pasco_kits.filter((kit) => kit.id !== kitId)
    db.pasco_kit_components = db.pasco_kit_components.filter((component) => component.kit_id !== kitId)
  }, currentLocale)
}

export async function addLocalPascoKitComponent(kitId: string, input: {
  name: string
  quantity: number
  description: string | null
  storage_location: string | null
  notes: string | null
  photo_url?: string | null
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const component: PascoKitComponent = {
      id: crypto.randomUUID(),
      kit_id: kitId,
      name: input.name,
      quantity: input.quantity,
      description: input.description,
      storage_location: input.storage_location,
      notes: input.notes,
      photo_url: input.photo_url ?? null,
      sort_order: Math.max(...db.pasco_kit_components.filter((c) => c.kit_id === kitId).map((c) => c.sort_order), -1) + 1,
    }

    db.pasco_kit_components.push(component)
    return component
  }, currentLocale)
}

export async function updateLocalPascoKitComponent(componentId: string, input: {
  name: string
  quantity: number
  description: string | null
  storage_location: string | null
  notes: string | null
  photo_url?: string | null
}, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  return withLocalDbWrite((db) => {
    const index = db.pasco_kit_components.findIndex((c) => c.id === componentId)
    if (index < 0) throw new Error('Component not found')

    db.pasco_kit_components[index] = {
      ...db.pasco_kit_components[index],
      name: input.name,
      quantity: input.quantity,
      description: input.description,
      storage_location: input.storage_location,
      notes: input.notes,
      photo_url: input.photo_url ?? db.pasco_kit_components[index].photo_url,
    }

    return db.pasco_kit_components[index]
  }, currentLocale)
}

export async function deleteLocalPascoKitComponent(componentId: string, locale?: Locale) {
  const currentLocale = resolveLocale(locale)

  await withLocalDbWrite((db) => {
    db.pasco_kit_components = db.pasco_kit_components.filter((component) => component.id !== componentId)
  }, currentLocale)
}
