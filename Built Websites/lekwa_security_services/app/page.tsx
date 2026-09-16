import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import Faq from '@/components/Faq'
import About from '@/components/About'
import Team from '@/components/Team'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <Testimonials />
        <Faq />
        <About />
        <Team />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
