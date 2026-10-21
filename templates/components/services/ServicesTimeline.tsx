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
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
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
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold relative z-10 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', fontFamily: 'var(--font-heading)' }}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Content - Premium Card */}
                  <div className="flex-1 pb-4 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden group">
                    {/* Decorative accent blob */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                         style={{ background: 'var(--color-primary-cta)' }} />
                    
                    {/* Service image with brand-tinted frame (if exists) */}
                    {service.imageUrl && (
                      <div className="relative mb-4 rounded-xl overflow-hidden border-4 shadow-lg"
                           style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                        <img src={service.imageUrl} alt={service.title} 
                             className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold mb-2"
                      style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                      {service.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {service.description}
                    </p>
                    {service.priceTag && (
                      <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                        style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
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
