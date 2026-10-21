'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesAlternating() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
            What We Offer
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

        <div className="space-y-16 lg:space-y-24">
          {services.map((service: any, i: number) => {
            const isReversed = i % 2 !== 0
            return (
              <AnimateOnScroll key={i}>
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden group ${isReversed ? 'lg:direction-rtl' : ''}`}>
                  {/* Decorative accent blob */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                       style={{ background: 'var(--color-primary-cta)' }} />
                  
                  {/* Image with brand-tinted frame */}
                  <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-4 shadow-lg ${isReversed ? 'lg:order-2' : ''}`}
                       style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full" style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 15%, var(--color-bg)))`
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`relative z-10 ${isReversed ? 'lg:order-1' : ''}`}>
                    {/* Numbered badge */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg mb-4"
                         style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                      {i + 1}
                    </div>
                    
                    <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
                      Service {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold mt-2 mb-4"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                      {service.title}
                    </h3>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
                      {service.description}
                    </p>
                    {service.priceTag && (
                      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                        style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                        {service.priceTag}
                      </div>
                    )}
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
