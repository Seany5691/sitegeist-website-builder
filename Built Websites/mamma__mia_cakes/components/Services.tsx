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
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
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
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}>
                  {/* Image */}
                  <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden img-treated ${isReversed ? 'lg:order-2' : ''}`}>
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 15%, var(--color-bg)))`
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={isReversed ? 'lg:order-1' : ''}>
                    <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
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
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
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
