'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function AboutPage() {
  const { config } = useSiteData()
  const about = config?.about || {}
  const team = config?.team || []
  const pc = config?.pageContent || {}
  const businessName = config?.businessName || 'Mamma & Mia Cakes And Catering'
  const motto = config?.motto || 'Real recipes. Real ingredients. Real good cake.'
  const history = config?.history || ''

  const title = about.title || pc.aboutTitle || 'Our Story'
  const subtitle = pc.aboutSubtitle || 'From Our Kitchen to Your Table'

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
                style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                {subtitle}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                {title}
              </h1>
              {about.tagline && (
                <p className="text-lg text-white/80 italic max-w-2xl mx-auto">
                  &ldquo;{about.tagline}&rdquo;
                </p>
              )}
            </AnimateOnScroll>
          </div>
        </section>

        {/* Story Section */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <AnimateOnScroll>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden img-vignette">
                  {about.imageUrl ? (
                    <img src={about.imageUrl} alt={about.imageAlt || 'Our story'}
                      className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
                      alt="Lety Gibbon, owner and head baker"
                      className="w-full h-full object-cover" />
                  )}
                </div>
              </AnimateOnScroll>

              {/* Content */}
              <AnimateOnScroll delay={150}>
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                    Est. 2012
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                    {businessName}
                  </h2>

                  {about.paragraph1 && (
                    <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
                      {about.paragraph1}
                    </p>
                  )}
                  {about.paragraph2 && (
                    <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
                      {about.paragraph2}
                    </p>
                  )}
                  {about.paragraph3 && (
                    <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
                      {about.paragraph3}
                    </p>
                  )}

                  {/* Trust signals */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>12+</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Years Baking</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>1000+</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Cakes Made</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>100%</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Fresh Daily</div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Team Section */}
        {team.length > 0 && (
          <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimateOnScroll className="text-center mb-16">
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                  Meet the Baker
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                  Behind Every Cake
                </h2>
              </AnimateOnScroll>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {team.map((member: any, i: number) => (
                  <AnimateOnScroll key={i} delay={i * 100}>
                    <div className="text-center group">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 mx-auto max-w-[280px] img-vignette">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
        )}

        {/* Values Section */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                Why Choose {businessName}?
              </h2>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Family Recipes', desc: 'Every cake uses recipes passed down through three generations of Italian bakers.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                { title: 'Local Ingredients', desc: 'We source butter, eggs, and honey from North West farms. Fresh means fresh.', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
                { title: 'Hand-Decorated', desc: 'Lety personally decorates every cake. No factory lines, no shortcuts.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
              ].map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="p-6 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)', background: 'var(--color-bg)' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                      <svg className="w-7 h-7" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{item.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
