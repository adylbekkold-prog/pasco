/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import LabCard from '@/components/LabCard'
import type { Lab } from '@/types'

jest.mock('@/components/ResponsiveImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="lab-card-image" src={src} alt={alt} />
  ),
}))

const lab = {
  id: 'lab-1',
  title: 'Импульс',
  slug: 'impuls',
  content: 'Описание',
  thumbnail_url: null,
  photo_urls: ['Физика/Комплект/Умная тележка.png'],
  is_published: true,
  subject_id: 'subject-1',
  grade_id: 'grade-1',
  equipment_ids: [],
  created_at: '2026-07-28T00:00:00.000Z',
  updated_at: '2026-07-28T00:00:00.000Z',
  subjects: {
    id: 'subject-1',
    name: 'Физика',
    slug: 'physics',
    icon: 'F',
    color: '#1647c5',
    sort_order: 1,
  },
  grades: {
    id: 'grade-1',
    level: 10,
    label: '10 класс',
  },
} satisfies Lab

describe('LabCard', () => {
  it('shows photos selected from lab_photos', () => {
    render(<LabCard lab={lab} locale="ru" />)

    expect(screen.getByTestId('lab-card-image')).toHaveAttribute(
      'src',
      '/api/photos/image?path=%D0%A4%D0%B8%D0%B7%D0%B8%D0%BA%D0%B0%2F%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%82%2F%D0%A3%D0%BC%D0%BD%D0%B0%D1%8F%20%D1%82%D0%B5%D0%BB%D0%B5%D0%B6%D0%BA%D0%B0.png'
    )
  })
})
