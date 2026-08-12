/* eslint-disable @next/next/no-img-element */

import Image from 'next/image'

export default function ResponsiveImage({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 33vw',
  className = '',
  priority = false,
}: {
  src: string
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}) {
  const canOptimize =
    (src.startsWith('/') && !src.includes('?')) ||
    src.includes('.supabase.co/storage/v1/object/public/')

  if (!canOptimize) {
    return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} className={className} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
