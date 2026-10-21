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
            <div className="grid lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden">
              {/* Decorative accent blob */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-5"
                   style={{ background: 'var(--color-primary-cta)' }} />
              
              <div className="relative z-10">
                {/* Numbered badge */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg mb-6"
                     style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                  {activeTab + 1}
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  {services[activeTab].title}
                </h3>
                <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
                  {services[activeTab].description}
                </p>
                {services[activeTab].priceTag && (
                  <div className="inline-block px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                       style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
                    {services[activeTab].priceTag}
                  </div>
                )}
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 shadow-lg relative z-10"
                   style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
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
