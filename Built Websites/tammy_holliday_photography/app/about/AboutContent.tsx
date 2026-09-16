'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function AboutContent() {
  const { config } = useSiteData()
  const about = config?.about || {}

  const title = about.title || 'Meet Tammy Holliday'
  const tagline = about.tagline || 'Timeless Moments, Beautifully Captured'
  const p1 = about.paragraph1 || ''
  const p2 = about.paragraph2 || ''
  const p3 = about.paragraph3 || ''
  const imageUrl = about.imageUrl || 'https://tammyholliday.co.za/wp-content/uploads/2015/02/aboutme-cover11.jpg'

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Banner */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">
              {tagline}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {title}
            </h1>
          </div>
        </section>

        {/* About Content */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl img-treated">
                  <img src={imageUrl} alt="Tammy Holliday" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }} />
              </div>

              <div>
                <span className="text-sm font-semibold uppercase tracking-widest mb-4 block"
                  style={{ color: 'var(--color-accent)' }}>About</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                  {title}
                </h2>
                {p1 && <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>{p1}</p>}
                {p2 && <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>{p2}</p>}
                {p3 && <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-muted)' }}>{p3}</p>}

                <div className="grid grid-cols-3 gap-6 pt-6 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}>
                  <div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>500+</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>10+</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Years Experience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>5</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Services Offered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specializations */}
        <section className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-bg) 95%, var(--color-primary))' }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Specializations
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {['Wedding Photography', 'Family & Portrait Sessions', 'Newborn Photography'].map((spec) => (
                <div key={spec} className="p-6 rounded-xl border" style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{spec}</h3>
                </div>
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
