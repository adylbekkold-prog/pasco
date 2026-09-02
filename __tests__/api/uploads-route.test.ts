/** @jest-environment node */

import { chmod, mkdir, writeFile } from 'node:fs/promises'
import { POST } from '@/app/api/uploads/route'

jest.mock('node:fs/promises', () => ({
  chmod: jest.fn().mockResolvedValue(undefined),
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  it('stores public uploads with web-readable directory and file permissions', async () => {
    const file = new File(['%PDF-1.7\n'], 'worksheet.pdf', {
      type: 'application/pdf',
    })

    const response = await POST(createUploadRequest(file))

    expect(response.status).toBe(200)
    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('test'), {
      mode: 0o755,
      recursive: true,
    })
    expect(chmod).toHaveBeenCalledWith(expect.stringContaining('public'), 0o755)
    expect(chmod).toHaveBeenCalledWith(expect.stringContaining('test'), 0o755)
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/worksheet-\d+\.pdf$/),
      expect.any(Buffer),
      { mode: 0o644 }
    )
    expect(chmod).toHaveBeenCalledWith(expect.stringMatching(/worksheet-\d+\.pdf$/), 0o644)
  })
})
