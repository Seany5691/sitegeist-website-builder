'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesAsymmetric() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionDescription = pc.servicesDescription || ''

  if (services.length === 0) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionDescription && (
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              {sectionDescription}
            </p>
          )}
        </AnimateOnScroll>

        <div className="space-y-16 lg:space-y-24">
          {services.map((service: any, i: number) => {
            const isReversed = i % 2 === 1

            return (
              <AnimateOnScroll key={i}>
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}>
                  {/* Image */}
                  <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden img-treated ${isReversed ? 'lg:order-2' : ''}`}>
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{
                        background: `linear-gradient(${isReversed ? '225deg' : '135deg'}, color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 15%, var(--color-bg)))`
                      }} />
                    )}
                    {/* Service number badge */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
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
                    <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
                      {service.description}
                    </p>
                    {service.priceTag && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
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
