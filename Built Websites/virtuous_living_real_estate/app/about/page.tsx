import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const AboutContent = dynamic(() => import('./AboutContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'About Us | Virtuous Living Real Estate | Klerksdorp',
  description: 'Learn about Virtuous Living Real Estate, founded by Sean Jordaan in Klerksdorp. Built on integrity, driven by results in the North West Province property market.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <AboutContent />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
