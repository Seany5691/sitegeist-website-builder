'use client'

import { useEffect, useRef, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'

const FEATURE_ID = 'scrollProgress'

export default function ScrollProgress() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const measure = () => {
      rafRef.current = null
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])

  if (!enabled) return null

  const thickness = Number(data.thickness) > 0 ? Number(data.thickness) : 3

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[55]"
      style={{
        height: `${thickness}px`,
        width: `${progress}%`,
        pointerEvents: 'none',
        background: data.color || 'var(--color-accent)',
        boxShadow: `0 0 8px color-mix(in srgb, ${data.color || 'var(--color-accent)'} 50%, transparent)`,
        transition: 'width 80ms linear',
      }}
    />
  )
}
