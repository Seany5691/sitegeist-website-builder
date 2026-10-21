import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const headingFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const bodyFont = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mamma & Mia Cakes & Catering | Bakery North West',
  description: 'Artisan bakery in North West crafting custom cakes, fresh daily pastries, and catering. Family recipes, local ingredients. Call 072 156 5654 to order.',
  keywords: ["bakery North West","custom cakes North West","catering North West","fresh bread North West","wedding cakes"],
  openGraph: {
    title: 'Mamma & Mia Cakes & Catering | Bakery North West',
    description: 'Artisan bakery in North West crafting custom cakes, fresh daily pastries, and catering. Family recipes, local ingredients. Call 072 156 5654 to order.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mamma & Mia Cakes & Catering | Bakery North West',
    description: 'Artisan bakery in North West crafting custom cakes, fresh daily pastries, and catering. Family recipes, local ingredients. Call 072 156 5654 to order.',
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
      "name": "Mamma & Mia Cakes And Catering",
      "description": "Artisan bakery in North West crafting custom cakes, fresh daily pastries, and catering. Family recipes, local ingredients. Call 072 156 5654 to order.",
      "telephone": "27721565654",
      "email": "",
      "address": {
            "@type": "PostalAddress",
            "streetAddress": "North West",
            "addressLocality": "North West",
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
