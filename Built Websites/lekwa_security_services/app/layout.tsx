import type { Metadata } from 'next'
import { Oswald } from 'next/font/google'
import { Inter } from 'next/font/google'
import MotionProvider from '@/components/MotionProvider'
import './globals.css'

const headingFont = Oswald({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lekwa Security Services | Lephalale Armed Response & Guarding',
  description: 'Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today.',
  keywords: ["Lephalale security services","armed response Lephalale","security company Limpopo","drone surveillance","static guarding Lephalale","business security Lephalale","John Mashigo security","24/7 security Lephalale."],
  openGraph: {
    title: 'Lekwa Security Services | Lephalale Armed Response & Guarding',
    description: 'Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lekwa Security Services | Lephalale Armed Response & Guarding',
    description: 'Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Lekwa Security Services",
      "description": "Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today.",
      "telephone": "27140040336",
      "email": "contact@lekwasecurityservices.co.za",
      "address": {
            "@type": "PostalAddress",
            "streetAddress": "Lephalale",
            "addressLocality": "Lephalale",
            "addressCountry": "ZA"
      }
})
          }}
        />
      </head>
      <body className="antialiased">
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
