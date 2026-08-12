import type { Lab } from '@/types'

const SAFE_ABSOLUTE_PHOTO_PROTOCOLS = new Set(['http:', 'https:'])

export function getPhotoImageUrl(value?: string | null) {
  const photoPath = value?.trim()
  if (!photoPath) return null

  if (photoPath.startsWith('/')) {
    return photoPath
  }

  try {
    const parsed = new URL(photoPath)
    if (SAFE_ABSOLUTE_PHOTO_PROTOCOLS.has(parsed.protocol)) {
      return photoPath
    }
  } catch {
    // Local lab photos are stored as paths relative to the lab_photos folder.
  }

  return `/api/photos/image?path=${encodeURIComponent(photoPath)}`
}

export function getLabPhotoUrl(lab: Pick<Lab, 'thumbnail_url' | 'photo_urls'>) {
  return getPhotoImageUrl(lab.thumbnail_url) ?? getPhotoImageUrl(lab.photo_urls?.find(Boolean))
}
