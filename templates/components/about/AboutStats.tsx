'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutStats() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'About Us'
  const paragraphs = [about.paragraph1, about.paragraph2].filter(Boolean)

  const stats = [
    { value: config?.hero?.stat1Value || '10+', label: config?.hero?.stat1Label || 'Years Experience' },
    { value: config?.hero?.stat2Value || '500+', label: config?.hero?.stat2Label || 'Happy Clients' },
    { value: config?.hero?.stat3Value || '1000+', label: config?.hero?.stat3Label || 'Projects Completed' },
    { value: config?.hero?.stat4Value || '24/7', label: config?.hero?.stat4Label || 'Availability' },
  ]

  return (
    <section id="about" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>About Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{title}</h2>
        </AnimateOnScroll>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="text-center p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{stat.label}</div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Text */}
        <div className="max-w-3xl mx-auto text-center">
          {paragraphs.map((p, i) => (
            <AnimateOnScroll key={i}>
              <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>{p}</p>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
