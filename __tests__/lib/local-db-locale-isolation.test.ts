import { readFile, rename, writeFile } from 'node:fs/promises'
import {
  deleteLocalLab,
  deleteLocalPascoKit,
  getLocalPascoKits,
  getLocalLabById,
  getLocalLabBySlug,
  getLocalLabs,
  getLocalPascoKitBySlug,
  updateLocalLab,
} from '@/lib/local-db'

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  rename: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}))

const mockedReadFile = jest.mocked(readFile)
const mockedRename = jest.mocked(rename)
const mockedWriteFile = jest.mocked(writeFile)
let consoleErrorSpy: jest.SpyInstance

const russianLab = {
  id: 'ru-only-lab',
  title: 'Только русская лаборатория',
  slug: 'ru-only-lab',
  content: 'Русское описание',
  thumbnail_url: null,
  photo_urls: [],
  is_published: true,
  subject_id: 'subject-physics',
  grade_id: 'grade-8',
  equipment_ids: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const kyrgyzLab = {
  id: 'ky-only-lab',
  title: 'Кыргызча гана лаборатория',
  slug: 'ky-only-lab',
  content: 'Кыргызча сүрөттөмө',
  thumbnail_url: null,
  photo_urls: [],
  is_published: true,
  subject_id: 'subject-physics',
  grade_id: 'grade-8',
  equipment_ids: [],
  created_at: '2026-01-02T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
}

const russianPascoKit = {
  id: 'pasco-kit-1',
  name: 'Комплект по механике',
  slug: 'pasco-mechanics',
  description: 'Комплект для теста',
  thumbnail_url: null,
  subject_id: 'subject-physics',
  sort_order: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const russianPascoComponent = {
  id: 'comp-mech-1',
  kit_id: 'pasco-kit-1',
  name: 'А-образная подставка',
  quantity: 1,
  photo_url: null,
  description: 'Опора',
  storage_location: 'Box 1',
  notes: null,
  sort_order: 1,
}

function createDatabase(labs: typeof russianLab[]) {
  return JSON.stringify({
    subjects: [],
    grades: [],
    equipment: [],
    labs,
    lab_steps: [],
    resources: [],
    lab_equipment_items: [],
    pasco_kits: [russianPascoKit],
    pasco_kit_components: [russianPascoComponent],
  })
}

function getPath(value: unknown) {
  return String(value).replaceAll('\\', '/')
}

beforeEach(() => {
  jest.clearAllMocks()
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  mockedReadFile.mockImplementation(async (filePath) => {
    const normalizedPath = getPath(filePath)

    if (normalizedPath.endsWith('/data/local-db.ru.json')) {
      return createDatabase([russianLab])
    }

    if (normalizedPath.endsWith('/data/local-db.ky.json')) {
      return createDatabase([kyrgyzLab])
    }

    throw new Error(`Unexpected database path: ${normalizedPath}`)
  })
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

describe('local database locale isolation', () => {
  it('never reads a Russian-only laboratory from the Kyrgyz database API', async () => {
    const kyrgyzLabs = await getLocalLabs({ adminMode: true }, 'ky')

    expect(kyrgyzLabs.map((lab) => lab.id)).toEqual(['ky-only-lab'])
    await expect(getLocalLabById('ru-only-lab', 'ky')).resolves.toBeNull()
    await expect(getLocalLabBySlug('ru-only-lab', 'ky')).resolves.toBeNull()
  })

  it('finds laboratories by attached resource and equipment text', async () => {
    const database = JSON.parse(createDatabase([russianLab]))
    database.resources = [
      {
        id: 'resource-1',
        lab_id: 'ru-only-lab',
        resource_type: 'worksheet',
        title: '09_Momentum_and_Impulse.spklab',
        description: 'PASCO workbook',
        url: '/uploads/labs/demo/09momentumandimpulse.spklab',
        file_size: 7903,
        sort_order: 1,
      },
    ]
    database.lab_equipment_items = [
      {
        id: 'item-1',
        lab_id: 'ru-only-lab',
        item_name: 'Smart Cart',
        quantity: 1,
        notes: 'red cart',
        sort_order: 1,
      },
    ]
    mockedReadFile.mockResolvedValue(JSON.stringify(database))

    await expect(getLocalLabs({ adminMode: true, search: 'Momentum' }, 'ru')).resolves.toHaveLength(1)
    await expect(getLocalLabs({ adminMode: true, search: 'Smart Cart' }, 'ru')).resolves.toHaveLength(1)
    await expect(getLocalLabs({ adminMode: true, search: 'missing term' }, 'ru')).resolves.toEqual([])
  })

  it('does not create a Kyrgyz copy when editing a Russian-only laboratory', async () => {
    await expect(
      updateLocalLab(
        'ru-only-lab',
        {
          title: 'Кыргызча аталыш',
          slug: 'ru-only-lab',
          content: null,
          subject_id: null,
          grade_id: null,
          equipment_ids: [],
          is_published: true,
        },
        'ky'
      )
    ).rejects.toThrow()
  })

  it('deletes a laboratory only from the selected locale file', async () => {
    await deleteLocalLab('ru-only-lab', 'ru')

    const readPaths = mockedReadFile.mock.calls.map(([filePath]) => getPath(filePath))
    const renamedPaths = mockedRename.mock.calls.flatMap(([from, to]) => [getPath(from), getPath(to)])

    expect(readPaths.some((filePath) => filePath.endsWith('/data/local-db.ky.json'))).toBe(false)
    expect(renamedPaths.some((filePath) => filePath.endsWith('/data/local-db.ky.json'))).toBe(false)
    expect(mockedWriteFile).toHaveBeenCalled()
  })

  it('deletes a PASCO kit only from the selected locale file', async () => {
    await deleteLocalPascoKit('pasco-kit-1', 'ky')

    const readPaths = mockedReadFile.mock.calls.map(([filePath]) => getPath(filePath))
    expect(readPaths.some((filePath) => filePath.endsWith('/data/local-db.ru.json'))).toBe(false)
  })

  it('does not restore deleted seeded PASCO kits during normalization', async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({
      ...JSON.parse(createDatabase([russianLab])),
      pasco_kits: [],
      pasco_kit_components: [],
    }))

    const kits = await getLocalPascoKits(undefined, 'ru')

    expect(kits.some((kit) => kit.id === 'pasco-kit-1')).toBe(false)
  })

  it('does not restore deleted seeded PASCO components during normalization', async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({
      ...JSON.parse(createDatabase([russianLab])),
      pasco_kit_components: [],
    }))

    const kits = await getLocalPascoKits(undefined, 'ru')

    expect(kits.flatMap((kit) => kit.components ?? []).some((component) => component.id === 'comp-mech-1')).toBe(false)
  })

  it('recovers a corrupt locale database with defaults instead of crashing', async () => {
    mockedReadFile.mockResolvedValue('{ broken json')

    // Повреждённый файл не должен ронять страницу — вместо этого
    // база безопасно восстанавливается из дефолта.
    const labs = await getLocalLabs({ adminMode: true }, 'ru')
    expect(labs).toEqual([])
    expect(mockedWriteFile).toHaveBeenCalled()
  })


  it('uses Russian PASCO kit assets as a public fallback only when requested', async () => {
    mockedReadFile.mockImplementation(async (filePath) => {
      const normalizedPath = getPath(filePath)
      const baseDatabase = JSON.parse(createDatabase([russianLab]))

      if (normalizedPath.endsWith('/data/local-db.ru.json')) {
        return JSON.stringify({
          ...baseDatabase,
          pasco_kits: [{ ...russianPascoKit, thumbnail_url: '/api/photos/image?path=mechanics.png' }],
          pasco_kit_components: [russianPascoComponent],
        })
      }

      if (normalizedPath.endsWith('/data/local-db.ky.json')) {
        return JSON.stringify({
          ...baseDatabase,
          labs: [kyrgyzLab],
          pasco_kits: [{ ...russianPascoKit, name: 'Механика комплекти', thumbnail_url: null }],
          pasco_kit_components: [],
        })
      }

      throw new Error(`Unexpected database path: ${normalizedPath}`)
    })

    const isolatedKits = await getLocalPascoKits(undefined, 'ky')
    expect(isolatedKits[0]?.thumbnail_url).toBeNull()
    expect(isolatedKits[0]?.components).toEqual([])

    const publicKits = await getLocalPascoKits(undefined, 'ky', { fallbackLocale: 'ru' })
    expect(publicKits[0]?.name).toBe('Механика комплекти')
    expect(publicKits[0]?.thumbnail_url).toBe('/api/photos/image?path=mechanics.png')
    expect(publicKits[0]?.components).toEqual([expect.objectContaining({ id: 'comp-mech-1' })])

    const publicKit = await getLocalPascoKitBySlug('pasco-mechanics', 'ky', { fallbackLocale: 'ru' })
    expect(publicKit?.components).toEqual([expect.objectContaining({ id: 'comp-mech-1' })])
  })
})
