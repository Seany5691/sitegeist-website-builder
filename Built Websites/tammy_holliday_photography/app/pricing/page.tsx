import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const PricingContent = dynamic(() => import('./PricingContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Pricing & Packages | Tammy Holliday Photography',
  description: 'View our photography packages and pricing. From portrait sessions to full wedding coverage in Gauteng.',
}

export default function PricingPage() {
  return <PricingContent />
}
