const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.avif']

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

export function getEmbeddableVideoUrl(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return url
      }

      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).at(-1)
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}
