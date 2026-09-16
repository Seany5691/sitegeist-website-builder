'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function GalleryStack() {
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

  const displayImages = allImages.slice(0, 8)

  return (
    <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Portfolio</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
              {sectionTitle}
            </h2>
            {sectionSubtitle && <p className="text-lg" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="relative h-96">
              {displayImages.map((img, i) => {
                const rotation = (i - displayImages.length / 2) * 5
                const translateX = i * 20
                const translateY = i * 10
                const zIndex = displayImages.length - i
                return (
                  <div key={i}
                    className="absolute top-0 left-0 w-64 h-80 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:z-50 cursor-pointer img-treated"
                    style={{ transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`, zIndex }}>
                    <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
