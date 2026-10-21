import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export const metadata: Metadata = {
  title: 'Portfolio | Mamma & Mia Cakes And Catering',
}

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80)' }} />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative container mx-auto px-4 text-center text-white">
            <h1 className="heading-display mb-4">Fresh From Our Ovens</h1>
            <p className="body-text-large max-w-2xl mx-auto">A look at what we've been baking lately</p>
          </div>
        </section>
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
