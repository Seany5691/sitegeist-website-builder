'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutLayered() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}

  const title = about.title || pc.aboutTitle || 'Our Story'
  const tagline = about.tagline || ''
  const paragraphs = [about.paragraph1, about.paragraph2, about.paragraph3].filter(Boolean)
  const imageUrl = about.imageUrl || ''

  return (
    <section id="about" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Layered images */}
          <AnimateOnScroll>
            <div className="relative">
              {/* Background image (offset) */}
              <div className="absolute top-8 left-8 w-full aspect-[4/5] rounded-2xl overflow-hidden opacity-30"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                {imageUrl && (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Main image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl img-vignette">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 15%, var(--color-bg)))` }} />
                )}
              </div>

              {/* Tagline badge */}
              {tagline && (
                <div className="absolute -bottom-4 -right-4 rounded-2xl p-5 shadow-xl max-w-[200px] z-10"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                  <p className="text-sm font-bold italic" style={{ fontFamily: 'var(--font-heading)' }}>&ldquo;{tagline}&rdquo;</p>
                </div>
              )}

              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full -z-10"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }} />
            </div>
          </AnimateOnScroll>

          {/* Content */}
          <AnimateOnScroll delay={150}>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>About Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
              {title}
            </h2>
            <div className="space-y-4">
              {paragraphs.length > 0 ? paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>{p}</p>
              )) : (
                <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  We are passionate about what we do and committed to delivering the best experience for our clients.
                </p>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
