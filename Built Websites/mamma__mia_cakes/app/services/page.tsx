'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function ServicesPage() {
  const { config } = useSiteData()
  const services = config?.services || []
  const pc = config?.pageContent || {}

  const sectionTitle = pc.servicesTitle || 'What We Bake'
  const sectionDescription = pc.servicesDescription || 'From custom celebration cakes to dessert catering, we bring your sweetest ideas to life.'
  const ctaTitle = pc.servicesCtaTitle || 'Ready to Order?'
  const ctaText = pc.servicesCtaText || 'Tell us about your event and we\'ll create something unforgettable.'
  const ctaLink = config?.hero?.ctaLink || '#contact'

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
                style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                Our Services
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                {sectionTitle}
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                {sectionDescription}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col"
                    style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)', background: 'var(--color-bg)' }}>
                    {/* Service Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full" style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)))`
                        }} />
                      )}
                    </div>

                    {/* Service Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
                        {service.description}
                      </p>
                      {service.priceTag && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                          <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                            {service.priceTag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ background: 'var(--color-primary)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <AnimateOnScroll>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
                {ctaTitle}
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                {ctaText}
              </p>
              <a href={ctaLink} className="btn btn-lg"
                style={{ background: '#fff', color: 'var(--color-primary)' }}>
                Order Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
