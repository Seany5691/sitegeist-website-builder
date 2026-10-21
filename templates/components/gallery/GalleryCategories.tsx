'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useMemo } from 'react'
import Lightbox from './_Lightbox'

type GalleryProps = {
  /** home = limited preview on the homepage; full = complete gallery page */
  mode?: 'home' | 'full'
}

export default function GalleryCategories({ mode = 'full' }: GalleryProps) {
  const { imageMap, config } = useSiteData()
  const pc = config?.pageContent || {}
  const settings = config?.gallerySettings || {}
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sectionTitle = pc.galleryTitle || 'Our Work'
  const sectionSubtitle = pc.gallerySubtitle || ''

  const categories = useMemo(() => imageMap?.categories || {}, [imageMap])

  // Explicit folder order from dashboard (falls back to insertion order)
  const categoryNames = useMemo(() => {
    const keys = Object.keys(categories).filter(name => {
      // Filter out noise categories
      if (name.toLowerCase().includes('call me')) return false
      if (name.toLowerCase().includes('menu')) return false
      const cat = categories[name]
      return cat.images && cat.images.length > 0
    })
    const order: string[] = settings.folderOrder || imageMap?.categoryOrder || []
    const ordered = order.filter(name => keys.includes(name))
    const rest = keys.filter(name => !ordered.includes(name))
    return [...ordered, ...rest]
  }, [categories, settings.folderOrder, imageMap])

  const allImages = useMemo(() => {
    const list: { url: string; category: string }[] = []
    categoryNames.forEach(catName => {
      (categories[catName].images || []).forEach((img: any) => {
        list.push({
          url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
          category: catName,
        })
      })
    })
    return list
  }, [categories, categoryNames])

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
                className="hover-zoom group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg img-treated"
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

  // ----- Homepage mode -----
  if (mode === 'home') {
    const homeMode = settings.homeMode === 'folders' ? 'folders' : 'pictures'
    const defaultFilter = settings.homeFilter && (settings.homeFilter === 'All' || categoryNames.includes(settings.homeFilter))
      ? settings.homeFilter
      : 'All'
    const pictureLimit = Math.max(1, Number(settings.homePictureLimit) || 8)
    const folderLimit = Math.max(1, Number(settings.homeFolderLimit) || 6)

    // Folders mode: folder tiles
    if (homeMode === 'folders') {
      const visibleFolders = categoryNames.slice(0, folderLimit)

      return (
        <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
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

            <div className="flex flex-wrap justify-center gap-5">
              {visibleFolders.map((catName, i) => {
                const catData = categories[catName] || {}
                const imgs = catData.images || []
                const thumbUrl = catData.thumbnail || (imgs[0] ? (typeof imgs[0] === 'string' ? imgs[0] : imgs[0].src || imgs[0].imageUrl) : '')
                return (
                  <AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">
                    <button
                      onClick={() => setActiveCategory(catName)}
                      className="group relative w-full rounded-2xl overflow-hidden text-left"
                      style={{ aspectRatio: '4/3' }}
                    >
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={catName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-bg))' }}>
                          <svg className="w-12 h-12" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-5">
                        <div>
                          <div className="text-white font-semibold text-lg">{catName}</div>
                          <div className="text-white/80 text-sm">
                            {imgs.length} photo{imgs.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </button>
                  </AnimateOnScroll>
                )
              })}
            </div>

            {categoryNames.length > folderLimit && (
              <div className="text-center mt-10">
                <a href="/portfolio"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
                  View full Gallery
                </a>
              </div>
            )}
          </div>
        </section>
      )
    }

    // Pictures mode (default)
    const pool = defaultFilter === 'All' ? allImages : allImages.filter(img => img.category === defaultFilter)
    const preview = pool.slice(0, pictureLimit)

    return (
      <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
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

          <div className="flex flex-wrap justify-center gap-4">
            {preview.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square img-treated"
                onClick={() => setLightboxIndex(i)}>
                <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>

          {pool.length > preview.length && (
            <div className="text-center mt-10">
              <a href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
                View full Gallery
              </a>
            </div>
          )}
        </div>

        {lightboxIndex !== null && (
          <Lightbox images={preview} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
        )}
      </section>
    )
  }

  // ----- Full mode: all category cards -----
  return (
    <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
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
              <AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">
                <div className="card hover-lift group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border"
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
