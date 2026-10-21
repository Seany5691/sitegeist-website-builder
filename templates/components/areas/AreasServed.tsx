'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AreasServed() {
  const { config } = useSiteData()
  const areas = config?.featureData?.areasServedStrip || config?.areas || {}
  const geoAreas = config?.geo?.serviceAreas || []

  // Primary source: config.areas.items — fallback: config.geo.serviceAreas (strings or objects)
  const rawItems = Array.isArray(areas.items) && areas.items.length > 0 ? areas.items : geoAreas
  const items = (Array.isArray(rawItems) ? rawItems : [])
    .map((item: any) => (typeof item === 'string' ? { name: item } : item))
    .filter((item: any) => item && item.name)

  if (items.length === 0) return null

  const title = areas.title || 'Areas We Serve'

  return (
    <section id="areas" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item: any, i: number) => {
            const chip = (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 hover-lift"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  color: 'var(--color-text)',
                }}>
                <i className="fas fa-map-marker-alt text-xs" style={{ color: 'var(--safe-eyebrow)' }} aria-hidden="true"></i>
                {item.name}
              </span>
            )
            return (
              <AnimateOnScroll key={i} delay={i * 50}>
                {item.url ? (
                  <a href={item.url} className="block">{chip}</a>
                ) : (
                  chip
                )}
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
