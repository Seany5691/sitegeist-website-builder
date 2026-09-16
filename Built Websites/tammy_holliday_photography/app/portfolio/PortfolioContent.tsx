'use client'

import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })

export default function PortfolioContent() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">Our Work</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>Portfolio</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Browse through our collection of work spanning weddings, families, newborns, couples, portraits, and more across Gauteng.
            </p>
          </div>
        </section>
        <Gallery />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
