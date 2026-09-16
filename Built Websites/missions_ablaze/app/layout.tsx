import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { Montserrat } from 'next/font/google'
import './globals.css'

const headingFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'serif'],
  adjustFontFallback: false,
  preload: false,
})

const bodyFont = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: false,
  preload: false,
})

export const metadata: Metadata = {
  title: 'Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN',
  description: 'Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.',
  keywords: ["Tongaat charity","food parcels KwaZulu-Natal","community kitchen Tongaat","Missions Ablaze","donate food aid KZN","NPO Tongaat","volunteer Tongaat"],
  openGraph: {
    title: 'Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN',
    description: 'Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN',
    description: 'Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.',
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
      "name": "Missions Ablaze",
      "description": "Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.",
      "telephone": "27329450185",
      "email": "ablaze@missionsablaze.org.za",
      "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tongaat, KwaZulu-Natal",
            "addressLocality": "Tongaat, KwaZulu-Natal",
            "addressCountry": "ZA"
      }
})
          }}
        />
      </head>
      <body className="antialiased" data-temperature="neutral" data-art="warm-organic">
        {children}
      </body>
    </html>
  )
}
