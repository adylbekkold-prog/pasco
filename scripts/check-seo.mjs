#!/usr/bin/env node
import http from 'node:http'
import https from 'node:https'
import { readFileSync } from 'node:fs'

function loadEnvFile(pathname) {
  try {
    const content = readFileSync(pathname, 'utf8')

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const index = trimmed.indexOf('=')
      const key = trimmed.slice(0, index).trim()
      const value = trimmed
        .slice(index + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')

      if (key && process.env[key] == null) {
        process.env[key] = value
      }
    }
  } catch {
    // The check can still run with explicit env vars or local defaults.
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const baseUrl = new URL(
  process.env.BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000'
)
const publicUrl = new URL(
  process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    baseUrl.toString()
)
const allowSelfSigned = process.env.ALLOW_SELF_SIGNED === '1'

function requestText(pathname) {
  const url = new URL(pathname, baseUrl)
  const client = url.protocol === 'https:' ? https : http
  const options = allowSelfSigned ? { rejectUnauthorized: false } : {}

  return new Promise((resolve, reject) => {
    const req = client.get(url, options, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode ?? 0, body })
      })
    })
    req.on('error', reject)
    req.setTimeout(15000, () => {
      req.destroy(new Error(`Timed out fetching ${url}`))
    })
  })
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message)
}

function getSitemapLocations(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1])
}

const failures = []
const [robots, sitemap, homepage] = await Promise.all([
  requestText('/robots.txt'),
  requestText('/sitemap.xml'),
  requestText('/'),
])

assert(robots.statusCode === 200, `robots.txt returned ${robots.statusCode}`, failures)
assert(sitemap.statusCode === 200, `sitemap.xml returned ${sitemap.statusCode}`, failures)
assert(homepage.statusCode === 200, `homepage returned ${homepage.statusCode}`, failures)

assert(robots.body.includes('User-Agent: *'), 'robots.txt misses User-Agent: *', failures)
assert(robots.body.includes('Sitemap:'), 'robots.txt misses Sitemap', failures)
assert(robots.body.includes('Disallow: /sersdp/'), 'robots.txt does not block /sersdp/', failures)
assert(robots.body.includes('Disallow: /login'), 'robots.txt does not block /login', failures)
assert(sitemap.body.includes('<urlset'), 'sitemap.xml misses urlset', failures)

const sitemapLocations = getSitemapLocations(sitemap.body)
const sitemapPaths = new Set(sitemapLocations.map((location) => new URL(location).pathname))

assert(sitemapLocations.length > 0, 'sitemap.xml has no URLs', failures)
assert(sitemapPaths.has('/'), 'sitemap.xml misses homepage', failures)
assert(sitemapPaths.has('/labs'), 'sitemap.xml misses /labs', failures)
assert(sitemapPaths.has('/pasco-kits'), 'sitemap.xml misses /pasco-kits', failures)
assert(
  sitemapLocations.every((location) => new URL(location).origin === publicUrl.origin),
  `sitemap.xml has URLs outside ${publicUrl.origin}`,
  failures
)
assert(
  /<link rel="canonical" href="[^"]+"/.test(homepage.body),
  'homepage misses canonical link',
  failures
)

if (failures.length > 0) {
  console.error('SEO check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`SEO check passed for ${baseUrl.origin}`)
console.log(`Public origin: ${publicUrl.origin}`)
console.log(`Sitemap URLs: ${sitemapLocations.length}`)
