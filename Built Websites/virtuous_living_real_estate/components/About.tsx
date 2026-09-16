'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutTimeline() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'Our Story'
  const paragraphs = [about.paragraph1, about.paragraph2, about.paragraph3].filter(Boolean)

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>About Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{title}</h2>
        </AnimateOnScroll>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }} />
          <div className="space-y-12">
            {paragraphs.map((p, i) => (
              <AnimateOnScroll key={i} delay={i * 150}>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 text-lg font-bold"
                    style={{ background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    {i + 1}
                  </div>
                  <p className="text-lg leading-relaxed pt-2" style={{ color: 'var(--color-muted)' }}>{p}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
