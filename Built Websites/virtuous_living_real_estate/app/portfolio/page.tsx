import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const PortfolioContent = dynamic(() => import('./PortfolioContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Portfolio | Virtuous Living Real Estate | Klerksdorp',
  description: 'Browse our portfolio of properties in Klerksdorp and the North West Province. See the homes and communities we serve.',
}

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <PortfolioContent />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
