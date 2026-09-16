'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutContent() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}
  const team = config?.team || []
  const specializations = config?.specializations || []

  const title = about.title || pc.aboutTitle || 'Our Story'
  const tagline = about.tagline || 'Real Estate, Done the Right Way.'
  const paragraphs = [about.paragraph1, about.paragraph2, about.paragraph3].filter(Boolean)

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80)' }} />
        <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-white/70">About Us</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
            {title}
          </h1>
          <p className="text-lg text-white/80 italic">{tagline}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <AnimateOnScroll>
                <div className="space-y-6">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {p}
                    </p>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>
            <div className="lg:col-span-2">
              <AnimateOnScroll delay={200}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                  <img src={about.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'}
                    alt="Virtuous Living Real Estate office" className="w-full h-full object-cover" />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                Meet the Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                The People Behind Virtuous Living
              </h2>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member: any, i: number) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="text-center p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-accent)' }}>{member.role}</p>
                    {member.bio && <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{member.bio}</p>}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                What We Do Best
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                Our Specializations
              </h2>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 gap-4">
              {specializations.map((spec: string, i: number) => (
                <AnimateOnScroll key={i} delay={i * 80}>
                  <div className="flex items-start gap-3 p-4 rounded-lg"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--color-primary)' }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{spec}</span>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
