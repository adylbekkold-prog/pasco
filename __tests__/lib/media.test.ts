import {
  getEmbeddableVideoUrl,
  isDirectVideoUrl,
  isImageUrl,
  isPdfUrl,
  isSafeResourceUrl,
  isSparkLabUrl,
} from '@/lib/media'

describe('media URL helpers', () => {
  it('recognizes local preview and PASCO resource formats', () => {
    expect(isPdfUrl('/uploads/labs/demo/instruction.PDF?version=2')).toBe(true)
    expect(isDirectVideoUrl('/uploads/labs/demo/experiment.mp4')).toBe(true)
    expect(isImageUrl('/uploads/labs/demo/setup.webp')).toBe(true)
    expect(isSparkLabUrl('/uploads/labs/demo/kinetics.SPKLAB')).toBe(true)
  })

  it('creates safe embed URLs only for supported video providers', () => {
    expect(getEmbeddableVideoUrl('https://youtu.be/demo123')).toBe(
      'https://www.youtube.com/embed/demo123'
    )
    expect(getEmbeddableVideoUrl('https://vimeo.com/123456')).toBe(
      'https://player.vimeo.com/video/123456'
    )
    expect(getEmbeddableVideoUrl('https://example.com/video')).toBeNull()
    expect(getEmbeddableVideoUrl('https://evilyoutube.com/watch?v=demo123')).toBeNull()
  })

  it('rejects executable and credentialed resource URLs', () => {
    expect(isSafeResourceUrl('/uploads/labs/demo/instruction.pdf')).toBe(true)
    expect(isSafeResourceUrl('https://cdn.example.com/instruction.pdf')).toBe(true)
    expect(isSafeResourceUrl('javascript:alert(1).pdf')).toBe(false)
    expect(isSafeResourceUrl('data:text/html,<script>alert(1)</script>.pdf')).toBe(false)
    expect(isSafeResourceUrl('https://user:password@example.com/instruction.pdf')).toBe(false)
  })
})
