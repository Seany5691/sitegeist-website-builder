'use client'

import { useCallback, useRef, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'beforeAfter'

function Slider({ before, after, caption }: { before: string; after: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const draggingRef = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    updateFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    updateFromClientX(e.clientX)
  }

  const onPointerUp = () => {
    draggingRef.current = false
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPos((p) => Math.max(0, p - 2))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPos((p) => Math.min(100, p + 2))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPos(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPos(100)
    }
  }

  return (
    <figure className="w-full">
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={caption || 'Before and after comparison'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl select-none cursor-ew-resize"
        style={{
          border: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
          boxShadow: '0 8px 32px color-mix(in srgb, var(--color-text) 8%, transparent)',
          touchAction: 'none',
        }}
      >
        {/* AFTER (full-bleed base) */}
        <img
          src={after}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* BEFORE (clipped to the handle) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--color-text) 70%, transparent)', color: 'var(--color-bg)' }}
        >
          Before
        </span>
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none"
          style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
        >
          After
        </span>

        {/* Handle */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full" style={{ background: 'var(--color-bg)', opacity: 0.9 }} />
          <div
            className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              transform: 'translate(-50%, -50%)',
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              boxShadow: '0 4px 16px color-mix(in srgb, var(--color-text) 25%, transparent)',
            }}
          >
            <Icon name="exchange" size={18} />
          </div>
        </div>
      </div>

      {caption && (
        <figcaption className="mt-3 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export default function BeforeAfter() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const pairs = Array.isArray(data.pairs) ? data.pairs : []
  if (!enabled || pairs.length === 0) return null

  return (
    <section
      className="py-14 sm:py-16"
      style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2
            className="text-center text-3xl sm:text-4xl font-bold mb-10"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
          >
            {data.title}
          </h2>
        )}

        <div className={`grid gap-8 ${pairs.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
          {pairs.map((pair: any, i: number) =>
            pair?.before && pair?.after ? (
              <Slider key={i} before={pair.before} after={pair.after} caption={pair.caption} />
            ) : null
          )}
        </div>
      </div>
    </section>
  )
}
