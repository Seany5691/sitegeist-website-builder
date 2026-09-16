'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function PortfolioPage() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sectionTitle = pc.galleryTitle || pc.portfolioTitle || 'Our Creations'
  const sectionDescription = pc.gallerySubtitle || pc.portfolioDescription || 'Every cake tells a story.'

  const categories = imageMap?.categories || {}
  const categoryNames = Object.keys(categories)

  const allImages: { url: string; category: string }[] = []
  Object.entries(categories).forEach(([catName, catData]: [string, any]) => {
    (catData.images || []).forEach((img: any) => {
      allImages.push({ url: typeof img === 'string' ? img : img.src || img.imageUrl || img, category: catName })
    })
  })

  const filteredImages = activeCategory
    ? allImages.filter(img => img.category === activeCategory)
    : allImages

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const nextImage = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % filteredImages.length)
  }
  const prevImage = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length)
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
                style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                Portfolio
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                {sectionTitle}
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                {sectionDescription}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Gallery */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filter */}
            {categoryNames.length > 1 && (
              <AnimateOnScroll className="flex flex-wrap justify-center gap-2 mb-10">
                <button onClick={() => setActiveCategory(null)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    background: activeCategory === null ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: activeCategory === null ? '#fff' : 'var(--color-text)',
                    border: `1px solid ${activeCategory === null ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 10%, transparent)'}`,
                  }}>
                  All
                </button>
                {categoryNames.map(cat => (
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

            {/* Image Grid */}
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((img, i) => (
                  <AnimateOnScroll key={`${img.url}-${i}`} delay={i * 50}>
                    <div className="group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden img-treated"
                      onClick={() => openLightbox(i)}>
                      <img src={img.url} alt={img.category}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium text-sm">{img.category}</span>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-text">Our gallery is being updated. Check back soon for photos of our latest creations.</p>
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeLightbox}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={closeLightbox}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); prevImage() }}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); nextImage() }}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <img src={filteredImages[lightboxIndex]?.url} alt={filteredImages[lightboxIndex]?.category}
              className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
