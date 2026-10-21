'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useSiteData } from '@/lib/use-site-data'
import { useFloatingRightOffset } from '@/lib/floating-stack'

export default function WhatsAppWidget() {
  const { config } = useSiteData()
  const [isOpen, setIsOpen] = useState(false)

  const businessName = config?.businessName || 'Business'
  const contactPhone = config?.contact?.phone || ''
  const wa = config?.whatsapp || {}
  const enabled = wa.enabled !== false

  // Prefer dedicated whatsapp number, fall back to main phone (digits only)
  const rawNumber = wa.number || contactPhone
  const whatsappNumber = String(rawNumber).replace(/\D/g, '')
  const greeting = wa.greeting || `Hi! How can we help you today?`
  const prefill = wa.prefill || `Hi ${businessName}! I'm interested in your services.`

  // Sits on the same floating stack as the feature FABs.
  const bottom = useFloatingRightOffset('whatsapp')

  if (!enabled || !whatsappNumber) return null

  const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(prefill)

  return (
    <div className="fixed z-50" style={{ bottom, right: '1.25rem' }}>
      {/* Chat Bubble */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-xl p-4 w-72">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">{businessName}</p>
              <p className="text-xs text-gray-500">Typically replies instantly</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{greeting}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Start Chat
          </a>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  )
}
