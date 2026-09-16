'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesTimeline() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Process'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
            How It Works
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

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 hidden sm:block"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }} />

          <div className="space-y-12">
            {services.map((service: any, i: number) => (
              <AnimateOnScroll key={i} delay={i * 150}>
                <div className="flex gap-6 sm:gap-8">
                  {/* Step number */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative z-10"
                      style={{ background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h3 className="text-xl font-bold mb-2"
                      style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                      {service.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {service.description}
                    </p>
                    {service.priceTag && (
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
                        {service.priceTag}
                      </div>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
