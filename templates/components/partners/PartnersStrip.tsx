'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Logo/name scale for a strip of n partners. A lone logo at the default size
 * looks sparse on a wide row, so 1-2 partners step up a size or two. Values are
 * literal Tailwind classes so the JIT can see them.
 */
function partnerScale(n: number): { logo: string; name: string } {
  if (n <= 1) return { logo: 'h-14 sm:h-16', name: 'text-2xl' }
  if (n === 2) return { logo: 'h-12 sm:h-14', name: 'text-xl' }
  return { logo: 'h-10 sm:h-12', name: 'text-lg' }
}

export default function PartnersStrip() {
  const { config } = useSiteData()
  const partners = config?.partners || {}
  const items = partners.items || []

  if (!Array.isArray(items) || items.length === 0) return null

  const title = partners.title || ''
  const scale = partnerScale(items.length)

  return (
    <section id="partners" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <AnimateOnScroll className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
              {title}
            </h2>
          </AnimateOnScroll>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
          {items.map((item: any, i: number) => {
            const inner = (
              <div className="flex items-center justify-center transition-all duration-300 hover-lift">
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt={item.name || ''} loading="lazy"
                    className={`${scale.logo} w-auto object-contain transition-all duration-300`}
                    style={{ filter: 'grayscale(1)', opacity: 0.7 }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }} />
                ) : (
                  <span className={`${scale.name} font-semibold px-2 transition-colors duration-300`}
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-muted)' }}>
                    {item.name}
                  </span>
                )}
              </div>
            )
            return (
              <AnimateOnScroll key={i} delay={i * 80}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.name || 'Partner'}>
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
