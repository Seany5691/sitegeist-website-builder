'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function ServicesContent() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []
  const contact = config?.contact || {}

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionDescription = pc.servicesDescription || ''
  const ctaTitle = pc.servicesCtaTitle || 'Ready to Get Started?'
  const ctaText = pc.servicesCtaText || ''

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80)' }} />
        <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-white/70">What We Offer</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h1>
          {sectionDescription && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {sectionDescription}
            </p>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, i: number) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="h-full p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)'
                  }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {service.title}
                  </h3>
                  <p className="leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
                    {service.description}
                  </p>
                  {service.priceTag && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
                      {service.priceTag}
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {ctaTitle}
            </h2>
            {ctaText && (
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {ctaText}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="btn btn-lg btn-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp}?text=Hi%20Virtuous%20Living%20Real%20Estate`} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-outline">
                  WhatsApp Us
                </a>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  )
}
