import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Inter } from 'next/font/google'
import './globals.css'

const headingFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'serif'],
  adjustFontFallback: false,
  preload: false,
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: false,
  preload: false,
})

export const metadata: Metadata = {
  title: 'Virtuous Living Real Estate | Klerksdorp Property Experts',
  description: 'Virtuous Living Real Estate in Klerksdorp offers expert property consultation, sales, and investment solutions. Contact owner Sean Jordaan on 072 108 3360 today.',
  keywords: ["Klerksdorp real estate","property for sale Klerksdorp","Virtuous Living Real Estate","Sean Jordaan real estate","homes for sale Klerksdorp","property consultation Klerksdorp","North West Province property","first-time homebuyer Klerksdorp"],
  openGraph: {
    title: 'Virtuous Living Real Estate | Klerksdorp Property Experts',
    description: 'Virtuous Living Real Estate in Klerksdorp offers expert property consultation, sales, and investment solutions. Contact owner Sean Jordaan on 072 108 3360 today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtuous Living Real Estate | Klerksdorp Property Experts',
    description: 'Virtuous Living Real Estate in Klerksdorp offers expert property consultation, sales, and investment solutions. Contact owner Sean Jordaan on 072 108 3360 today.',
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
      "name": "Virtuous Living Real Estate",
      "description": "Virtuous Living Real Estate in Klerksdorp offers expert property consultation, sales, and investment solutions. Contact owner Sean Jordaan on 072 108 3360 today.",
      "telephone": "27721083360",
      "email": "",
      "address": {
            "@type": "PostalAddress",
            "streetAddress": "Klerksdorp",
            "addressLocality": "Klerksdorp",
            "addressCountry": "ZA"
      }
})
          }}
        />
      </head>
      <body className="antialiased" data-temperature="neutral">
        {children}
      </body>
    </html>
  )
}
