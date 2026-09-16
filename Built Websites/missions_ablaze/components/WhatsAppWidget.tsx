'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const businessName = 'Missions Ablaze'
  const whatsappNumber = '27329450185'

  const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=Hi%20' + encodeURIComponent(businessName) + '!%20I%27m%20interested%20in%20your%20services.'

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
          <p className="text-sm text-gray-600 mb-3">Hi! How can we help you today?</p>
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
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  )
}