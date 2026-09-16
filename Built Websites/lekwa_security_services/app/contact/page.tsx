import Header from '@/components/Header'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
