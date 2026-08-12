import { getLabPhotoUrl, getPhotoImageUrl } from '@/lib/lab-photo-url'
import type { Lab } from '@/types'

describe('lab photo URL helpers', () => {
  it('serves raw lab_photos paths through the photo API', () => {
    expect(getPhotoImageUrl('Физика/Комплект/Умная тележка.png')).toBe(
      '/api/photos/image?path=%D0%A4%D0%B8%D0%B7%D0%B8%D0%BA%D0%B0%2F%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%82%2F%D0%A3%D0%BC%D0%BD%D0%B0%D1%8F%20%D1%82%D0%B5%D0%BB%D0%B5%D0%B6%D0%BA%D0%B0.png'
    )
  })

  it('keeps already usable image URLs unchanged', () => {
    expect(getPhotoImageUrl('/api/photos/image?path=demo')).toBe('/api/photos/image?path=demo')
    expect(getPhotoImageUrl('https://example.com/photo.png')).toBe('https://example.com/photo.png')
  })

  it('prefers thumbnails and falls back to the first selected lab photo', () => {
    const lab = {
      thumbnail_url: null,
      photo_urls: ['Физика/demo.png'],
    } as Pick<Lab, 'thumbnail_url' | 'photo_urls'>

    expect(getLabPhotoUrl(lab)).toBe(
      '/api/photos/image?path=%D0%A4%D0%B8%D0%B7%D0%B8%D0%BA%D0%B0%2Fdemo.png'
    )

    expect(getLabPhotoUrl({ ...lab, thumbnail_url: '/uploads/labs/demo/thumb.jpg' })).toBe(
      '/uploads/labs/demo/thumb.jpg'
    )
  })
})
