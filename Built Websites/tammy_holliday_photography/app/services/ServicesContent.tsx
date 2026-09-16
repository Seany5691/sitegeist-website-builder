'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function ServicesContent() {
  const { config } = useSiteData()
  const services = config?.services || []
  const pc = config?.pageContent || {}

  const title = pc.servicesTitle || 'Photography Services'
  const description = pc.servicesDescription || ''
  const ctaTitle = pc.servicesCtaTitle || 'Ready to Book Your Session?'
  const ctaText = pc.servicesCtaText || ''

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">What We Offer</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>{title}</h1>
            {description && <p className="text-lg text-white/80 max-w-2xl mx-auto">{description}</p>}
          </div>
        </section>

        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <div key={i} className="group p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                    <svg className="w-7 h-7" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                    {service.title}
                  </h3>
                  <p className="leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>{service.description}</p>
                  {service.priceTag && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-secondary)' }}>
                      {service.priceTag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-bg) 95%, var(--color-primary))' }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              {ctaTitle}
            </h2>
            {ctaText && <p className="text-lg mb-8" style={{ color: 'var(--color-muted)' }}>{ctaText}</p>}
            <a href="#contact" className="btn btn-lg btn-primary">Book Your Session</a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
