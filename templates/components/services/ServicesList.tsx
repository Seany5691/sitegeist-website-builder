'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesList() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="group flex items-start gap-5 p-6 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <span className="text-lg font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                        {service.title}
                      </h3>
                      <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {service.description}
                      </p>
                    </div>
                    {service.priceTag && (
                      <span className="text-sm font-semibold whitespace-nowrap px-3 py-1 rounded-full"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--safe-eyebrow)' }}>
                        {service.priceTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
