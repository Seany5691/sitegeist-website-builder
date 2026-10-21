'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AdditionalSections() {
  const { config } = useSiteData()
  const sections = config?.additionalSections || []

  if (sections.length === 0) return null

  return (
    <>
      {sections.map((section: any, i: number) => (
        <section key={section.id || i} id={`touch-${section.id || i}`} className="section-padding" style={{ background: i % 2 === 0 ? 'var(--color-bg)' : 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-10">
              <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--safe-eyebrow)' }}>
                {section.type === 'content' ? 'About' : section.type}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
                  {section.subtitle}
                </p>
              )}
            </AnimateOnScroll>

            {/* Content block */}
            {section.content && (
              <AnimateOnScroll>
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {section.content}
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            {/* Items grid (for process steps, features, etc.) */}
            {section.items && section.items.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {section.items.map((item: any, j: number) => (
                  <AnimateOnScroll key={j} delay={j * 100}>
                    <div className="rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
                      style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)', background: 'var(--color-bg)' }}>
                      {item.image && (
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-4">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {item.description}
                      </p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            )}

            {/* Images row (for sponsor logos, partner logos, etc.) */}
            {section.images && section.images.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
                {section.images.map((img: string, j: number) => (
                  <AnimateOnScroll key={j} delay={j * 50}>
                    <div className="w-24 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                      <img src={img} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  )
}
