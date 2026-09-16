import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ContactContent = dynamic(() => import('./ContactContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Contact Us | Virtuous Living Real Estate | Klerksdorp',
  description: 'Contact Sean Jordaan at Virtuous Living Real Estate in Klerksdorp. Call 072 108 3360 for property consultation, sales, and investment advice.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <ContactContent />
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
