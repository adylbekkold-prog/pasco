const DEFAULT_SITE_URL = 'http://localhost:3000'

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

export function getSiteUrl() {
  const rawUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    DEFAULT_SITE_URL

  try {
    const url = new URL(withProtocol(rawUrl.trim()))
    url.pathname = ''
    url.search = ''
    url.hash = ''
    return url
  } catch {
    return new URL(DEFAULT_SITE_URL)
  }
}

export function getAbsoluteSiteUrl(pathname = '/') {
  return new URL(pathname, getSiteUrl()).toString()
}
