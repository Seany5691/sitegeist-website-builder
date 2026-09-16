import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const AboutContent = dynamic(() => import('./AboutContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'About Tammy Holliday | Gauteng Photographer',
  description: 'Meet Tammy Holliday — a passionate Gauteng photographer specializing in weddings, families, newborns, and portraits.',
}

export default function AboutPage() {
  return (
    <main className="pt-20">
      <AboutContent />
    </main>
  )
}
