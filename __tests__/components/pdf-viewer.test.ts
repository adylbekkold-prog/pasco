import { getSafePdfUrl } from '@/components/PdfViewer'

describe('PdfViewer URL handling', () => {
  beforeEach(() => {
    window.history.pushState({}, '', 'http://localhost/labs/demo')
  })

  it('adds a stable viewer cache-bust parameter to same-origin PDF URLs', () => {
    expect(getSafePdfUrl('/uploads/labs/demo/worksheet.pdf')).toBe(
      'http://localhost/uploads/labs/demo/worksheet.pdf?pdf-viewer=1'
    )
  })

  it('preserves existing query parameters when adding the viewer cache-bust parameter', () => {
    expect(getSafePdfUrl('/uploads/labs/demo/worksheet.pdf?download=1')).toBe(
      'http://localhost/uploads/labs/demo/worksheet.pdf?download=1&pdf-viewer=1'
    )
  })

  it('rejects cross-origin PDF URLs', () => {
    expect(() => getSafePdfUrl('https://example.com/worksheet.pdf')).toThrow(
      'Only same-origin PDF files can be opened in the embedded viewer.'
    )
  })

  it('rejects non-PDF URLs', () => {
    expect(() => getSafePdfUrl('/uploads/labs/demo/worksheet.txt')).toThrow(
      'Only same-origin PDF files can be opened in the embedded viewer.'
    )
  })
})
