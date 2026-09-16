'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'
import Lightbox from './_Lightbox'

export default function GalleryFilterable() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sectionTitle = pc.galleryTitle || 'Our Work'
  const sectionSubtitle = pc.gallerySubtitle || ''

  const categories = imageMap?.categories || {}
  const categoryNames = Object.keys(categories)
  const allImages: { url: string; category: string }[] = []
  categoryNames.forEach(catName => {
    (categories[catName].images || []).forEach((img: any) => {
      allImages.push({ url: typeof img === 'string' ? img : img.src || img.imageUrl || img, category: catName })
    })
  })

  const filtered = activeCategory === 'All' ? allImages : allImages.filter(img => img.category === activeCategory)

  if (allImages.length === 0) return null

  return (
    <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
            Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              {sectionSubtitle}
            </p>
          )}
        </AnimateOnScroll>

        {/* Filter tabs */}
        <AnimateOnScroll delay={100} className="flex flex-wrap justify-center gap-2 mb-10">
          {['All', ...categoryNames].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: activeCategory === cat ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                color: activeCategory === cat ? '#fff' : 'var(--color-text)',
                border: `1px solid ${activeCategory === cat ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 10%, transparent)'}`,
              }}>
              {cat}
            </button>
          ))}
        </AnimateOnScroll>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <div key={`${img.url}-${i}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg img-treated"
              onClick={() => setLightboxIndex(i)}>
              <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{img.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox images={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </section>
  )
}
