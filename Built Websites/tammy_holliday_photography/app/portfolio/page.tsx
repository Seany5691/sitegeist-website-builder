import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const PortfolioContent = dynamic(() => import('./PortfolioContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Portfolio | Tammy Holliday Photography',
  description: 'Browse our portfolio of wedding, family, newborn, portrait, and event photography across Gauteng.',
}

export default function PortfolioPage() {
  return <PortfolioContent />
}
