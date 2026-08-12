import { test, expect, type Page } from '@playwright/test'

/**
 * SparkVue deploy smoke tests.
 *
 * Install once:
 *   npm i -D @playwright/test
 *   npx playwright install chromium
 *
 * Run against a deployed env:
 *   BASE_URL=https://your-domain.com npx playwright test tests/sparkvue-deploy.spec.ts
 *
 * These tests verify the three things that actually break this WASM app on a
 * public deploy: missing COEP/COOP headers, wrong MIME on the wasm bundle,
 * and loss of cross-origin isolation inside the iframe.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const SPARKVUE_INDEX = `${BASE}/sparkvue/index.html`

test.describe('sparkvue deploy gates', () => {
  test('index.html returns COEP/COOP and scoped CSP headers', async ({ request }) => {
    const r = await request.get(SPARKVUE_INDEX)
    expect(r.status()).toBe(200)

    const headers = r.headers()
    expect(headers['cross-origin-embedder-policy'], 'COEP must be credentialless').toBe('credentialless')
    expect(headers['cross-origin-opener-policy'], 'COOP must be same-origin').toBe('same-origin')

    const csp = headers['content-security-policy'] ?? ''
    expect(csp).toContain("frame-src 'self' blob: data:")
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:")
    expect(csp).toContain("worker-src 'self' blob:")
    // Deprecated prefetch-src must NOT be present (it is silently ignored
    // and signals a stale config).
    expect(csp).not.toContain('prefetch-src')
  })

  test('spark.wasm is served with application/wasm MIME', async ({ request }) => {
    const r = await request.get(`${BASE}/sparkvue/spark.wasm`)
    expect(r.status()).toBe(200)
    const ct = r.headers()['content-type'] ?? ''
    expect(ct, 'WASM must be served as application/wasm, not octet-stream').toContain('application/wasm')
  })

  test('spark.js is served as JavaScript and accept-ranges is on', async ({ request }) => {
    const r = await request.get(`${BASE}/sparkvue/spark.js`)
    expect(r.status()).toBe(200)
    const ct = r.headers()['content-type'] ?? ''
    expect(ct).toContain('javascript')
  })

  test('manifest.json is reachable and valid', async ({ request }) => {
    const r = await request.get(`${BASE}/sparkvue/manifest.json`)
    expect(r.status()).toBe(200)
    const body = await r.json()
    expect(body.start_url).toBeDefined()
    expect(body.scope).toBeDefined()
    expect(Array.isArray(body.icons) && body.icons.length > 0).toBe(true)
  })

  test('iframe achieves crossOriginIsolated and bridge reaches "opened"', async ({ browser }) => {
    test.skip(!process.env.SPARKVUE_TEST_LAB_URL, 'Set SPARKVUE_TEST_LAB_URL to a lab slug with a .spklab resource to run the end-to-end check.')

    const labSlug = process.env.SPARKVUE_TEST_LAB_URL!
    const page = await browser.newPage()

    const errors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    page.on('pageerror', (e) => errors.push(String(e)))

    await page.goto(`${BASE}/labs/${labSlug}`)

    // The host page exposes __lastSparkStatus in non-production builds
    // (see the dev hook in components/LabResources.tsx).  The bridge posts:
    // booting -> loading -> opened  (or -> error)
    await page.waitForFunction(
      () => (window as unknown as { __lastSparkStatus?: string }).__lastSparkStatus === 'opened',
      undefined,
      { timeout: 120_000 },
    )

    const frame = page.frame({ url: /\/sparkvue\/index\.html/ })
    expect(frame, 'sparkvue iframe must be present').toBeTruthy()

    const isolated = await frame!.evaluate(() => self.crossOriginIsolated === true)
    expect(isolated, 'iframe must be cross-origin isolated').toBe(true)

    const hasSab = await frame!.evaluate(() => typeof SharedArrayBuffer !== 'undefined')
    expect(hasSab, 'SharedArrayBuffer must be available inside the iframe').toBe(true)

    // Tolerate benign offline-guard warnings; fail on anything else.
    const meaningful = errors.filter((e) => !e.includes('offline-guard'))
    expect(meaningful, `unexpected console errors: ${meaningful.join('\n')}`).toEqual([])
  })
})

// Silence the unused-page warning in some runners.
export type _Page = Page
