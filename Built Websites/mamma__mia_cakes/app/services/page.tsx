import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const CtaBanner = dynamic(() => import('@/components/CtaBanner'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export const metadata: Metadata = {
  title: 'Services | Mamma & Mia Cakes And Catering',
}

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1920&q=80)' }} />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative container mx-auto px-4 text-center text-white">
            <h1 className="heading-display mb-4">What We Bake</h1>
            <p className="body-text-large max-w-2xl mx-auto">From daily treats to milestone cakes, we bake for every moment</p>
          </div>
        </section>
        <Services />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
