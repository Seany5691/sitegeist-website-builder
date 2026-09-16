'use client'

import { useEffect, useCallback } from 'react'

interface LightboxImage {
  url: string
  category: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const handlePrev = useCallback(() => {
    onNavigate(index > 0 ? index - 1 : images.length - 1)
  }, [index, images.length, onNavigate])

  const handleNext = useCallback(() => {
    onNavigate(index < images.length - 1 ? index + 1 : 0)
  }, [index, images.length, onNavigate])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, handlePrev, handleNext])

  if (!images[index]) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 p-2"
        onClick={onClose} aria-label="Close lightbox">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-3 rounded-full bg-white/10 hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); handlePrev() }} aria-label="Previous image">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-3 rounded-full bg-white/10 hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); handleNext() }} aria-label="Next image">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
        <img src={images[index].url} alt={`${images[index].category} ${index + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}
