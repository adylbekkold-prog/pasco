import type { PascoKit } from '@/types'

export interface PascoPhotoTarget {
  href: string
  kitSlug: string
  kitName: string
  componentId: string
  componentName: string
}

export function getPascoComponentAnchor(componentId: string) {
  return `component-${componentId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getPhotoPathParam(value: string) {
  try {
    const parsed = value.startsWith('/')
      ? new URL(value, 'http://pasco.local')
      : new URL(value)

    if (parsed.pathname.endsWith('/api/photos/image')) {
      return parsed.searchParams.get('path')
    }
  } catch {
    return null
  }

  return null
}

export function normalizePascoPhotoKey(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const photoPath = getPhotoPathParam(trimmed) ?? trimmed

  return safeDecode(photoPath)
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
    .normalize('NFC')
    .toLocaleLowerCase('ru')
}

export function getPascoPhotoTarget(photoValue: string, kits: PascoKit[]): PascoPhotoTarget | null {
  const photoKey = normalizePascoPhotoKey(photoValue)
  if (!photoKey) return null

  for (const kit of kits) {
    if (!kit.slug) continue

    for (const component of kit.components ?? []) {
      if (normalizePascoPhotoKey(component.photo_url) !== photoKey) continue

      return {
        href: `/pasco-kits/${kit.slug}#${getPascoComponentAnchor(component.id)}`,
        kitSlug: kit.slug,
        kitName: kit.name,
        componentId: component.id,
        componentName: component.name,
      }
    }
  }

  return null
}
