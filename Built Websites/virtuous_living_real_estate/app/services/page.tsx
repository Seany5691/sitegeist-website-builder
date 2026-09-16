import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ServicesContent = dynamic(() => import('./ServicesContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Services | Virtuous Living Real Estate | Klerksdorp',
  description: 'Explore our property services in Klerksdorp: consultation, residential sales, listings, marketing, and investment solutions. Contact Sean Jordaan on 072 108 3360.',
}

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <ServicesContent />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
