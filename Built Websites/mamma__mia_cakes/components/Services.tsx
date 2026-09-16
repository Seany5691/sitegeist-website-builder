'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ServicesTabs() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const services = config?.services || []
  const [activeTab, setActiveTab] = useState(0)

  const sectionTitle = pc.servicesTitle || 'Our Services'
  const sectionSubtitle = pc.servicesDescription || ''

  return (
    <section id="services" className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
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
          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {services.map((service: any, i: number) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: activeTab === i ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                  color: activeTab === i ? '#fff' : 'var(--color-text)',
                  border: `1px solid ${activeTab === i ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 10%, transparent)'}`,
                }}>
                {service.title}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          {services[activeTab] && (
            <div className="grid lg:grid-cols-2 gap-12 items-center rounded-2xl p-8 lg:p-12 border"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  {services[activeTab].title}
                </h3>
                <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
                  {services[activeTab].description}
                </p>
                {services[activeTab].priceTag && (
                  <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                    {services[activeTab].priceTag}
                  </div>
                )}
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden img-treated">
                {services[activeTab].imageUrl ? (
                  <img src={services[activeTab].imageUrl} alt={services[activeTab].title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)))`
                  }} />
                )}
              </div>
            </div>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  )
}
