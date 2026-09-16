'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AboutTeam() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const pc = config?.pageContent || {}
  const team = config?.team || []

  const title = about.title || pc.aboutTitle || 'Our Team'

  return (
    <section id="about" className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>About Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{title}</h2>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="text-center group">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 mx-auto max-w-[280px] img-vignette">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                      {member.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{member.name}</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{member.role}</p>
                {member.bio && <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>{member.bio}</p>}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
