import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Open_Sans } from 'next/font/google'
import './globals.css'

const headingFont = Nunito({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'serif'],
  adjustFontFallback: false,
  preload: false,
})

const bodyFont = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: false,
  preload: false,
})

export const metadata: Metadata = {
  title: 'Mamma & Mia Cakes | Custom Bakery in North West',
  description: 'Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.',
  keywords: ["custom cakes North West","bakery North West","cupcakes Klerksdorp","wedding cakes Potchefstroom","order cakes online North West"],
  openGraph: {
    title: 'Mamma & Mia Cakes | Custom Bakery in North West',
    description: 'Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mamma & Mia Cakes | Custom Bakery in North West',
    description: 'Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.',
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
      "description": "Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.",
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
      <body className="antialiased" data-temperature="neutral" data-art="editorial">
        {children}
      </body>
    </html>
  )
}
