'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useRef } from 'react'

export default function GalleryCarousel() {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

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

        <AnimateOnScroll>
          <div className="relative">
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {allImages.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-72 sm:w-80 snap-start group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden img-treated">
                    <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-medium">{img.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <button onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-200 hover:scale-110"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-200 hover:scale-110"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
