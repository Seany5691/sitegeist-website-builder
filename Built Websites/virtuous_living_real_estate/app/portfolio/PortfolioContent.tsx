'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function PortfolioContent() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sectionTitle = pc.portfolioTitle || 'Our Portfolio'
  const sectionDescription = pc.portfolioDescription || ''

  const categories = imageMap?.categories || {}
  const categoryNames = Object.keys(categories)
  const allImages: { url: string; category: string; alt: string }[] = []
  categoryNames.forEach(catName => {
    (categories[catName].images || []).forEach((img: any) => {
      allImages.push({
        url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
        category: catName,
        alt: typeof img === 'string' ? catName : img.alt || catName
      })
    })
  })

  const filtered = activeCategory === 'All' ? allImages : allImages.filter(img => img.category === activeCategory)

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)' }} />
        <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-white/70">Gallery</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h1>
          {sectionDescription && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">{sectionDescription}</p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter tabs */}
          {categoryNames.length > 1 && (
            <AnimateOnScroll className="flex flex-wrap justify-center gap-2 mb-10">
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
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img, i) => (
              <AnimateOnScroll key={`${img.url}-${i}`} delay={i * 50}>
                <div className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => setLightboxIndex(i)}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium">{img.category}</span>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p style={{ color: 'var(--color-muted)' }}>No images available in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 text-3xl w-10 h-10 flex items-center justify-center">
            &times;
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length) }}
            className="absolute left-4 text-white/80 hover:text-white z-10 text-4xl w-12 h-12 flex items-center justify-center">
            &#8249;
          </button>
          <div className="max-w-[90vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <img src={filtered[lightboxIndex]?.url} alt={filtered[lightboxIndex]?.alt} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="text-center mt-4">
              <p className="text-white/80 text-sm">{filtered[lightboxIndex]?.alt}</p>
              <p className="text-white/40 text-xs mt-1">{lightboxIndex + 1} of {filtered.length}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % filtered.length) }}
            className="absolute right-4 text-white/80 hover:text-white z-10 text-4xl w-12 h-12 flex items-center justify-center">
            &#8250;
          </button>
        </div>
      )}
    </>
  )
}
