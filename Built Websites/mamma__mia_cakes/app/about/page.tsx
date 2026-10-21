import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
const AdditionalSections = dynamic(() => import('@/components/AdditionalSections'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export const metadata: Metadata = {
  title: 'About | Mamma & Mia Cakes And Catering',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80)' }} />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative container mx-auto px-4 text-center text-white">
            <h1 className="heading-display mb-4">Our Story</h1>
            <p className="body-text-large max-w-2xl mx-auto">Family recipes, local ingredients, baked with love</p>
          </div>
        </section>
        <About />
        <AdditionalSections />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
