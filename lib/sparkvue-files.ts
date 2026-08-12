import 'server-only'

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

const SPARKVUE_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), 'sparkvue-pwa')
const SPARKVUE_CONTENT_SECURITY_POLICY = [
  "default-src 'self' blob: data:",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "frame-src 'self' blob: data:",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "prefetch-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join('; ')
const REVALIDATE_FILES = new Set([
  'blockly-namespace-compat.js',
  'index.html',
  'manifest.json',
  'offline_guard.js',
  'pasco-lab-bridge.js',
])

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.eot': 'application/vnd.ms-fontobject',
  '.gif': 'image/gif',
  '.htm': 'text/html; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
}

interface ByteRange {
  end: number
  start: number
}

function resolveAssetPath(segments: string[]) {
  const decodedSegments = segments.map((segment) => decodeURIComponent(segment))
  const assetPath = path.resolve(/*turbopackIgnore: true*/ SPARKVUE_ROOT, ...decodedSegments)
  const relativePath = path.relative(SPARKVUE_ROOT, assetPath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null

  return assetPath
}

function getCacheControl(assetPath: string) {
  const fileName = path.basename(assetPath).toLowerCase()

  return REVALIDATE_FILES.has(fileName)
    ? 'no-cache, no-store, must-revalidate'
    : 'public, max-age=604800, stale-while-revalidate=86400'
}

function createEntityTag(size: number, modifiedAt: Date) {
  return `W/"${size.toString(16)}-${Math.trunc(modifiedAt.getTime()).toString(16)}"`
}

function getHeaders(
  assetPath: string,
  contentLength: number,
  entityTag: string,
  modifiedAt: Date
) {
  const extension = path.extname(assetPath).toLowerCase()

  return {
    'accept-ranges': 'bytes',
    'cache-control': getCacheControl(assetPath),
    'content-security-policy': SPARKVUE_CONTENT_SECURITY_POLICY,
    'content-length': String(contentLength),
    'content-type': CONTENT_TYPES[extension] ?? 'application/octet-stream',
    'cross-origin-embedder-policy': 'credentialless',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',
    etag: entityTag,
    'last-modified': modifiedAt.toUTCString(),
    'origin-agent-cluster': '?1',
    'permissions-policy': 'bluetooth=(self), cross-origin-isolated=(self), serial=(self), usb=(self)',
    'referrer-policy': 'no-referrer',
    'x-dns-prefetch-control': 'off',
    'x-content-type-options': 'nosniff',
  }
}

function parseRangeHeader(rangeHeader: string | null, fileSize: number): ByteRange | 'invalid' | null {
  if (!rangeHeader) return null
  if (!rangeHeader.startsWith('bytes=') || rangeHeader.includes(',')) return 'invalid'

  const [startValue, endValue] = rangeHeader.slice(6).split('-', 2)

  if (!startValue && !endValue) return 'invalid'

  if (!startValue) {
    const suffixLength = Number(endValue)
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return 'invalid'

    return {
      start: Math.max(0, fileSize - suffixLength),
      end: fileSize - 1,
    }
  }

  const start = Number(startValue)
  const end = endValue ? Number(endValue) : fileSize - 1

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize ||
    end >= fileSize
  ) {
    return 'invalid'
  }

  return { start, end }
}

function isNotModified(request: Request, entityTag: string, modifiedAt: Date) {
  if (request.headers.get('if-none-match') === entityTag) return true

  const ifModifiedSince = request.headers.get('if-modified-since')
  if (!ifModifiedSince) return false

  const parsedDate = new Date(ifModifiedSince)
  if (Number.isNaN(parsedDate.getTime())) return false

  return Math.trunc(modifiedAt.getTime() / 1000) <= Math.trunc(parsedDate.getTime() / 1000)
}

function createBody(assetPath: string, request: Request, range: ByteRange | null) {
  const fileStream = createReadStream(
    /* turbopackIgnore: true */ assetPath,
    range ? { start: range.start, end: range.end } : undefined
  )

  request.signal.addEventListener('abort', () => fileStream.destroy(), { once: true })

  return Readable.toWeb(fileStream) as ReadableStream<Uint8Array>
}

export async function serveSparkVueAsset(request: Request, segments: string[]) {
  try {
    const assetPath = resolveAssetPath(segments)

    if (!assetPath) return new Response('Invalid path', { status: 400 })

    const assetStat = await stat(/* turbopackIgnore: true */ assetPath)
    if (!assetStat.isFile()) return new Response('Not found', { status: 404 })

    const entityTag = createEntityTag(assetStat.size, assetStat.mtime)
    const baseHeaders = getHeaders(assetPath, assetStat.size, entityTag, assetStat.mtime)

    if (isNotModified(request, entityTag, assetStat.mtime)) {
      const headers = new Headers(baseHeaders)
      headers.delete('content-length')
      return new Response(null, { status: 304, headers })
    }

    const range = parseRangeHeader(request.headers.get('range'), assetStat.size)
    if (range === 'invalid') {
      return new Response(null, {
        status: 416,
        headers: {
          ...baseHeaders,
          'content-length': '0',
          'content-range': `bytes */${assetStat.size}`,
        },
      })
    }

    const contentLength = range ? range.end - range.start + 1 : assetStat.size
    const headers = {
      ...getHeaders(assetPath, contentLength, entityTag, assetStat.mtime),
      ...(range ? { 'content-range': `bytes ${range.start}-${range.end}/${assetStat.size}` } : {}),
    }

    if (request.method === 'HEAD') {
      return new Response(null, { status: range ? 206 : 200, headers })
    }

    return new Response(createBody(assetPath, request, range), {
      status: range ? 206 : 200,
      headers,
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
