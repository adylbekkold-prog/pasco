import {
  hasLocalizedText,
  localizeLab,
  localizeResource,
} from '@/lib/supabase-localization'
import type { Lab, Resource } from '@/types'

const baseLab: Lab = {
  id: 'lab-1',
  title: 'Русское название',
  title_ru: 'Русское название',
  title_ky: null,
  slug: 'lab-1',
  content: 'Русское описание',
  content_ru: 'Русское описание',
  content_ky: null,
  thumbnail_url: null,
  is_published: true,
  subject_id: null,
  grade_id: null,
  equipment_ids: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('strict remote localization', () => {
  it('does not treat Russian text as a Kyrgyz translation', () => {
    expect(hasLocalizedText(baseLab, 'title', 'ky')).toBe(false)

    const localized = localizeLab(baseLab, 'ky')
    expect(localized.title).toBe('')
    expect(localized.content).toBeNull()
  })

  it('allows a fallback only when it comes from the selected locale database', () => {
    const kyrgyzFallback: Lab = {
      ...baseLab,
      title: 'Кыргызча аталыш',
      content: 'Кыргызча сүрөттөмө',
    }

    const localized = localizeLab(baseLab, 'ky', kyrgyzFallback)
    expect(localized.title).toBe('Кыргызча аталыш')
    expect(localized.content).toBe('Кыргызча сүрөттөмө')
  })

  it('does not expose a Russian-only resource in Kyrgyz text fields', () => {
    const resource: Resource = {
      id: 'resource-1',
      lab_id: 'lab-1',
      resource_type: 'link',
      title: 'Русский ресурс',
      title_ru: 'Русский ресурс',
      title_ky: null,
      description: 'Русское описание',
      description_ru: 'Русское описание',
      description_ky: null,
      url: 'https://example.com',
      file_size: null,
      sort_order: 0,
    }

    const localized = localizeResource(resource, 'ky')
    expect(localized.title).toBe('')
    expect(localized.description).toBeNull()
  })
})
