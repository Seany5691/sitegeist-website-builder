import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import { Inter } from 'next/font/google'
import './globals.css'

const headingFont = Playfair_Display({
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
  title: 'Tammy Holliday Photography | Gauteng Wedding & Portrait Photographer',
  description: 'Professional photographer in Gauteng specializing in weddings, families, newborns, and portraits. Tammy Holliday captures timeless moments with a classic, personalized approach. Book your session today.',
  keywords: ["Gauteng photographer","wedding photographer Gauteng","family portraits","newborn photography","Tammy Holliday Photography","professional photographer South Africa"],
  openGraph: {
    title: 'Tammy Holliday Photography | Gauteng Wedding & Portrait Photographer',
    description: 'Professional photographer in Gauteng specializing in weddings, families, newborns, and portraits. Tammy Holliday captures timeless moments with a classic, personalized approach. Book your session today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tammy Holliday Photography | Gauteng Wedding & Portrait Photographer',
    description: 'Professional photographer in Gauteng specializing in weddings, families, newborns, and portraits. Tammy Holliday captures timeless moments with a classic, personalized approach. Book your session today.',
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
      "name": "Tammy Holliday Photography",
      "description": "Professional photographer in Gauteng specializing in weddings, families, newborns, and portraits. Tammy Holliday captures timeless moments with a classic, personalized approach. Book your session today.",
      "telephone": "27834799732",
      "email": "letsmeet@tammyholliday.co.za",
      "address": {
            "@type": "PostalAddress",
            "streetAddress": "2020\n\nOctober 10, 2019",
            "addressLocality": "Gauteng",
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
