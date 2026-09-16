'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function GalleryMinimal() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}

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
    <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Portfolio</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allImages.map((img, i) => (
            <AnimateOnScroll key={i} delay={i * 40}>
              <div className="aspect-square overflow-hidden rounded-lg img-treated">
                <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
