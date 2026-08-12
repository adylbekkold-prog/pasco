import { getPascoComponentAnchor, getPascoPhotoTarget } from '@/lib/pasco-kit-photo-links'
import type { PascoKit } from '@/types'

const kit = {
  id: 'kit-1',
  name: 'Mechanics kit',
  slug: 'pasco-mechanics',
  description: null,
  thumbnail_url: null,
  subject_id: 'subject-physics',
  sort_order: 1,
  created_at: '2026-08-04T00:00:00.000Z',
  updated_at: '2026-08-04T00:00:00.000Z',
  components: [
    {
      id: 'red-cart',
      kit_id: 'kit-1',
      name: 'Red cart',
      quantity: 1,
      photo_url: '/api/photos/image?path=Physics%2FMechanics%2FRed%20Cart.png',
      description: null,
      storage_location: null,
      notes: null,
      sort_order: 1,
    },
  ],
} satisfies PascoKit

describe('pasco kit photo links', () => {
  it('links raw lab photo paths to matching PASCO kit components', () => {
    expect(getPascoPhotoTarget('Physics/Mechanics/Red Cart.png', [kit])).toEqual({
      href: '/pasco-kits/pasco-mechanics#component-red-cart',
      kitSlug: 'pasco-mechanics',
      kitName: 'Mechanics kit',
      componentId: 'red-cart',
      componentName: 'Red cart',
    })
  })

  it('normalizes encoded API photo URLs', () => {
    expect(
      getPascoPhotoTarget('/api/photos/image?path=Physics%2FMechanics%2FRed%20Cart.png', [kit])?.href
    ).toBe('/pasco-kits/pasco-mechanics#component-red-cart')
  })

  it('sanitizes component anchors', () => {
    expect(getPascoComponentAnchor('component/with spaces')).toBe('component-component-with-spaces')
  })
})
