const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.avif']
const SAFE_RESOURCE_PROTOCOLS = new Set(['http:', 'https:'])

function isSameOrSubdomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

export function isSafeResourceUrl(url: string) {
  if (!url.trim()) return false

  try {
    const parsed = new URL(url, 'http://localhost')
    return (
      SAFE_RESOURCE_PROTOCOLS.has(parsed.protocol) &&
      parsed.username.length === 0 &&
      parsed.password.length === 0
    )
  } catch {
    return false
  }
}

function getNormalizedPath(url: string) {
  try {
    return new URL(url, 'http://localhost').pathname.toLowerCase()
  } catch {
    return url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? ''
  }
}

function getExtension(url: string) {
  const pathname = getNormalizedPath(url)
  const dotIndex = pathname.lastIndexOf('.')

  return dotIndex >= 0 ? pathname.slice(dotIndex) : ''
}

export function isDirectVideoUrl(url: string) {
  return DIRECT_VIDEO_EXTENSIONS.includes(getExtension(url))
}

export function isImageUrl(url: string) {
  return IMAGE_EXTENSIONS.includes(getExtension(url))
}

export function isPdfUrl(url: string) {
  return getExtension(url) === '.pdf'
}

export function isSparkLabUrl(url: string) {
  return getExtension(url) === '.spklab'
}

export function getEmbeddableVideoUrl(url: string) {
  if (!isSafeResourceUrl(url)) return null

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (
      isSameOrSubdomain(hostname, 'youtube.com') ||
      isSameOrSubdomain(hostname, 'youtube-nocookie.com')
    ) {
      if (parsed.pathname.startsWith('/embed/')) {
        const videoId = parsed.pathname.split('/').filter(Boolean).at(-1)
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (isSameOrSubdomain(hostname, 'vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).at(-1)
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : null
    }
  } catch {
    return null
  }

  return null
}
