import type { MetadataRoute } from 'next'
import { getLabs, getPascoKits } from '@/lib/queries'
import { getAbsoluteSiteUrl } from '@/lib/site-url'
import type { Lab, Locale, PascoKit } from '@/types'


export const revalidate = 3600

type SitemapEntry = MetadataRoute.Sitemap[number]

const STATIC_ROUTES: Array<{
  pathname: string
  changeFrequency: SitemapEntry['changeFrequency']
  priority: number
}> = [
  { pathname: '/', changeFrequency: 'weekly', priority: 1 },
  { pathname: '/labs', changeFrequency: 'daily', priority: 0.95 },
  { pathname: '/subjects', changeFrequency: 'weekly', priority: 0.8 },
  { pathname: '/grades', changeFrequency: 'weekly', priority: 0.75 },
  { pathname: '/pasco-kits', changeFrequency: 'weekly', priority: 0.85 },
]

function toEntry(
  pathname: string,
  changeFrequency: SitemapEntry['changeFrequency'],
  priority: number,
  lastModified = new Date()
): SitemapEntry {
  return {
    url: getAbsoluteSiteUrl(pathname),
    lastModified,
    changeFrequency,
    priority,
  }
}

async function safeGetLabs(locale: Locale) {
  try {
    return await getLabs({ locale })
  } catch (error) {
    console.error('Failed to build labs sitemap entries:', error)
    return [] as Lab[]
  }
}

async function safeGetPascoKits(locale: Locale) {
  try {
    return await getPascoKits(undefined, locale)
  } catch (error) {
    console.error('Failed to build PASCO kit sitemap entries:', error)
    return [] as PascoKit[]
  }
}


function getNewestLab(left: Lab, right: Lab) {
  const leftTime = new Date(left.updated_at || left.created_at).getTime()
  const rightTime = new Date(right.updated_at || right.created_at).getTime()
  return leftTime >= rightTime ? left : right
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ruLabs, kyLabs, ruKits, kyKits] = await Promise.all([
    safeGetLabs('ru'),
    safeGetLabs('ky'),
    safeGetPascoKits('ru'),
    safeGetPascoKits('ky'),
  ])

  const labsBySlug = new Map<string, Lab>()
  for (const lab of [...ruLabs, ...kyLabs]) {
    if (!lab.is_published || !lab.slug) continue
    const current = labsBySlug.get(lab.slug)
    labsBySlug.set(lab.slug, current ? getNewestLab(current, lab) : lab)
  }

  const kitsBySlug = new Map<string, PascoKit>()
  for (const kit of [...ruKits, ...kyKits]) {
    if (kit.slug) kitsBySlug.set(kit.slug, kit)
  }

  return [
    ...STATIC_ROUTES.map((route) =>
      toEntry(route.pathname, route.changeFrequency, route.priority)
    ),
    ...Array.from(labsBySlug.values()).map((lab) =>
      toEntry(
        `/labs/${lab.slug}`,
        'monthly',
        0.8,
        new Date(lab.updated_at || lab.created_at)
      )
    ),
    ...Array.from(kitsBySlug.values()).map((kit) =>
      toEntry(
        `/pasco-kits/${kit.slug}`,
        'monthly',
        0.75,
        new Date(kit.updated_at || kit.created_at)
      )
    ),
  ]
}
