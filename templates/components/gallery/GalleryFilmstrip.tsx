'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function GalleryFilmstrip() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [isDragging, setIsDragging] = useState(false)

  const sectionTitle = pc.galleryTitle || 'Our Work'
  const sectionSubtitle = pc.gallerySubtitle || ''

  const categories = imageMap?.categories || {}
  const allImages: { url: string; category: string }[] = []
  Object.entries(categories).forEach(([catName, catData]: [string, any]) => {
    (catData.images || []).forEach((img: any) => {
      allImages.push({ url: typeof img === 'string' ? img : img.src || img.imageUrl || img, category: catName })
    })
  })

  if (allImages.length === 0) return null

  return (
    <section id="gallery" className="py-16 overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <AnimateOnScroll className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Portfolio</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
        </AnimateOnScroll>
      </div>

      {/* Filmstrip row 1 */}
      <div className="flex gap-4 overflow-hidden mb-4"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}>
        <div className="flex gap-4 animate-filmstrip">
          {[...allImages, ...allImages].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-64 aspect-[3/4] rounded-lg overflow-hidden img-treated">
              <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* Filmstrip row 2 (reverse) */}
      <div className="flex gap-4 overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}>
        <div className="flex gap-4 animate-filmstrip-reverse">
          {[...allImages, ...allImages].reverse().map((img, i) => (
            <div key={i} className="flex-shrink-0 w-48 aspect-[3/4] rounded-lg overflow-hidden">
              <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
