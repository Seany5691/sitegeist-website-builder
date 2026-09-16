'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'
import Lightbox from './_Lightbox'

export default function GalleryCategories() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sectionTitle = pc.galleryTitle || 'Our Work'
  const sectionSubtitle = pc.gallerySubtitle || ''

  const categories = imageMap?.categories || {}
  const categoryNames = Object.keys(categories).filter(name => {
    // Filter out noise categories
    if (name.toLowerCase().includes('call me')) return false
    if (name.toLowerCase().includes('menu')) return false
    const cat = categories[name]
    return cat.images && cat.images.length > 0
  })

  if (categoryNames.length === 0) return null

  // If a category is selected, show its images
  if (activeCategory) {
    const catData = categories[activeCategory] || {}
    const images: string[] = (catData.images || []).map((img: any) => typeof img === 'string' ? img : img.src || img.imageUrl || img)

    return (
      <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="mb-8">
            <button onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </button>
            <h2 className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              {activeCategory}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{images.length} photos</p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, i) => (
              <div key={i}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg img-treated"
                onClick={() => setLightboxIndex(i)}>
                <img src={url} alt={`${activeCategory} ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <Lightbox images={images.map(url => ({ url, category: activeCategory || '' }))} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
        )}
      </section>
    )
  }

  // Default: show category cards
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

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${categoryNames.length <= 2 ? 'max-w-2xl mx-auto' : ''}`}>
          {categoryNames.map((catName, i) => {
            const catData = categories[catName]
            const thumbUrl = catData.thumbnail || (catData.images?.[0] ? (typeof catData.images[0] === 'string' ? catData.images[0] : catData.images[0].src || catData.images[0].imageUrl) : '')
            const count = catData.images?.length || 0

            return (
              <AnimateOnScroll key={catName} delay={i * 80}>
                <div className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-xl overflow-hidden border"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}
                  onClick={() => setActiveCategory(catName)}>
                  <div className="aspect-[3/4] overflow-hidden relative img-vignette">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={catName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-bg))' }}>
                        <svg className="w-12 h-12" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                        View Photos
                      </span>
                    </div>
                  </div>
                  <div className="p-4" style={{ background: 'var(--color-bg)' }}>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                      {catName}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      {count} photo{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
