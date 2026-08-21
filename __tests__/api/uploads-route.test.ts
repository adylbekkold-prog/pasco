/** @jest-environment node */

import { POST } from '@/app/api/uploads/route'

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/admin-access', () => ({
  assertServerLocalAdminAccess: jest.fn().mockResolvedValue(undefined),
}))

function createUploadRequest(file: File) {
  const formData = new FormData()
  formData.set('file', file)
  formData.set('scope', '__test__')

  return new Request('http://localhost/api/uploads', {
    body: formData,
    method: 'POST',
  })
}

describe('uploads API route', () => {
  it('rejects SVG uploads', async () => {
    const file = new File(['<svg><script>alert(1)</script></svg>'], 'attack.svg', {
      type: 'image/svg+xml',
    })

    const response = await POST(createUploadRequest(file))

    expect(response.status).toBe(415)
  })

  it('rejects files whose bytes do not match the extension', async () => {
    const file = new File(['<html><script>alert(1)</script></html>'], 'fake.png', {
      type: 'image/png',
    })

    const response = await POST(createUploadRequest(file))

    expect(response.status).toBe(415)
  })

  it('rejects requests above the configured upload size before parsing the body', async () => {
    const response = await POST(
      new Request('http://localhost/api/uploads', {
        body: '',
        headers: {
          'content-length': String(100 * 1024 * 1024 + 1),
        },
        method: 'POST',
      })
    )

    expect(response.status).toBe(413)
  })

  it('accepts SPARKvue lab files even when browsers omit the MIME type', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'activity.spklab', {
      type: '',
    })

    const response = await POST(createUploadRequest(file))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.url).toMatch(/\/uploads\/labs\/test\/activity-\d+\.spklab/)
  })
})
