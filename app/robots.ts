import type { MetadataRoute } from 'next'
import { getAbsoluteSiteUrl, getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/sersdp/',
        '/login',
        '/api/',
        '/auth/',
        '/reset-password/',
        '/uploads/',
        '/sparkvue/',
        '/whatsnew/',
      ],
    },
    sitemap: getAbsoluteSiteUrl('/sitemap.xml'),
    host: siteUrl.origin,
  }
}
