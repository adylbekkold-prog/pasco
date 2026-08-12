/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import SubjectLabBrowser from '@/components/SubjectLabBrowser'
import type { Grade, Lab, Subject } from '@/types'

jest.mock('@/components/ResponsiveImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="subject-lab-image" src={src} alt={alt} />
  ),
}))

const subject: Subject = {
  id: 'subject-1',
  name: 'Физика',
  slug: 'physics',
  icon: 'F',
  color: '#1647c5',
  sort_order: 1,
}

const grade: Grade = {
  id: 'grade-1',
  level: 10,
  label: '10 класс',
}

const lab = {
  id: 'lab-1',
  title: 'Импульс',
  slug: 'impuls',
  content: 'Описание',
  thumbnail_url: null,
  photo_urls: ['Физика/Комплект/Умная тележка.png'],
  is_published: true,
  subject_id: subject.id,
  grade_id: grade.id,
  equipment_ids: [],
  created_at: '2026-07-28T00:00:00.000Z',
  updated_at: '2026-07-28T00:00:00.000Z',
  subjects: subject,
  grades: grade,
} satisfies Lab

describe('SubjectLabBrowser', () => {
  it('shows lab photos in the subject lab list', () => {
    render(
      <SubjectLabBrowser
        labs={[lab]}
        grades={[grade]}
        subject={subject}
        locale="ru"
      />
    )

    expect(screen.getByTestId('subject-lab-image')).toHaveAttribute(
      'src',
      '/api/photos/image?path=%D0%A4%D0%B8%D0%B7%D0%B8%D0%BA%D0%B0%2F%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%82%2F%D0%A3%D0%BC%D0%BD%D0%B0%D1%8F%20%D1%82%D0%B5%D0%BB%D0%B5%D0%B6%D0%BA%D0%B0.png'
    )
  })
})
