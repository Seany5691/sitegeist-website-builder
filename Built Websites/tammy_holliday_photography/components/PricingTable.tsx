'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

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
          <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--color-accent)' }}>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricing.map((item: any, i: number) => {
            const isFeatured = i === 1 && pricing.length > 2
            return (
              <AnimateOnScroll key={i} delay={i * 100}>
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
                      style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
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
                        ? { background: 'var(--color-primary)', color: 'var(--color-bg)' } 
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
