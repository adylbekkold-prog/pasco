/** @jest-environment node */

import { serveSparkVueAsset } from '@/lib/sparkvue-files'

describe('large local file streaming', () => {
  it('serves SPARKvue WASM metadata without buffering a response body', async () => {
    const response = await serveSparkVueAsset(
      new Request('http://localhost:3000/sparkvue/spark.wasm', { method: 'HEAD' }),
      ['spark.wasm']
    )

    expect(response.status).toBe(200)
    expect(Number(response.headers.get('content-length'))).toBeGreaterThan(10_000_000)
    expect(response.headers.get('content-type')).toBe('application/wasm')
    expect(response.headers.get('accept-ranges')).toBe('bytes')
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'self'")
    expect(response.headers.get('cross-origin-embedder-policy')).toBe('credentialless')
    expect(response.headers.get('x-dns-prefetch-control')).toBe('off')
    expect(response.body).toBeNull()
  })

  it('supports byte ranges and conditional requests for SPARKvue assets', async () => {
    const rangeResponse = await serveSparkVueAsset(
      new Request('http://localhost:3000/sparkvue/spark.wasm', {
        headers: { range: 'bytes=0-15' },
      }),
      ['spark.wasm']
    )

    expect(rangeResponse.status).toBe(206)
    expect(rangeResponse.headers.get('content-range')).toMatch(/^bytes 0-15\//)
    expect((await rangeResponse.arrayBuffer()).byteLength).toBe(16)

    const entityTag = rangeResponse.headers.get('etag')
    const cachedResponse = await serveSparkVueAsset(
      new Request('http://localhost:3000/sparkvue/spark.wasm', {
        headers: { 'if-none-match': entityTag! },
      }),
      ['spark.wasm']
    )

    expect(cachedResponse.status).toBe(304)
    expect(cachedResponse.body).toBeNull()
  })

  it('blocks traversal outside the SPARKvue asset directory', async () => {
    const traversalResponse = await serveSparkVueAsset(
      new Request('http://localhost:3000/sparkvue/../../package.json'),
      ['..', '..', 'package.json']
    )

    expect(traversalResponse.status).toBe(400)
  })
})
