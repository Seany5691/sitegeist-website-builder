import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export const metadata: Metadata = {
  title: 'Contact | Mamma & Mia Cakes And Catering',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80)' }} />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative container mx-auto px-4 text-center text-white">
            <h1 className="heading-display mb-4">Let's Talk Cake</h1>
            <p className="body-text-large max-w-2xl mx-auto">Call us, visit our counter, or fill out the form below</p>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
