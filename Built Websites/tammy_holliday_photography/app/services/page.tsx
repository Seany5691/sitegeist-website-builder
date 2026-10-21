'use client'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <Services />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
