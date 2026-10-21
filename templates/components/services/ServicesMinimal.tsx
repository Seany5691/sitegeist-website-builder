'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesMinimal() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-lg max-w-2xl" style={{ color: 'var(--color-muted)' }}>
              {sectionSubtitle}
            </p>
          )}
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 gap-x-16 gap-y-10">
          {services.map((service: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-0.5" style={{ background: 'var(--color-primary-cta)' }} />
                  <h3 className="text-xl font-bold"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {service.title}
                  </h3>
                </div>
                <p className="leading-relaxed pl-11" style={{ color: 'var(--color-muted)' }}>
                  {service.description}
                </p>
                {service.priceTag && (
                  <div className="pl-11 mt-2 text-sm font-semibold" style={{ color: 'var(--safe-eyebrow)' }}>
                    {service.priceTag}
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
