import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const ServicesContent = dynamic(() => import('./ServicesContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Photography Services | Tammy Holliday Photography',
  description: 'Explore our photography services in Gauteng — weddings, family portraits, newborn sessions, matric dance, cake smash, and event coverage.',
}

export default function ServicesPage() {
  return <ServicesContent />
}
