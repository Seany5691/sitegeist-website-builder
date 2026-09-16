'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'
import Lightbox from './_Lightbox'

export default function GalleryLightbox() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allImages.map((img, i) => (
            <AnimateOnScroll key={i} delay={i * 60}>
              <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 img-treated"
                onClick={() => setLightboxIndex(i)}>
                <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={allImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </section>
  )
}
