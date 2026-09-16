'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function PricingContent() {
  const { config } = useSiteData()
  const pricing = config?.pricing || []

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">Investment</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>Pricing & Packages</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Transparent pricing for all photography services. Every package includes professional editing and an online gallery.
            </p>
          </div>
        </section>

        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {pricing.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricing.map((pkg: any, i: number) => (
                  <div key={i} className="relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    {i === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: 'var(--color-primary)' }}>Popular</div>
                    )}
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{pkg.name}</h3>
                    <div className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{pkg.price}</div>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>{pkg.description}</p>
                    {pkg.features && (
                      <ul className="space-y-3">
                        {pkg.features.map((feature: string, j: number) => (
                          <li key={j} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text)' }}>
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a href="#contact" className="btn btn-md btn-outline w-full mt-8">Book Now</a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg" style={{ color: 'var(--color-muted)' }}>Pricing information is being updated. Please contact us for a custom quote.</p>
                <a href="#contact" className="btn btn-lg btn-primary mt-6">Get a Custom Quote</a>
              </div>
            )}
          </div>
        </section>

        <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-bg) 95%, var(--color-primary))' }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Layflat Albums</h2>
            <p className="text-lg mb-2" style={{ color: 'var(--color-muted)' }}>Preserve your memories in a beautiful, handcrafted album.</p>
            <p className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Starting from R2,100</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>These albums come with a range of cover options. Contact Tammy to discuss your preferences.</p>
          </div>
        </section>

        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Not Sure Which Package Is Right?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-muted)' }}>Every session is unique. Let's chat about your vision and I'll help you find the perfect fit.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#contact" className="btn btn-lg btn-primary">Get in Touch</a>
              <a href="tel:+27834799732" className="btn btn-lg btn-outline">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call 083 479 9732
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
