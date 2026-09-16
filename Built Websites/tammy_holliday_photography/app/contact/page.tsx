import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const ContactContent = dynamic(() => import('./ContactContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Contact Us | Tammy Holliday Photography',
  description: 'Get in touch with Tammy Holliday Photography. Book your session, check availability, or ask a question.',
}

export default function ContactPage() {
  return <ContactContent />
}
