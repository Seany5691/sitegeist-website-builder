'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useRef } from 'react'

export default function ServicesAccordion() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []
  const [openIndex, setOpenIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <AnimateOnScroll>
          <div className="space-y-3">
            {services.map((service: any, i: number) => (
              <div key={i} className="rounded-xl border overflow-hidden transition-all duration-300"
                style={{ borderColor: openIndex === i ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <button onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200"
                  style={{ background: openIndex === i ? 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' : 'var(--color-bg)' }}>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--safe-eyebrow)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                      {service.title}
                    </span>
                  </div>
                  <svg className="w-5 h-5 transition-transform duration-300 flex-shrink-0"
                    style={{ color: 'var(--color-muted)', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === i ? (contentRef.current?.scrollHeight ? contentRef.current.scrollHeight + 'px' : '500px') : '0', opacity: openIndex === i ? 1 : 0 }}>
                  <div ref={contentRef} className="px-6 pb-5" style={{ color: 'var(--color-muted)' }}>
                    <p className="leading-relaxed">{service.description}</p>
                    {service.priceTag && (
                      <div className="mt-3 text-sm font-semibold" style={{ color: 'var(--safe-eyebrow)' }}>
                        {service.priceTag}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
