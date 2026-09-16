'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function GalleryBeforeAfter() {
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

  // Pair images as before/after
  const pairs = []
  for (let i = 0; i < allImages.length - 1; i += 2) {
    pairs.push({ before: allImages[i], after: allImages[i + 1] || allImages[i] })
  }

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

        <div className="grid md:grid-cols-2 gap-8">
          {pairs.map((pair, i) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <BeforeAfterCard before={pair.before} after={pair.after} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

function BeforeAfterCard({ before, after }: { before: { url: string; category: string }; after: { url: string; category: string } }) {
  const [sliderPos, setSliderPos] = useState(50)

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)))
  }

  return (
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-col-resize select-none"
      onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX, e.currentTarget.getBoundingClientRect()) }}
      onMouseDown={(e) => handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}>
      {/* After (full width) */}
      <img src={after.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Before (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={before.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Slider line */}
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white bg-black/50">Before</div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold text-white bg-black/50">After</div>
    </div>
  )
}
