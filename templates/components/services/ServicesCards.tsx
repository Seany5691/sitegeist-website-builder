'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesCards() {
  const { config, isLoading } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  // Skeleton UI while loading
  if (isLoading) {
    return (
      <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="skeleton skeleton-text mx-auto" style={{ width: '120px', height: '20px', marginBottom: '0.75rem' }} />
            <div className="skeleton skeleton-heading mx-auto" style={{ width: '400px', maxWidth: '100%', height: '48px', marginBottom: '1rem' }} />
            <div className="skeleton skeleton-text mx-auto" style={{ width: '500px', maxWidth: '100%', height: '24px' }} />
          </div>
          
          {/* Service cards skeleton */}
          <div className={
            services.length <= 3
              ? 'flex flex-wrap justify-center gap-8'
              : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8'
          }>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="skeleton skeleton-avatar mb-6" style={{ width: '64px', height: '64px', borderRadius: '16px' }} />
                <div className="skeleton skeleton-text mb-3" style={{ width: '70%', height: '24px' }} />
                <div className="skeleton skeleton-text mb-2" style={{ height: '18px' }} />
                <div className="skeleton skeleton-text mb-2" style={{ height: '18px' }} />
                <div className="skeleton skeleton-text" style={{ width: '80%', height: '18px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group h-full flex flex-col">
                {/* Decorative accent blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                     style={{ background: 'var(--color-primary-cta)' }} />
                
                {/* Service image with brand-tinted frame (if exists) */}
                {service.imageUrl && (
                  <div className="relative mb-6 rounded-2xl overflow-hidden border-4 shadow-lg"
                       style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                    <img src={service.imageUrl} alt={service.title} 
                         className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                )}
                
                {/* Numbered badge with gradient */}
                <div className="absolute top-6 left-6 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                     style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                  {i + 1}
                </div>
                
                {/* Icon with glow effect */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                     style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-3 flex-shrink-0"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                  {service.title}
                </h3>
                <p className="leading-relaxed mb-4 flex-grow" style={{ color: 'var(--color-muted)' }}>
                  {service.description}
                </p>

                {/* Floating price badge */}
                {service.priceTag && (
                  <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                       style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                    {service.priceTag}
                  </div>
                )}
                
                {/* Premium CTA button */}
                <a href={service.ctaLink || '#contact'} 
                   className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:gap-4 self-start"
                   style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
