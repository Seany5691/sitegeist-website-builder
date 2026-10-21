'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'photoLightbox'

export default function PhotoLightbox() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false

  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState<number | null>(null)

  // Collect gallery images and intercept clicks on them.
  useEffect(() => {
    if (!enabled) return

    const collect = (): HTMLImageElement[] => {
      const roots = Array.from(
        document.querySelectorAll('#gallery, .gallery-grid')
      )
      const seen = new Set<HTMLImageElement>()
      const out: HTMLImageElement[] = []
      roots.forEach((root) => {
        root.querySelectorAll('img').forEach((img) => {
          if (seen.has(img)) return
          seen.add(img)
          out.push(img)
        })
      })
      return out
    }

    const refresh = () => {
      const imgs = collect()
      setImages(imgs.map((img) => img.currentSrc || img.src).filter(Boolean))
      return imgs
    }

    refresh()

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target || target.tagName !== 'IMG') return
      const img = target as HTMLImageElement
      const inGallery = img.closest('#gallery, .gallery-grid')
      if (!inGallery) return

      e.preventDefault()
      const current = refresh()
      const src = img.currentSrc || img.src
      const i = current.findIndex((el) => (el.currentSrc || el.src) === src)
      setIndex(i >= 0 ? i : 0)
    }

    document.addEventListener('click', onClick, true)

    // Keep the list fresh as galleries lazy-render.
    const observer = new MutationObserver(() => {
      refresh()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
    }
  }, [enabled])

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => {
    setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))
  }, [images.length])
  const next = useCallback(() => {
    setIndex((i) => (i === null ? i : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (index === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, close, prev, next])

  if (!enabled || index === null || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'color-mix(in srgb, #000 88%, transparent)' }}
        onClick={close}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
      >
        <Icon name="close" size={20} />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
        >
          <Icon name="chevron-left" size={22} />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="relative max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      />

      {images.length > 1 && (
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
        >
          <Icon name="chevron-right" size={22} />
        </button>
      )}

      {images.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
        >
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
