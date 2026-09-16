'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesFeature() {
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

        <div className="space-y-4">
          {services.map((service: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 80}>
              <div className="group grid lg:grid-cols-12 gap-4 items-center p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
                style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                {/* Number */}
                <div className="lg:col-span-1">
                  <span className="text-3xl font-bold" style={{ color: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', fontFamily: 'var(--font-heading)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <div className="lg:col-span-3">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="lg:col-span-6">
                  <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {service.description}
                  </p>
                </div>

                {/* Price / CTA */}
                <div className="lg:col-span-2 text-right">
                  {service.priceTag ? (
                    <span className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                      {service.priceTag}
                    </span>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                      Learn More →
                    </span>
                  )}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
