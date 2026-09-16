'use client'

import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })

export default function ContactContent() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">Let's Talk</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>Get in Touch</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              I'd love to hear about your photography needs. Whether you're planning a wedding, expecting a new arrival, or want to capture family memories — let's talk.
            </p>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
