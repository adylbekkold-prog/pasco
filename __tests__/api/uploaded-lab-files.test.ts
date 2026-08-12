/** @jest-environment node */

import { serveUploadedLabFile } from '@/lib/uploaded-lab-files'

describe('uploaded lab file streaming', () => {
  it('serves newly uploaded PDF files with PDF headers', async () => {
    const response = await serveUploadedLabFile(
      new Request('http://localhost:3000/uploads/labs/__test__/sample.pdf'),
      ['__test__', 'sample.pdf']
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('accept-ranges')).toBe('bytes')
    expect(response.headers.get('content-disposition')).toContain('inline')
    expect((await response.text()).startsWith('%PDF-')).toBe(true)
  })

  it('supports byte ranges for PDF.js and SPARKvue downloads', async () => {
    const response = await serveUploadedLabFile(
      new Request('http://localhost:3000/uploads/labs/__test__/sample.pdf', {
        headers: { range: 'bytes=0-7' },
      }),
      ['__test__', 'sample.pdf']
    )

    expect(response.status).toBe(206)
    expect(response.headers.get('content-range')).toMatch(/^bytes 0-7\//)
    expect(await response.text()).toBe('%PDF-1.7')
  })

  it('blocks traversal outside public uploads', async () => {
    const response = await serveUploadedLabFile(
      new Request('http://localhost:3000/uploads/labs/../../package.json'),
      ['..', '..', 'package.json']
    )

    expect(response.status).toBe(400)
  })
})
