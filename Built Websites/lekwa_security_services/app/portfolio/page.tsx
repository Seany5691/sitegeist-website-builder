import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Gallery />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
