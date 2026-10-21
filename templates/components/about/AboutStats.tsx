'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useEffect, useRef } from 'react'

function StatCounter({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          
          // Extract numeric part from value
          const numericMatch = value.match(/\d+/)
          if (numericMatch) {
            const target = parseInt(numericMatch[0])
            const duration = 1500 // 1.5 seconds
            const increment = Math.ceil(target / (duration / 16)) // ~60fps
            let current = 0

            const timer = setInterval(() => {
              current += increment
              if (current >= target) {
                setCount(target)
                clearInterval(timer)
              } else {
                setCount(current)
              }
            }, 16)

            return () => clearInterval(timer)
          } else {
            setCount(0) // Non-numeric values show as-is
          }
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, hasAnimated])

  // Replace numeric part with animated count
  const displayValue = count > 0 ? value.replace(/\d+/, count.toString()) : value

  return (
    <div 
      ref={ref}
      className="text-center p-6 rounded-xl border card hover-lift"
      style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}
    >
      <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
        {displayValue}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</div>
    </div>
  )
}

/**
 * Single source of truth for stats — same values on every page.
 * Never invent fallback numbers; hide stats when nothing is configured.
 */
function getSiteStats(config: any): Array<{ value: string; label: string }> {
  if (!config) return []
  if (Array.isArray(config.stats) && config.stats.length > 0) {
    return config.stats
      .filter((s: any) => s && (s.value || s.label))
      .map((s: any) => ({ value: String(s.value ?? ''), label: String(s.label ?? '') }))
  }
  const hero = config.hero || {}
  const pairs: Array<[any, any]> = [
    [hero.stat1Value, hero.stat1Label],
    [hero.stat2Value, hero.stat2Label],
    [hero.stat3Value, hero.stat3Label],
    [hero.stat4Value, hero.stat4Label],
  ]
  const out: Array<{ value: string; label: string }> = []
  for (const [value, label] of pairs) {
    if (value && label) out.push({ value: String(value), label: String(label) })
    else if (value) out.push({ value: String(value), label: '' })
  }
  return out
}

export default function AboutStats() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'About Us'
  const subtitle = pc.aboutSubtitle || ''
  const paragraphs = [about.paragraph1, about.paragraph2].filter(Boolean)
  const imageUrl = about.imageUrl || pc.aboutImageUrl || ''

  const stats = getSiteStats(config)
  const statsEnabled = config?.controls?.sections?.statsBar !== false

  return (
    <section id="about" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>About Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{title}</h2>
          {subtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>}
        </AnimateOnScroll>

        {/* Stats — only when configured */}
        {statsEnabled && stats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <StatCounter value={stat.value} label={stat.label} delay={i * 100} />
              </AnimateOnScroll>
            ))}
          </div>
        )}

        {/* Image + Text side by side */}
        <div className={`flex flex-col ${imageUrl ? 'lg:flex-row' : ''} gap-10 items-start`}>
          {imageUrl && (
            <AnimateOnScroll className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={imageUrl} alt={title} className="w-full h-auto object-cover" style={{ maxHeight: '450px' }} />
              </div>
            </AnimateOnScroll>
          )}
          <div className={`w-full ${imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto text-left'}`}>
            {paragraphs.map((p, i) => (
              <AnimateOnScroll key={i}>
                <p className="text-lg leading-relaxed mb-6 last:mb-0" style={{ color: 'var(--color-muted)' }}>{p}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
