import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Website Builder Engine | Sitegeist',
  description: 'AI-powered website builder that scrapes existing sites and generates modern, high-converting static websites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}