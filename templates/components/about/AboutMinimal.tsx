'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutMinimal() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'About Us'
  const tagline = about.tagline || ''
  const paragraphs = [about.paragraph1, about.paragraph2, about.paragraph3].filter(Boolean)

  return (
    <section id="about" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="w-16 h-1 mb-8" style={{ background: 'var(--color-accent)' }} />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{title}</h2>
          {tagline && <p className="text-xl italic mb-6" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>&ldquo;{tagline}&rdquo;</p>}
          <div className="space-y-4">
            {paragraphs.length > 0 ? paragraphs.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>{p}</p>
            )) : (
              <p className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                We are passionate about delivering excellence in everything we do.
              </p>
            )}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
