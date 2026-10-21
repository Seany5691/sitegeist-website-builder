'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutVideo() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'About Us'
  const paragraphs = [about.paragraph1, about.paragraph2].filter(Boolean)
  const videoUrl = about.videoUrl || ''

  return (
    <section id="about" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll>
            <div className="aspect-video rounded-2xl overflow-hidden">
              {videoUrl ? (
                <iframe src={videoUrl} className="w-full h-full" allowFullScreen />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <svg className="w-16 h-16" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              )}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={150}>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>About Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{title}</h2>
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>{p}</p>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
