'use client'

import { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import Image from 'next/image'

interface GalleryImage {
  imageUrl: string
  caption: string
  category: string
}

const categories = ['Services', 'About', 'Contact']

// Sample of gallery images from site-config
const galleryImages: GalleryImage[] = [
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/c74384b0fe9b079864480a1b3ded01f7_fit.jpg?ts=1773309012', caption: 'Services 1', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/950ea77ad03f1398cf9599ffb9d98899_fit.png?ts=1773309012', caption: 'Services 2', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/320c29334fd86b932bd999c69c34f89f_fit.png?ts=1773309013', caption: 'Services 3', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/532dede8e46a04d6c5e1360ee4f08cfd_fit.jpg?ts=1773309014', caption: 'Services 4', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/76477bf71b77e9f63cd465664526cafa_518x778_fit.jpg?ts=1773309015', caption: 'Services 5', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/e6b83df75b5278869e5894c27f8f8a53_472x630_fit.jpg?ts=1773309016', caption: 'Services 6', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/dca9af17e4af88cef2d84ec816f4c965_fit.png', caption: 'Services 7', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/cbc17ffc9459f5a7453a75f713298dc1_960x602_fit.jpg', caption: 'Services 8', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/82e3160b77d53285d2d273350e0bf836_960x568_fit.jpg', caption: 'Services 9', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/87f6c292b3937847401fc14e898f0a9c_fit.jpg', caption: 'Services 10', category: 'Services' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/5a4fc26abce41c5a0581533f27769c32_1200x674_fit.jpg?ts=1773309017', caption: 'About 1', category: 'About' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/950ea77ad03f1398cf9599ffb9d98899_fit.png?ts=1773309017', caption: 'About 2', category: 'About' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/16d2e18bf296ce1b7bfcf7620ee650ab_2400x1350_fit.jpg', caption: 'About 3', category: 'About' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/2aca91a54d009fb5b8681e9f0d29d8f7_fit.png?ts=1773309019', caption: 'Contact 1', category: 'Contact' },
  { imageUrl: 'https://www.lekwasecurityservices.co.za/gallery_gen/950ea77ad03f1398cf9599ffb9d98899_fit.png?ts=1773309019', caption: 'Contact 2', category: 'Contact' },
]

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Services')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const filtered = galleryImages.filter((img) => img.category === activeCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev! + 1) % filtered.length)
  }, [lightboxIndex, filtered.length])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev! - 1 + filtered.length) % filtered.length)
  }, [lightboxIndex, filtered.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, goNext, goPrev])

  return (
    <section id="gallery" className="relative py-20 md:py-28 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
            Gallery
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            See our security professionals in action across Lephalale.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-slate-950'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <m.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((img, i) => (
              <m.div
                key={img.caption}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-white/5"
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.caption}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white">{img.caption}</span>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-10"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 p-2 text-gray-400 hover:text-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 p-2 text-gray-400 hover:text-white z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image
                src={filtered[lightboxIndex].imageUrl}
                alt={filtered[lightboxIndex].caption}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-6 text-center">
              <p className="text-white text-sm">{filtered[lightboxIndex].caption}</p>
              <p className="text-gray-500 text-xs mt-1">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
