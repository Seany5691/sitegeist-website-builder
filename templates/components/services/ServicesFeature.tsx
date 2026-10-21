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

        <div className="space-y-4">
          {services.map((service: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 80}>
              <div className="group grid lg:grid-cols-12 gap-4 items-center p-8 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                {/* Decorative accent blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                     style={{ background: 'var(--color-primary-cta)' }} />
                
                {/* Number */}
                <div className="lg:col-span-1">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                       style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                    {i + 1}
                  </div>
                </div>

                {/* Title */}
                <div className="lg:col-span-3">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
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
                    <div className="px-4 py-2 rounded-full text-sm font-bold shadow-lg inline-block"
                         style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                      {service.priceTag}
                    </div>
                  ) : (
                    <a href={service.ctaLink || '#contact'}
                       className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:gap-4"
                       style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                      Learn More
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
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
