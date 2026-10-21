import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tammy Holliday Photography | Wedding, Maternity & Family Photographer in Gauteng',
  description: 'Professional photographer in Gauteng specializing in weddings, maternity, newborns, families, and matric portraits. 10+ years experience capturing life\'s precious moments. Book your session today.',
  keywords: ['photographer Gauteng', 'wedding photographer Gauteng', 'maternity photographer', 'newborn photography Gauteng', 'family portraits Gauteng', 'matric photographer', 'Tammy Holliday Photography', 'couples photography', 'cake smash photography'],
  authors: [{ name: 'Tammy Holliday Photography' }],
  openGraph: {
    title: 'Tammy Holliday Photography | Professional Photographer in Gauteng',
    description: 'Capturing life\'s precious moments across Gauteng. Weddings, maternity, newborns, families, and more. 10+ years experience.',
    type: 'website',
    locale: 'en_ZA',
    url: 'https://tammyholliday.co.za',
    siteName: 'Tammy Holliday Photography',
    images: [
      {
        url: '/uploads/tammy_holliday_photography/hero/hero.webp',
        width: 1200,
        height: 630,
        alt: 'Tammy Holliday Photography - Professional Photographer in Gauteng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tammy Holliday Photography | Gauteng Photographer',
    description: 'Professional photographer specializing in weddings, maternity, newborns, and family portraits. Serving Gauteng for 10+ years.',
    images: ['/uploads/tammy_holliday_photography/hero/hero.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/uploads/tammy_holliday_photography/logo/logo.webp',
    apple: '/uploads/tammy_holliday_photography/logo/logo.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        <link rel="canonical" href="https://tammyholliday.co.za" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Tammy Holliday Photography",
              "description": "Professional photography services specializing in weddings, maternity, newborns, families, matric portraits, and special events.",
              "telephone": "+27834799732",
              "email": "letsmeet@tammyholliday.co.za",
              "url": "https://tammyholliday.co.za",
              "image": "/uploads/tammy_holliday_photography/logo/logo.webp",
              "priceRange": "R",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Gauteng",
                "addressCountry": "ZA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-26.2041",
                "longitude": "28.0473"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "50"
              },
              "areaServed": {
                "@type": "State",
                "name": "Gauteng"
              }
            })
          }}
        />
      </head>
      <body className={lato.className}>{children}</body>
    </html>
  )
}
