'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Desktop column count for a row of n items — wraps without leaving a lonely
 * orphan card on the last row when a good split exists.
 */
function lgColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  const last3 = n % 3
  const last4 = n % 4
  const bad3 = last3 === 1
  const bad4 = last4 === 1
  if (bad3 && !bad4) return 4
  if (bad4 && !bad3) return 3
  return last3 === 0 ? 3 : last4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each row item. The AnimateOnScroll wrapper is the flex
 * item, so the sizing must live on its className. 1-2 items get a larger card,
 * 3-4 sit in a full row, 5+ wrap into centred rows.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-md lg:max-w-lg'
  if (n === 2) return 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]'
}


export default function PricingTable() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const pricing = config?.pricing || []

  const sectionTitle = pc.pricingTitle || 'Our Pricing'
  const sectionSubtitle = pc.pricingSubtitle || ''

  if (pricing.length === 0) return null

  return (
    <section id="pricing" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--safe-eyebrow)' }}>
            Pricing
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

        <div className="flex flex-wrap justify-center gap-8">
          {pricing.map((item: any, i: number) => {
            const isFeatured = i === 1 && pricing.length > 2
            return (
              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(pricing.length)}>
                <div 
                  className={`group relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col ${isFeatured ? 'card hover-lift scale-105' : 'card hover-lift'}`}
                  style={{ 
                    borderColor: isFeatured ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 8%, transparent)', 
                    background: 'var(--color-bg)',
                    ...(isFeatured ? { boxShadow: '0 4px 20px color-mix(in srgb, var(--color-primary) 20%, transparent)' } : {})
                  }}
                >
                  {/* Featured indicator */}
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold animate-pulse"
                      style={{ background: 'var(--color-primary-cta)', color: 'var(--color-primary)' }}>
                      Popular
                    </div>
                  )}

                  <h3 className="text-lg font-bold mb-2"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {item.service}
                  </h3>

                  <div className="mb-4">
                    <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                      {item.price}
                    </span>
                  </div>

                  {item.details && (
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
                      {item.details}
                    </p>
                  )}

                  <div className="mt-6">
                    <a 
                      href="#contact" 
                      className={`btn btn-md w-full press-scale ${isFeatured ? 'hover-glow' : ''}`}
                      style={isFeatured 
                        ? { background: 'var(--color-primary-cta)', color: 'var(--color-bg)' } 
                        : { border: '2px solid var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' }
                      }
                    >
                      Get Started
                    </a>
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
